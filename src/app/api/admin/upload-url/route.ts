import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mints a one-time signed upload URL for a product image, scoped to the
 * admin's tenant folder. Authorization uses the server session (cookies, which
 * work reliably); the signed token then lets the browser upload the file
 * directly to Storage — no client session or RLS dependency, no body-size limit.
 */
export async function POST(request: Request) {
  const { tenantId } = await requireAdmin();

  let body: { filename?: string; productId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const ext = (body.filename?.split(".").pop() || "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const product = (body.productId || "nuevos").replace(/[^a-zA-Z0-9-]/g, "");
  const path = `${tenantId}/${product}/${Date.now()}.${ext}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("product-images")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo autorizar la subida." },
      { status: 500 },
    );
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
