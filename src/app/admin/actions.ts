"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { TENANT_TAG } from "@/lib/tenant";
import { CATALOG_TAG } from "@/lib/data/products";
import type { Currency } from "@/types";
import type { Json } from "@/types/database.types";

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

  // Parse the downloads list (serialized JSON from DownloadsManager).
  let downloads: { label: string; url: string }[] = [];
  try {
    const parsed = JSON.parse(field(formData, "downloads") || "[]");
    if (Array.isArray(parsed)) {
      downloads = parsed
        .filter((d) => d && typeof d.url === "string" && d.url)
        .map((d) => ({
          label: String(d.label ?? "").trim().slice(0, 120) || "Descarga",
          url: String(d.url),
        }));
    }
  } catch {
    downloads = [];
  }

  // Parse the characteristics table (serialized JSON from SpecsManager).
  let specs: { label: string; value: string; visible: boolean }[] = [];
  try {
    const parsed = JSON.parse(field(formData, "specs") || "[]");
    if (Array.isArray(parsed)) {
      specs = parsed
        .map((s) => ({
          label: String(s?.label ?? "").trim().slice(0, 80),
          value: String(s?.value ?? "").trim().slice(0, 300),
          visible: s?.visible !== false,
        }))
        .filter((s) => s.label || s.value);
    }
  } catch {
    specs = [];
  }

  const payload = {
    slug: field(formData, "slug"),
    name,
    description: field(formData, "description") || null,
    price: Number(formData.get("price")) || 0,
    currency: (field(formData, "currency") || "PEN") as Currency,
    collection: field(formData, "collection") || null,
    material: field(formData, "material") || null,
    compatibility,
    is_featured: formData.get("is_featured") === "on",
    pricing_mode:
      field(formData, "pricing_mode") === "quote" ? "quote" : "fixed",
    show_description: formData.get("show_description") === "on",
    show_specs: formData.get("show_specs") === "on",
    show_downloads: formData.get("show_downloads") === "on",
    downloads,
    specs,
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

  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  redirect("/admin?ok=" + encodeURIComponent("Producto guardado"));
}

/** Permanently delete a product (cascades to images and inventory). */
export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(formData, "id");
  if (id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  redirect("/admin?ok=" + encodeURIComponent("Producto eliminado"));
}

