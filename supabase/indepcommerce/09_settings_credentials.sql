-- ============================================================================
-- IndepCommerce — Tenant settings / credentials (self-managed from /admin/settings)
-- Mirrors migration indepcommerce_13_settings_credentials.
--
-- Public (storefront-readable) settings live on `tenants`; the app reads them at
-- runtime so the client can change them without a redeploy (GA, social, contact).
-- Server-only secrets (Brevo, MP) live on `tenant_payment_config` (admin RLS, no
-- anon access) and are read server-side only.
-- ============================================================================

alter table public.tenants
  add column if not exists ga_id text,
  add column if not exists whatsapp text,
  add column if not exists social jsonb not null default '{}'::jsonb,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists address text;

alter table public.tenant_payment_config
  add column if not exists brevo_api_key text,
  add column if not exists brevo_sender_email text,
  add column if not exists brevo_sender_name text,
  add column if not exists email_subject text,
  add column if not exists email_body text;
