-- ============================================================================
-- IndepCommerce — Editable "Quiénes somos" content + per-product specs table
-- Mirrors migration indepcommerce_12_about_and_specs.
--   tenants.about_content  jsonb { eyebrow, title, intro, blocks[] }
--   products.specs         jsonb [{ label, value, visible }] — independent
--                          visibility per row (medidas, material, etc.)
-- ============================================================================

alter table public.tenants
  add column if not exists about_content jsonb not null default '{}'::jsonb;

alter table public.products
  add column if not exists specs jsonb not null default '[]'::jsonb;
