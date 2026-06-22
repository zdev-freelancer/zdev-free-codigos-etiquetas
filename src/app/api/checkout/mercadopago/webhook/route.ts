import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant, getTenantPaymentConfig } from "@/lib/tenant";

/**
 * Mercado Pago webhook (payment notifications) for THIS front's tenant.
 *
 * Flow: verify the `x-signature` HMAC (when a webhook secret is configured) →
 * fetch the authoritative payment from MP using the tenant's token → map its
 * `external_reference` to our order → mark the order paid + decrement stock
 * atomically via `mark_order_paid` (service role). Always returns 200 quickly
 * for handled/ignored events so MP does not retry needlessly.
 */
function verifySignature(
  secret: string,
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
): boolean {
  if (!xSignature) return false;
  const parts = Object.fromEntries(
    xSignature.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    }),
  ) as { ts?: string; v1?: string };

  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId ?? ""};ts:${parts.ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(parts.v1, "hex"),
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  // Event id + type can arrive in the query and/or body.
  let body: { type?: string; topic?: string; action?: string; data?: { id?: string } } = {};
  try {
    body = await request.json();
  } catch {
    // MP sometimes posts an empty body with everything in the query string.
  }

  const type = body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId =
    body.data?.id ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    "";

  // Only payment events move an order. Ack everything else.
  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const tenant = await getCurrentTenant();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Cannot read the token/secret or update orders without the service role.
    return NextResponse.json({ received: true, skipped: "no service role" });
  }

  const cfg = await getTenantPaymentConfig(tenant.id);
  if (!cfg?.mp_access_token) {
    return NextResponse.json({ received: true, skipped: "no MP token" });
  }

  // Verify signature when a secret is configured (required for production).
  if (cfg.mp_webhook_secret) {
    const ok = verifySignature(
      cfg.mp_webhook_secret,
      request.headers.get("x-signature"),
      request.headers.get("x-request-id"),
      dataId,
    );
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn(
      `[mp webhook] tenant ${tenant.slug} has no mp_webhook_secret — signature NOT verified.`,
    );
  }

  // Fetch the authoritative payment from Mercado Pago.
  let payment: { status?: string; external_reference?: string | null };
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${cfg.mp_access_token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch payment" },
        { status: 502 },
      );
    }
    payment = await res.json();
  } catch (e) {
    console.error("[mp webhook] payment fetch failed", e);
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  const orderId = payment.external_reference;
  if (!orderId) {
    return NextResponse.json({ received: true, note: "no external_reference" });
  }

  const admin = createAdminClient();

  // Confirm the order belongs to this tenant before touching it.
  const { data: order } = await admin
    .from("orders")
    .select("id, tenant_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.tenant_id !== tenant.id) {
    return NextResponse.json({ received: true, note: "order/tenant mismatch" });
  }

  if (payment.status === "approved") {
    const { error } = await admin.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_payment_reference: String(dataId),
    });
    if (error) {
      console.error("[mp webhook] mark_order_paid failed", error);
      return NextResponse.json({ error: "Order update failed" }, { status: 500 });
    }
    return NextResponse.json({ received: true, order: orderId, status: "paid" });
  }

  // Pending / in_process / rejected — leave the order pending; just acknowledge.
  return NextResponse.json({ received: true, order: orderId, status: payment.status });
}
