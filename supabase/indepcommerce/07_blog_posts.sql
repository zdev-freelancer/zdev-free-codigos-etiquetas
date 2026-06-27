-- ============================================================================
-- IndepCommerce — Blog posts (block-based content) per tenant
-- Mirrors migration indepcommerce_11_blog_posts. `blocks` is a jsonb array of
-- typed blocks (heading | paragraph | image | video | quote — see config/blog.ts).
-- Images upload to the existing `product-images` bucket via signed URLs.
-- ============================================================================

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text,
  cover_image text,
  blocks jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

alter table public.blog_posts
  add constraint blog_posts_status_check check (status in ('draft', 'published'));

create index blog_posts_tenant_idx
  on public.blog_posts (tenant_id, status, published_at desc);

create trigger blog_posts_set_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

create policy "Public can view published posts"
  on public.blog_posts for select using (status = 'published');

create policy "Tenant admins manage posts"
  on public.blog_posts for all to authenticated
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));
