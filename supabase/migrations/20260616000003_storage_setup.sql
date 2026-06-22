-- ============================================================================
-- Kanso — Storage
-- Public bucket for web-optimized product imagery (WebP/AVIF).
-- Reads are public (bucket flag); uploads are performed via the service role
-- (admin tooling), so no anon/authenticated write policy is granted.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
