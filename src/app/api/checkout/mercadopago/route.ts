import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant, getTenantPaymentConfig } from "@/lib/tenant";
import { generateTrackingCode } from "@/config/orders";

interface CheckoutBody {
  items?: { productId: string; quantity: number }[];
  payer?: { name?: string; email?: string };
}

/**
 * Creates a Mercado Pago "Checkout Pro" preference for THIS front's tenant.
 *
 * - Uses the tenant's own MP access token (from `tenant_payment_config`, read
 *   server-side via the service role), falling back to a global env token for
 *   local single-tenant dev.
 * - Prices are re-read from the database (never trusted from the client).
 * - When the service role is configured, a guest order is recorded server-side
 *   (status `pending`) and its id travels as the MP `external_reference`.
 * - Without an MP token it responds `{ configured: false }` so the storefront
 *   falls back to a demo confirmation.
 */
export async function POST(request: Request) {
  const tenant = await getCurrentTenant();
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Resolve this tenant's Mercado Pago token (server-only).
  let accessToken: string | null = null;
  if (hasServiceRole) {
    const cfg = await getTenantPaymentConfig(tenant.id);
    accessToken = cfg?.mp_access_token ?? null;
  }
  accessToken = accessToken ?? process.env.MERCADOPAGO_ACCESS_TOKEN ?? null;

  let payload: CheckoutBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Collapse requested items into trusted quantities per product id.
  const quantities = new Map<string, number>();
  for (const it of payload.items ?? []) {
    if (!it?.productId) continue;
    const q = Math.min(1000, Math.max(1, Math.floor(Number(it.quantity) || 1)));
    quantities.set(it.productId, Math.min(1000, (quantities.get(it.productId) ?? 0) + q));
  }
  if (quantities.size === 0) {
    return NextResponse.json({ error: "Empty cart." }, { status: 400 });
  }
  if (quantities.size > 50) {
    return NextResponse.json({ error: "Demasiados productos distintos." }, { status: 400 });
  }

  // Re-read authoritative prices from the DB, scoped to this tenant + published.
  const supabase = await createClient();
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, currency")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .in("id", [...quantities.keys()]);

  if (productsError) {
    return NextResponse.json(
      { error: "No se pudo validar el carrito." },
      { status: 502 },
    );
  }

  const lineItems = (products ?? []).map((p) => ({
    id: p.id,
    title: p.name,
    quantity: quantities.get(p.id) ?? 1,
    unit_price: Number(p.price),
    currency_id: p.currency,
  }));

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "Empty cart." }, { status: 400 });
  }

  const total = lineItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const currency = lineItems[0].currency_id ?? tenant.default_currency;

  // Basic abuse throttle: cap recent guest orders per email (per tenant).
  if (hasServiceRole && payload.payer?.email) {
    const admin = createAdminClient();
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("email", payload.payer.email)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Demasiados intentos seguidos. Espera un momento." },
        { status: 429 },
      );
    }
  }

  // Record a guest order server-side when the service role is available.
  let orderId: string | null = null;
  let trackingCode: string | null = null;
  let reference = "CYE-" + Date.now().toString(36).slice(-6).toUpperCase();

  if (hasServiceRole) {
    const admin = createAdminClient();
    const code = generateTrackingCode();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        tenant_id: tenant.id,
        kind: "sale",
        status: "pending",
        fulfillment: "shipping",
        tracking_status: "pagado",
        tracking_code: code,
        total_amount: total,
        currency,
        email: payload.payer?.email ?? null,
        full_name: payload.payer?.name ?? null,
        payment_provider: "mercadopago",
      })
      .select("id")
      .single();

    if (!orderError && order) {
      orderId = order.id;
      trackingCode = code;
      reference = code;
      await admin.from("order_items").insert(
        lineItems.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          quantity: i.quantity,
          price_at_purchase: i.unit_price,
        })),
      );
    }
  }

  if (!accessToken) {
    return NextResponse.json({ configured: false, reference, orderId, trackingCode });
  }

  const origin = request.headers.get("origin") ?? siteConfig.url;
  const descriptor =
    tenant.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16) || "TIENDA";

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: lineItems,
        back_urls: {
          success: `${origin}/checkout/success`,
          failure: `${origin}/checkout/failure`,
          pending: `${origin}/checkout/pending`,
        },
        auto_return: "approved",
        notification_url: `${origin}/api/checkout/mercadopago/webhook`,
        external_reference: orderId ?? undefined,
        payer: payload.payer?.email
          ? { name: payload.payer.name, email: payload.payer.email }
          : undefined,
        statement_descriptor: descriptor,
      },
    });

    return NextResponse.json({
      configured: true,
      init_point: result.init_point,
      reference,
      orderId,
      trackingCode,
    });
  } catch (error) {
    console.error("Mercado Pago preference error", error);
    return NextResponse.json(
      { error: "No se pudo crear la preferencia de pago." },
      { status: 502 },
    );
  }
}
