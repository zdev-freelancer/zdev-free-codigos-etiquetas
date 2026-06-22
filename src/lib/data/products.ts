import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import type { ProductWithImages } from "@/types";

export interface ProductFilters {
  collection?: string;
  material?: string;
}

const PRODUCT_SELECT =
  "*, product_images(id, product_id, image_url, alt_text, display_order), inventory(stock_level)";

/** Fetch the catalog, newest-featured first, with optional facet filters. */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.collection) query = query.eq("collection", filters.collection);
  if (filters.material) query = query.eq("material", filters.material);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as ProductWithImages[];
}

/** Fetch a single product by slug, or null if not found. */
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithImages | null> {
  const supabase = await createClient();

  const tenant = await getCurrentTenant();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return (data as ProductWithImages | null) ?? null;
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

/** Distinct, sorted collection slugs present in the catalog (for filters). */
export async function getCollections(): Promise<string[]> {
  const supabase = await createClient();

  const tenant = await getCurrentTenant();
  const { data, error } = await supabase
    .from("products")
    .select("collection")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .not("collection", "is", null);

  if (error) throw error;

  return [...new Set((data ?? []).map((row) => row.collection as string))].sort();
}
