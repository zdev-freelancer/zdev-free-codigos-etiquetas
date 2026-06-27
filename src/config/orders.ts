export type OrderStatusOption = { value: string; label: string };

/** Sale tracking flows — the available statuses depend on the fulfillment method. */
export const SALE_STATUS_FLOW: Record<"shipping" | "pickup", OrderStatusOption[]> =
  {
    shipping: [
      { value: "pagado", label: "Pagado" },
      { value: "recibido", label: "Recibido" },
      { value: "en_preparacion", label: "En preparación" },
      { value: "en_camino", label: "En camino" },
      { value: "entregado", label: "Entregado" },
    ],
    pickup: [
      { value: "pagado", label: "Pagado" },
      { value: "en_preparacion", label: "En preparación" },
      { value: "listo_para_recoger", label: "Listo para recoger" },
      { value: "entregado", label: "Entregado" },
    ],
  };

/** Quote request lifecycle. */
export const QUOTE_STATUS_FLOW: OrderStatusOption[] = [
  { value: "solicitado", label: "Solicitada" },
  { value: "cotizado", label: "Cotizada" },
  { value: "cerrado", label: "Cerrada" },
];

export const FULFILLMENT_LABELS: Record<string, string> = {
  shipping: "Envío",
  pickup: "Recojo en tienda",
};

const ALL_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  [
    ...SALE_STATUS_FLOW.shipping,
    ...SALE_STATUS_FLOW.pickup,
    ...QUOTE_STATUS_FLOW,
  ].map((s) => [s.value, s.label]),
);

export function statusLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return ALL_STATUS_LABELS[value] ?? value;
}

/** Status options for a sale, given its fulfillment method (defaults to shipping). */
export function saleStatusFlow(
  fulfillment: string | null | undefined,
): OrderStatusOption[] {
  return fulfillment === "pickup"
    ? SALE_STATUS_FLOW.pickup
    : SALE_STATUS_FLOW.shipping;
}

/** Short, human-friendly tracking code (no ambiguous characters). */
export function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
