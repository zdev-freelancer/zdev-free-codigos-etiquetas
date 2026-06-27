-- ============================================================================
-- IndepCommerce — Editable home-page content per tenant
-- Mirrors migration indepcommerce_09_home_content. Managed from /admin/content;
-- the storefront home renders it with safe defaults (see config/home-content.ts).
-- Tenant admins can update it via the existing "Tenant admins manage their
-- tenant" RLS policy on public.tenants.
-- ============================================================================

alter table public.tenants
  add column if not exists home_content jsonb not null default '{}'::jsonb;
