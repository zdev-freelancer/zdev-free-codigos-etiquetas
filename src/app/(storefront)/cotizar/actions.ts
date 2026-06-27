"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant } from "@/lib/tenant";
import { generateTrackingCode } from "@/config/orders";

function f(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Public quote request. Creates a `kind = 'quote'` order via the service role
 * (guests can't write under RLS) and redirects to a confirmation with a code.
 */
export async function requestQuote(formData: FormData) {
  const tenant = await getCurrentTenant();
  const admin = createAdminClient();

  const email = f(formData, "email");
  const name = f(formData, "name");
  const phone = f(formData, "phone");
  const productSlug = f(formData, "product_slug");
  const message = f(formData, "message");

  let productId: string | null = null;
  if (productSlug) {
    const { data: p } = await admin
      .from("products")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("slug", productSlug)
      .maybeSingle();
    productId = p?.id ?? null;
  }

  const code = generateTrackingCode();
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      tenant_id: tenant.id,
      kind: "quote",
      status: "pending",
      tracking_status: "solicitado",
      tracking_code: code,
      total_amount: 0,
      currency: tenant.default_currency,
      email: email || null,
      full_name: name || null,
      phone: phone || null,
      notes: message || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (productId && order) {
    await admin.from("order_items").insert({
      order_id: order.id,
      product_id: productId,
      quantity: 1,
      price_at_purchase: 0,
    });
  }

  redirect(`/cotizar?enviado=1&code=${code}`);
}
