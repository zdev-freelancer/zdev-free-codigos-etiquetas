-- ============================================================================
-- IndepCommerce — Production hardening: order lifecycle, payments, storage
-- Apply after 01_schema.sql + 02_rls.sql. Mirrors migrations 04–07.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Per-tenant Mercado Pago webhook secret (for x-signature verification)
-- ----------------------------------------------------------------------------
alter table public.tenant_payment_config
  add column if not exists mp_webhook_secret text;

-- ----------------------------------------------------------------------------
-- Order lifecycle — atomic, idempotent, oversell-safe. Called server-side via
-- the service role (Mercado Pago webhook), never by anon/authenticated.
-- ----------------------------------------------------------------------------
create or replace function public.mark_order_paid(
  p_order_id uuid,
  p_payment_reference text default null
)
returns public.order_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.order_status;
begin
  select status into v_status from public.orders where id = p_order_id for update;

  if v_status is null then
    raise exception 'Order % not found', p_order_id;
  end if;

  if v_status <> 'pending' then
    return v_status;  -- idempotent
  end if;

  -- Reject if any line would oversell.
  if exists (
    select 1
    from (
      select product_id, sum(quantity) as qty
      from public.order_items
      where order_id = p_order_id
      group by product_id
    ) need
    join public.inventory inv on inv.product_id = need.product_id
    where inv.stock_level < need.qty
  ) then
    raise exception 'Insufficient stock for order %', p_order_id;
  end if;

  update public.inventory i
  set stock_level = i.stock_level - need.qty
  from (
    select product_id, sum(quantity) as qty
    from public.order_items
    where order_id = p_order_id
    group by product_id
  ) need
  where i.product_id = need.product_id;

  update public.orders
  set status = 'paid',
      payment_reference = coalesce(p_payment_reference, payment_reference)
  where id = p_order_id;

  return 'paid';
end;
$$;

create or replace function public.mark_order_failed(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- No 'cancelled' enum value yet; a failed payment simply stays pending.
  update public.orders
  set status = 'pending'
  where id = p_order_id and status = 'pending';
end;
$$;

revoke execute on function public.mark_order_paid(uuid, text) from anon, authenticated, public;
revoke execute on function public.mark_order_failed(uuid) from anon, authenticated, public;
grant execute on function public.mark_order_paid(uuid, text) to service_role;
grant execute on function public.mark_order_failed(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- Storage — public bucket for product images, keyed under "<tenant_id>/...".
-- No broad SELECT policy: public buckets serve object URLs without one, and
-- omitting it prevents clients from listing the bucket.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Tenant admins upload product images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_tenant_admin((split_part(name, '/', 1))::uuid)
  );

create policy "Tenant admins update product images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_tenant_admin((split_part(name, '/', 1))::uuid)
  );

create policy "Tenant admins delete product images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_tenant_admin((split_part(name, '/', 1))::uuid)
  );
