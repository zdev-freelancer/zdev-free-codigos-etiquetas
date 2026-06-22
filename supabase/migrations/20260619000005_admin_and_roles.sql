-- ============================================================================
-- Admin role + product management access
-- Adds an is_admin flag to profiles and RLS policies that let admins write to
-- the catalog. Admin writes go through the authenticated session (no service
-- role key required).
-- ============================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- SECURITY INVOKER: a user can always read their own profile row under RLS,
-- so this avoids the SECURITY DEFINER advisor warning and any recursion.
create or replace function public.is_admin()
returns boolean
language sql
security invoker
stable
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

-- ---- Catalog write access for admins (additive to public-read policies) ----
create policy "Admins can manage products"
  on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage product images"
  on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage inventory"
  on public.inventory for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- Admins can review orders ----
create policy "Admins can view all orders"
  on public.orders for select to authenticated
  using (public.is_admin());

create policy "Admins can update orders"
  on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
