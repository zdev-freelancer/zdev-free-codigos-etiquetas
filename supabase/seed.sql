-- ============================================================================
-- Kanso — Seed data
-- Premium placeholder catalog. Product/material names in English; marketing
-- copy in Spanish (es-PE) for the Lima storefront. Prices in PEN.
-- Idempotent: safe to re-run.
-- ============================================================================

insert into public.products
  (slug, name, description, price, currency, material, compatibility, collection, is_featured)
values
  (
    'aramid-ultra-case',
    'Aramid Ultra Case',
    'Estructura de fibra de aramida tejida a 0.8 mm. Protección estructural sin volumen, con tacto técnico y compatibilidad MagSafe nativa.',
    219.00, 'PEN', 'Aramid Fiber',
    array['iPhone 16 Pro', 'iPhone 16 Pro Max'], 'cases', true
  ),
  (
    'full-grain-leather-case',
    'Full-Grain Leather Case',
    'Cuero full-grain curtido vegetal que desarrolla pátina con el uso. Costuras internas selladas y forro de microfibra.',
    289.00, 'PEN', 'Premium Full-Grain Leather',
    array['iPhone 16', 'iPhone 16 Pro'], 'cases', true
  ),
  (
    'anodized-aluminum-desk-stand',
    'Anodized Aluminum Desk Stand',
    'Bloque de aluminio fresado y anodizado en una sola pieza. Ángulo fijo de 60° optimizado para StandBy y carga MagSafe.',
    349.00, 'PEN', 'Milled Anodized Aluminum',
    array['iPhone 15', 'iPhone 16', 'MagSafe'], 'stands', true
  ),
  (
    'titanium-fold-stand',
    'Titanium Fold Stand',
    'Soporte plegable de titanio grado 5. Perfil de 4 mm que se guarda plano y sostiene iPhone o iPad con estabilidad total.',
    459.00, 'PEN', 'Grade 5 Titanium',
    array['iPhone', 'iPad'], 'stands', false
  ),
  (
    'magsafe-minimal-charger',
    'MagSafe Minimal Charger',
    'Cargador inalámbrico minimalista de aluminio anodizado con base de silicona. Alineación magnética precisa, cable trenzado de 1.5 m.',
    199.00, 'PEN', 'Anodized Aluminum',
    array['iPhone 15', 'iPhone 16', 'MagSafe'], 'charging', true
  ),
  (
    'three-in-one-charging-pad',
    '3-in-1 Charging Pad',
    'Estación de carga para iPhone, Apple Watch y AirPods. Superficie de aluminio con detalle en cuero vegano y gestión de cable integrada.',
    529.00, 'PEN', 'Aluminum / Vegan Leather',
    array['iPhone', 'Apple Watch', 'AirPods'], 'charging', false
  ),
  (
    'premium-desk-mat',
    'Premium Desk Mat',
    'Tapete de escritorio en cuero full-grain de 3 mm con base antideslizante. Bordes biselados a mano y superficie resistente a líquidos.',
    269.00, 'PEN', 'Full-Grain Leather',
    array['Universal'], 'desk', false
  ),
  (
    'cable-management-set',
    'Cable Management Set',
    'Set de organizadores de cable en aluminio anodizado con núcleo magnético. Mantiene el escritorio limpio y los cables siempre a mano.',
    89.00, 'PEN', 'Anodized Aluminum',
    array['Universal'], 'desk', false
  )
on conflict (slug) do nothing;

-- Product imagery (monochrome placeholders until real assets land in Storage).
insert into public.product_images (product_id, image_url, alt_text, display_order)
select
  p.id,
  'https://placehold.co/1200x1200/0a0a0a/f5f5f7/png?text=' || replace(p.name, ' ', '+'),
  p.name,
  0
from public.products p
where not exists (
  select 1 from public.product_images pi where pi.product_id = p.id
);

-- Inventory: one row per product.
insert into public.inventory (product_id, stock_level)
select p.id, 25
from public.products p
where not exists (
  select 1 from public.inventory i where i.product_id = p.id
);
