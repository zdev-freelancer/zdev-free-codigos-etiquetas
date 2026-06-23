"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { Currency } from "@/types";

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Create or update a product (plus its inventory and primary image). */
export async function saveProduct(formData: FormData) {
  const { supabase, tenantId } = await requireAdmin();

  const id = field(formData, "id");
  const name = field(formData, "name");
  const compatibility = field(formData, "compatibility")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const payload = {
    slug: field(formData, "slug"),
    name,
    description: field(formData, "description") || null,
    price: Number(formData.get("price")),
    currency: (field(formData, "currency") || "PEN") as Currency,
    collection: field(formData, "collection") || null,
    material: field(formData, "material") || null,
    compatibility,
    is_featured: formData.get("is_featured") === "on",
  };

  let productId = id;

  if (id) {
    // RLS (is_tenant_admin) ensures the admin can only update their tenant's rows.
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, tenant_id: tenantId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    productId = data.id;
  }

  const stock = Number(formData.get("stock") ?? 0);
  await supabase
    .from("inventory")
    .upsert(
      { product_id: productId, stock_level: Number.isFinite(stock) ? stock : 0 },
      { onConflict: "product_id" },
    );

  // Image URL is submitted by the form; the file is uploaded client-side
  // straight to Storage (see ImageUpload), avoiding Server Action body limits.
  const imageUrl = field(formData, "image_url");

  await supabase.from("product_images").delete().eq("product_id", productId);
  if (imageUrl) {
    await supabase.from("product_images").insert({
      product_id: productId,
      image_url: imageUrl,
      alt_text: name,
      display_order: 0,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");
  redirect("/admin");
}

/** Permanently delete a product (cascades to images and inventory). */
export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(formData, "id");
  if (id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
