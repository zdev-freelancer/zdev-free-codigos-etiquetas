-- ============================================================================
-- IndepCommerce — Orders: sales vs quotes, fulfillment + customer tracking
-- Mirrors migration indepcommerce_10_orders_tracking.
--   kind            'sale' | 'quote'
--   fulfillment     'shipping' | 'pickup' (admin-set; defines the status flow)
--   tracking_status customer-facing fulfillment state (see config/orders.ts)
--   tracking_code   short public code for /rastreo lookups
--   notes           quote message / internal note
-- ============================================================================

alter table public.orders
  add column if not exists kind text not null default 'sale',
  add column if not exists fulfillment text,
  add column if not exists tracking_status text,
  add column if not exists tracking_code text,
  add column if not exists notes text;

alter table public.orders drop constraint if exists orders_kind_check;
alter table public.orders
  add constraint orders_kind_check check (kind in ('sale', 'quote'));

alter table public.orders drop constraint if exists orders_fulfillment_check;
alter table public.orders
  add constraint orders_fulfillment_check
  check (fulfillment is null or fulfillment in ('shipping', 'pickup'));

create index if not exists orders_tenant_kind_idx
  on public.orders (tenant_id, kind, created_at desc);
create unique index if not exists orders_tracking_code_idx
  on public.orders (tenant_id, tracking_code) where tracking_code is not null;
