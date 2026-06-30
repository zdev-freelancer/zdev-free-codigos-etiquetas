import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant } from "@/lib/tenant";
import type { ProductWithImages } from "@/types";

export interface ProductFilters {
  collection?: string;
  material?: string;
}

/** Cache tag for published-catalog reads — revalidated on product save/delete. */
export const CATALOG_TAG = "catalog";

const PRODUCT_SELECT =
  "*, product_images(id, product_id, image_url, alt_text, display_order), inventory(stock_level)";

/**
 * Published-catalog reads go through Next's data cache (service-role client, no
 * cookies) instead of querying Supabase on every storefront request. Keyed by
 * tenant + facets; invalidated via `revalidateTag(CATALOG_TAG)` when the admin
 * saves or deletes a product.
 */
const loadProducts = unstable_cache(
  async (
    tenantId: string,
    collection: string | null,
    material: string | null,
  ): Promise<ProductWithImages[]> => {
    const admin = createAdminClient();
    let query = admin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("tenant_id", tenantId)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (collection) query = query.eq("collection", collection);
    if (material) query = query.eq("material", material);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as ProductWithImages[];
  },
  ["catalog-products"],
  { revalidate: 120, tags: [CATALOG_TAG] },
);

/** Fetch the catalog, newest-featured first, with optional facet filters. */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductWithImages[]> {
  const tenant = await getCurrentTenant();
  return loadProducts(
    tenant.id,
    filters.collection ?? null,
    filters.material ?? null,
  );
}

const loadProductBySlug = unstable_cache(
  async (
    tenantId: string,
    slug: string,
  ): Promise<ProductWithImages | null> => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("tenant_id", tenantId)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return (data as ProductWithImages | null) ?? null;
  },
  ["catalog-product-by-slug"],
  { revalidate: 120, tags: [CATALOG_TAG] },
);

/** Fetch a single product by slug, or null if not found. */
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithImages | null> {
  const tenant = await getCurrentTenant();
  return loadProductBySlug(tenant.id, slug);
}

/** Fetch a single product by id (used by the admin panel). */
export async function getProductById(
  id: string,
): Promise<ProductWithImages | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductWithImages | null) ?? null;
}

const loadCollections = unstable_cache(
  async (tenantId: string): Promise<string[]> => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("collection")
      .eq("tenant_id", tenantId)
      .eq("status", "published")
      .not("collection", "is", null);

    if (error) throw error;
    return [
      ...new Set((data ?? []).map((row) => row.collection as string)),
    ].sort();
  },
  ["catalog-collections"],
  { revalidate: 120, tags: [CATALOG_TAG] },
);

/** Distinct, sorted collection slugs present in the catalog (for filters). */
export async function getCollections(): Promise<string[]> {
  const tenant = await getCurrentTenant();
  return loadCollections(tenant.id);
}
