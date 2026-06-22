-- ============================================================================
-- IndepCommerce — Row Level Security (tenant-aware)
-- Public storefront reads (published catalog) for everyone; writes restricted
-- to each tenant's admins. Payment secrets never reach anon/authenticated.
-- Guest orders are created server-side with the service role (bypasses RLS).
-- ============================================================================

alter table public.tenants               enable row level security;
alter table public.profiles              enable row level security;
alter table public.tenant_members        enable row level security;
alter table public.products              enable row level security;
alter table public.product_images        enable row level security;
alter table public.inventory             enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.tenant_payment_config enable row level security;

-- ---- tenants: public can resolve active tenants (slug → branding) ----
create policy "Public can view active tenants"
  on public.tenants for select using (status = 'active');
create policy "Tenant admins manage their tenant"
  on public.tenants for all to authenticated
  using (public.is_tenant_admin(id)) with check (public.is_tenant_admin(id));

-- ---- profiles: own row only (insert handled by trigger) ----
create policy "Users view own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- ---- tenant_members ----
create policy "Members see their memberships"
  on public.tenant_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_tenant_admin(tenant_id));
create policy "Tenant admins manage members"
  on public.tenant_members for all to authenticated
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- ---- products: public read of published; admins manage own tenant ----
create policy "Public can view published products"
  on public.products for select using (status = 'published');
create policy "Tenant admins manage products"
  on public.products for all to authenticated
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- ---- product_images (scoped via parent product) ----
create policy "Public can view images of published products"
  on public.product_images for select using (
    exists (select 1 from public.products p
            where p.id = product_id and p.status = 'published')
  );
create policy "Tenant admins manage product images"
  on public.product_images for all to authenticated
  using (exists (select 1 from public.products p
                 where p.id = product_id and public.is_tenant_admin(p.tenant_id)))
  with check (exists (select 1 from public.products p
                 where p.id = product_id and public.is_tenant_admin(p.tenant_id)));

-- ---- inventory (scoped via parent product) ----
create policy "Public can view inventory of published products"
  on public.inventory for select using (
    exists (select 1 from public.products p
            where p.id = product_id and p.status = 'published')
  );
create policy "Tenant admins manage inventory"
  on public.inventory for all to authenticated
  using (exists (select 1 from public.products p
                 where p.id = product_id and public.is_tenant_admin(p.tenant_id)))
  with check (exists (select 1 from public.products p
                 where p.id = product_id and public.is_tenant_admin(p.tenant_id)));

-- ---- orders: tenant admins manage their tenant's; users see own ----
create policy "Tenant admins view orders"
  on public.orders for select to authenticated
  using (public.is_tenant_admin(tenant_id));
create policy "Users view own orders"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Tenant admins update orders"
  on public.orders for update to authenticated
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

create policy "View order items via order"
  on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o
                 where o.id = order_id
                   and (public.is_tenant_admin(o.tenant_id)
                        or o.user_id = (select auth.uid()))));

-- ---- tenant_payment_config: admins manage; NO public/anon access ----
-- (mp_access_token is read server-side via the service role only.)
create policy "Tenant admins manage payment config"
  on public.tenant_payment_config for all to authenticated
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));
