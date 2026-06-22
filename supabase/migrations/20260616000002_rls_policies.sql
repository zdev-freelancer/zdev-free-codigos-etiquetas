-- ============================================================================
-- Kanso — Row Level Security
-- Public read for catalog data (products, images, inventory).
-- Authenticated users own their profile and orders.
-- Guest orders are created server-side with the service role, which bypasses RLS.
-- `(select auth.uid())` is used so the call is cached per-statement (initplan).
-- ============================================================================

alter table public.profiles       enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory      enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- ---- products: public read ----
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

-- ---- product_images: public read ----
create policy "Product images are viewable by everyone"
  on public.product_images for select
  using (true);

-- ---- inventory: public read (storefront availability) ----
create policy "Inventory is viewable by everyone"
  on public.inventory for select
  using (true);

-- ---- profiles: each user manages only their own row ----
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---- orders: authenticated users own their orders ----
create policy "Users can view their own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own orders"
  on public.orders for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- ---- order_items: scoped through the owning order ----
create policy "Users can view items from their own orders"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

create policy "Users can add items to their own orders"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );
