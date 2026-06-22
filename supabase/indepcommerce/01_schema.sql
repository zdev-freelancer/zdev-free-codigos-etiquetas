-- ============================================================================
-- IndepCommerce — Multitenant schema (fresh project in IndepSoft)
-- Pooled multitenancy: shared tables, tenant_id column, RLS isolation.
-- Apply order: 01_schema.sql → 02_rls.sql → seed (tenant #1 + admin).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered');
create type public.currency_code as enum ('PEN', 'USD');
create type public.tenant_role as enum ('owner', 'admin');

-- ----------------------------------------------------------------------------
-- updated_at helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- tenants — one row per store
-- ----------------------------------------------------------------------------
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                 -- used in /s/[slug]
  name text not null,
  custom_domain text unique,                 -- optional future custom domain
  logo_url text,
  theme jsonb not null default '{}',         -- { accent, accent2, ... }
  default_currency public.currency_code not null default 'PEN',
  status text not null default 'active',     -- active | suspended
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger tenants_set_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- profiles — 1:1 with auth.users (platform-level)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- tenant_members — which users administer which tenants
-- ----------------------------------------------------------------------------
create table public.tenant_members (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.tenant_role not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
create index tenant_members_user_idx on public.tenant_members (user_id);

-- Membership check (SECURITY DEFINER avoids RLS recursion in policies).
create or replace function public.is_tenant_admin(p_tenant uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.tenant_members m
    where m.tenant_id = p_tenant and m.user_id = (select auth.uid())
  );
$$;

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  currency public.currency_code not null default 'PEN',
  material text,
  compatibility text[] not null default '{}',
  collection text,
  is_featured boolean not null default false,
  status text not null default 'published',  -- published | draft
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)                    -- slugs unique per tenant
);
create index products_tenant_idx on public.products (tenant_id);
create index products_tenant_collection_idx on public.products (tenant_id, collection);
create index products_featured_idx on public.products (tenant_id, is_featured) where is_featured;

-- ----------------------------------------------------------------------------
-- product_images / inventory
-- ----------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int not null default 0
);
create index product_images_product_idx on public.product_images (product_id, display_order);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products (id) on delete cascade,
  stock_level int not null default 0 check (stock_level >= 0),
  updated_at timestamptz not null default now()
);
create trigger inventory_set_updated_at before update on public.inventory
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- orders / order_items
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  status public.order_status not null default 'pending',
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  currency public.currency_code not null default 'PEN',
  email text,
  full_name text,
  phone text,
  shipping_address jsonb,
  shipping_district text,
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now()
);
create index orders_tenant_idx on public.orders (tenant_id);
create index orders_user_idx on public.orders (user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity int not null check (quantity > 0),
  price_at_purchase numeric(10, 2) not null check (price_at_purchase >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- tenant_payment_config — per-tenant Mercado Pago credentials (server-only)
-- ----------------------------------------------------------------------------
create table public.tenant_payment_config (
  tenant_id uuid primary key references public.tenants (id) on delete cascade,
  mp_access_token text,   -- SECRET — read only server-side (service role)
  mp_public_key text,
  updated_at timestamptz not null default now()
);
create trigger tpc_set_updated_at before update on public.tenant_payment_config
  for each row execute function public.set_updated_at();

-- Hardening: keep trigger-only / definer helpers off the public RPC surface.
revoke execute on function public.set_updated_at() from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
-- is_tenant_admin is used inside RLS policies by the `authenticated` role (it must
-- keep EXECUTE there). Revoke the default PUBLIC grant (which also covers anon) and
-- grant only the roles that need it. (anon never calls it.)
revoke execute on function public.is_tenant_admin(uuid) from public, anon;
grant execute on function public.is_tenant_admin(uuid) to authenticated, service_role;
