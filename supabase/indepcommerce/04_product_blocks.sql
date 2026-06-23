-- ============================================================================
-- IndepCommerce — Per-product configurable info blocks, pricing mode, downloads
-- Apply after 01–03. Mirrors migration indepcommerce_08_product_blocks.
-- ============================================================================

alter table public.products
  add column if not exists pricing_mode text not null default 'fixed',
  add column if not exists show_description boolean not null default true,
  add column if not exists show_specs boolean not null default true,
  add column if not exists show_downloads boolean not null default true,
  add column if not exists downloads jsonb not null default '[]'::jsonb;

alter table public.products
  drop constraint if exists products_pricing_mode_check;
alter table public.products
  add constraint products_pricing_mode_check check (pricing_mode in ('fixed', 'quote'));

-- ----------------------------------------------------------------------------
-- Public bucket for downloadable product files (datasheets, manuals, etc.).
-- Uploads go via service-role signed URLs; downloads are public object URLs.
-- No broad SELECT policy (avoids bucket listing); per-tenant write policies:
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', true)
on conflict (id) do nothing;

create policy "Tenant admins upload product files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-files'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_tenant_admin((split_part(name, '/', 1))::uuid)
  );
create policy "Tenant admins update product files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-files'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_tenant_admin((split_part(name, '/', 1))::uuid)
  );
create policy "Tenant admins delete product files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-files'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_tenant_admin((split_part(name, '/', 1))::uuid)
  );
