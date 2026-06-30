import { cache } from "react";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/types/database.types";

export type Tenant = Tables<"tenants">;

/** Cache tag for every tenant row read — revalidated when settings/content change. */
export const TENANT_TAG = "tenant";

/** Shape of the `tenants.theme` JSON column (all optional). */
export interface TenantTheme {
  accent?: string;
  accent2?: string;
  [key: string]: string | undefined;
}

/**
 * Cross-request cache for the tenant row. Uses the service-role client (no
 * cookies) so it can live in Next's data cache instead of hitting Supabase on
 * every request — the tenant row only holds public columns and changes rarely.
 * Invalidated on demand via `revalidateTag(TENANT_TAG)` when the admin saves
 * settings or content. Keyed by slug.
 */
const loadTenantBySlug = unstable_cache(
  async (slug: string): Promise<Tenant | null> => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("tenants")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  },
  ["tenant-by-slug"],
  { revalidate: 300, tags: [TENANT_TAG] },
);

/**
 * Resolve a storefront tenant by its URL slug. `cache()` dedupes within a single
 * render; `unstable_cache` shares the result across requests (see above).
 * Public read — only `status = 'active'` tenants resolve.
 */
export const getTenantBySlug = cache(
  (slug: string): Promise<Tenant | null> => loadTenantBySlug(slug),
);

/** Resolve a tenant by slug or render the 404 page. */
export async function requireTenant(slug: string): Promise<Tenant> {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  return tenant;
}

/**
 * The tenant THIS front is bound to. One deploy = one tenant: the slug comes
 * from `NEXT_PUBLIC_DEFAULT_TENANT`, set per deployment. Every storefront query
 * filters by this tenant's id (the shared publishable key does not isolate
 * tenants on its own). Cached per request.
 */
export const getCurrentTenant = cache(async (): Promise<Tenant> => {
  const slug = process.env.NEXT_PUBLIC_DEFAULT_TENANT;
  if (!slug) {
    throw new Error(
      "Missing NEXT_PUBLIC_DEFAULT_TENANT — set this front's tenant slug in the environment.",
    );
  }
  const tenant = await getTenantBySlug(slug);
  if (!tenant) {
    throw new Error(
      `Tenant "${slug}" not found or inactive in the backend (NEXT_PUBLIC_DEFAULT_TENANT).`,
    );
  }
  return tenant;
});

/**
 * Turn a tenant's `theme` JSON into inline CSS custom properties so the
 * storefront can brand itself per tenant (set on the storefront layout).
 */
export function tenantThemeVars(
  theme: Tenant["theme"] | null | undefined,
): React.CSSProperties {
  const t = (theme ?? {}) as TenantTheme;
  const vars: Record<string, string> = {};
  // Override the design-system accent tokens for this tenant's subtree, so
  // buttons (.bg-brand-gradient), focus rings and links pick up its colors.
  if (t.accent) {
    vars["--tenant-accent"] = t.accent;
    vars["--color-accent"] = t.accent;
  }
  if (t.accent2) {
    vars["--tenant-accent-2"] = t.accent2;
    vars["--color-accent-2"] = t.accent2;
  }
  return vars as React.CSSProperties;
}

/** Brand identity sourced from the tenant row — passed to layout/nav/footer. */
export interface TenantBrand {
  name: string;
  logoUrl: string | null;
  accent?: string;
  accent2?: string;
}

export function tenantBrand(tenant: Tenant): TenantBrand {
  const theme = (tenant.theme ?? {}) as TenantTheme;
  return {
    name: tenant.name,
    logoUrl: tenant.logo_url,
    accent: theme.accent,
    accent2: theme.accent2,
  };
}

export type SocialLink = { key: string; href: string };

/**
 * Normalize a stored WhatsApp number to wa.me digits, defaulting the country
 * code to Peru. A bare 9-digit mobile (e.g. "958250742") gets "51" prepended so
 * the link actually dials; numbers that already include a country code are kept.
 */
export function normalizeWhatsApp(
  raw: string | null | undefined,
): string | null {
  const digits = (raw ?? "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  if (digits.length === 9 && digits.startsWith("9")) return `51${digits}`;
  return digits;
}

/**
 * Build a wa.me link from the tenant's configured WhatsApp number, optionally
 * pre-filling a message. Single source of truth for every WhatsApp entry point
 * (footer, floating bubble, quote/consult CTAs). Returns null when unset.
 */
export function tenantWhatsAppLink(
  tenant: Tenant,
  message?: string,
): string | null {
  const num = normalizeWhatsApp(tenant.whatsapp);
  if (!num) return null;
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build the footer's social links from the tenant's configured profiles. */
export function tenantSocialLinks(tenant: Tenant): SocialLink[] {
  const social = (tenant.social ?? {}) as Record<string, string>;
  const links: SocialLink[] = [];
  for (const key of [
    "instagram",
    "tiktok",
    "x",
    "facebook",
    "youtube",
    "linkedin",
  ]) {
    const href = social[key]?.trim();
    if (href) links.push({ key, href });
  }
  const wa = normalizeWhatsApp(tenant.whatsapp);
  if (wa) links.push({ key: "whatsapp", href: `https://wa.me/${wa}` });
  return links;
}

/**
 * Read a tenant's Mercado Pago credentials. Uses the service-role client
 * because `tenant_payment_config` is server-only (no anon/authenticated read
 * of the access token). Returns null when not configured.
 */
export async function getTenantPaymentConfig(tenantId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tenant_payment_config")
    .select("mp_access_token, mp_public_key, mp_webhook_secret")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}