/** Save the editable home-page content for the admin's tenant. */
export async function saveHomeContent(formData: FormData) {
  const { supabase, tenantId } = await requireAdmin();

  let blocks: Json = [];
  try {
    const parsed = JSON.parse(field(formData, "blocks") || "[]");
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {
    blocks = [];
  }

  const content = {
    hero: {
      eyebrow: field(formData, "hero_eyebrow"),
      title: field(formData, "hero_title"),
      subtitle: field(formData, "hero_subtitle"),
      ctaPrimary: field(formData, "hero_cta_primary"),
      ctaSecondary: field(formData, "hero_cta_secondary"),
    },
    stats: [0, 1, 2].map((i) => ({
      value: field(formData, `stat_${i}_value`),
      label: field(formData, `stat_${i}_label`),
    })),
    lines: {
      eyebrow: field(formData, "lines_eyebrow"),
      title: field(formData, "lines_title"),
    },
    featured: {
      eyebrow: field(formData, "featured_eyebrow"),
      title: field(formData, "featured_title"),
    },
    valueProps: [0, 1, 2].map((i) => ({
      title: field(formData, `vp_${i}_title`),
      desc: field(formData, `vp_${i}_desc`),
    })),
    banner: {
      eyebrow: field(formData, "banner_eyebrow"),
      title: field(formData, "banner_title"),
      subtitle: field(formData, "banner_subtitle"),
      cta: field(formData, "banner_cta"),
    },
    blocks,
  };

  const { error } = await supabase
    .from("tenants")
    .update({ home_content: content })
    .eq("id", tenantId);
  if (error) throw new Error(error.message);

  revalidateTag(TENANT_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  redirect(
    "/admin/content?tab=inicio&ok=" + encodeURIComponent("Inicio actualizado"),
  );
}

/** Save the editable "Quiénes somos" content for the admin's tenant. */
export async function saveAboutContent(formData: FormData) {
  const { supabase, tenantId } = await requireAdmin();

  let blocks: Json = [];
  try {
    const parsed = JSON.parse(field(formData, "blocks") || "[]");
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {
    blocks = [];
  }

  const content = {
    eyebrow: field(formData, "about_eyebrow"),
    title: field(formData, "about_title"),
    intro: field(formData, "about_intro"),
    blocks,
  };

  const { error } = await supabase
    .from("tenants")
    .update({ about_content: content })
    .eq("id", tenantId);
  if (error) throw new Error(error.message);

  revalidateTag(TENANT_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/quienes-somos");
  revalidatePath("/admin/content");
  redirect(
    "/admin/content?tab=quienes&ok=" +
      encodeURIComponent("Quiénes Somos actualizado"),
  );
}

/** Update an order's tracking status (and, for sales, the fulfillment method). */
export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(formData, "id");
  if (!id) return;

  const trackingStatus = field(formData, "tracking_status");
  const fulfillment = field(formData, "fulfillment");

  const update: { tracking_status: string; fulfillment?: string } = {
    tracking_status: trackingStatus,
  };
  if (fulfillment === "shipping" || fulfillment === "pickup") {
    update.fulfillment = fulfillment;
  }

  const { error } = await supabase.from("orders").update(update).eq("id", id);
  if (error) throw new Error(error.message);

  const tab = field(formData, "tab") === "cotizacion" ? "cotizacion" : "ventas";
  revalidatePath("/admin/orders");
  redirect(
    `/admin/orders?tab=${tab}&ok=` + encodeURIComponent("Estado actualizado"),
  );
}

/** Create or update a blog post. */
export async function saveBlogPost(formData: FormData) {
  const { supabase, tenantId } = await requireAdmin();
  const id = field(formData, "id");
  const status =
    field(formData, "status") === "published" ? "published" : "draft";

  let blocks: Json = [];
  try {
    const parsed = JSON.parse(field(formData, "blocks") || "[]");
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {
    blocks = [];
  }

  const payload = {
    slug: field(formData, "slug"),
    title: field(formData, "title"),
    excerpt: field(formData, "excerpt") || null,
    cover_image: field(formData, "cover_image") || null,
    blocks,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  if (id) {
    const { error } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("blog_posts")
      .insert({ ...payload, tenant_id: tenantId });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog?ok=" + encodeURIComponent("Artículo guardado"));
}

/** Permanently delete a blog post. */
export async function deleteBlogPost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(formData, "id");
  if (id) {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog?ok=" + encodeURIComponent("Artículo eliminado"));
}

/** Save credentials & integration settings (public on tenants + server-only secrets). */
export async function saveSettings(formData: FormData) {
  const { supabase, tenantId } = await requireAdmin();

  const social = {
    instagram: field(formData, "social_instagram"),
    tiktok: field(formData, "social_tiktok"),
    x: field(formData, "social_x"),
    facebook: field(formData, "social_facebook"),
    youtube: field(formData, "social_youtube"),
    linkedin: field(formData, "social_linkedin"),
  };

  const { error: tErr } = await supabase
    .from("tenants")
    .update({
      ga_id: field(formData, "ga_id") || null,
      whatsapp: field(formData, "whatsapp") || null,
      contact_email: field(formData, "contact_email") || null,
      contact_phone: field(formData, "contact_phone") || null,
      address: field(formData, "address") || null,
      social,
    })
    .eq("id", tenantId);
  if (tErr) throw new Error(tErr.message);

  const { error: sErr } = await supabase.from("tenant_payment_config").upsert(
    {
      tenant_id: tenantId,
      mp_access_token: field(formData, "mp_access_token") || null,
      mp_public_key: field(formData, "mp_public_key") || null,
      mp_webhook_secret: field(formData, "mp_webhook_secret") || null,
      brevo_api_key: field(formData, "brevo_api_key") || null,
      brevo_sender_email: field(formData, "brevo_sender_email") || null,
      brevo_sender_name: field(formData, "brevo_sender_name") || null,
      email_subject: field(formData, "email_subject") || null,
      email_body: field(formData, "email_body") || null,
    },
    { onConflict: "tenant_id" },
  );
  if (sErr) throw new Error(sErr.message);

  revalidateTag(TENANT_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=" + encodeURIComponent("Configuración guardada"));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
