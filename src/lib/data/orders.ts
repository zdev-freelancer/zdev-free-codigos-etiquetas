import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant } from "@/lib/tenant";

const ORDER_SELECT =
  "*, order_items(id, product_id, quantity, price_at_purchase, products(name, slug))";

/** Orders of a given kind for the current tenant (admin — RLS scoped). */
export async function getOrders(kind: "sale" | "quote") {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("tenant_id", tenant.id)
    .eq("kind", kind)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export type AdminOrder = Awaited<ReturnType<typeof getOrders>>[number];

/**
 * Public tracking lookup by code. Guests can't read orders under RLS, so this
 * uses the service role and returns only tracking-safe fields.
 */
export async function getOrderByTrackingCode(code: string) {
  const cleaned = code.trim().toUpperCase();
  if (!cleaned) return null;

  const tenant = await getCurrentTenant();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("orders")
    .select(
      "kind, fulfillment, tracking_status, status, created_at, tracking_code, full_name, order_items(quantity, products(name))",
    )
    .eq("tenant_id", tenant.id)
    .eq("tracking_code", cleaned)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}
