-- ============================================================================
-- Kanso — Initial schema
-- Premium Apple-ecosystem accessories store on Postgres (Supabase).
-- ============================================================================

-- Required for gen_random_uuid().
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered');
create type public.currency_code as enum ('PEN', 'USD');

-- ----------------------------------------------------------------------------
-- Utility: keep an updated_at column in sync on update.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — 1:1 with auth.users
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  -- Structured for Lima deliveries: { line1, line2, district, city, reference }.
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  currency public.currency_code not null default 'PEN',
  -- Catalog filters: Material, Compatibility, Collection.
  material text,
  compatibility text[] not null default '{}',
  collection text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_collection_idx on public.products (collection);
create index products_material_idx on public.products (material);
create index products_is_featured_idx on public.products (is_featured) where is_featured;
create index products_compatibility_idx on public.products using gin (compatibility);

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int not null default 0
);

create index product_images_product_id_idx
  on public.product_images (product_id, display_order);

-- ----------------------------------------------------------------------------
-- inventory — 1:1 with products
-- ----------------------------------------------------------------------------
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products (id) on delete cascade,
  stock_level int not null default 0 check (stock_level >= 0),
  updated_at timestamptz not null default now()
);

create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- orders — user_id is nullable to support guest checkout
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status public.order_status not null default 'pending',
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  currency public.currency_code not null default 'PEN',
  -- Guest contact + delivery details (also populated for registered users).
  email text,
  full_name text,
  phone text,
  shipping_address jsonb,
  shipping_district text,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity int not null check (quantity > 0),
  -- Snapshot of the unit price at purchase time for historical accuracy.
  price_at_purchase numeric(10, 2) not null check (price_at_purchase >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
