"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import {
  QUOTE_STATUS_FLOW,
  saleStatusFlow,
  statusLabel,
} from "@/config/orders";
import { formatPrice } from "@/lib/utils";
import type { AdminOrder } from "@/lib/data/orders";

const selectClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrdersTable({
  orders,
  kind,
}: {
  orders: AdminOrder[];
  kind: "sale" | "quote";
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-background p-10 text-center text-sm text-muted">
        {kind === "quote"
          ? "Aún no hay solicitudes de cotización."
          : "Aún no hay ventas registradas."}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              {["Código", "Cliente", "Fecha", kind === "sale" ? "Total" : "Producto", "Estado", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 font-mono text-[11px] uppercase tracking-label"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4 font-mono text-xs text-foreground">
                  {o.tracking_code ?? "—"}
                </td>
                <td className="px-5 py-4 text-foreground">
                  {o.full_name ?? o.email ?? "—"}
                </td>
                <td className="px-5 py-4 text-space-gray">
                  {fmtDate(o.created_at)}
                </td>
                <td className="px-5 py-4 text-space-gray">
                  {kind === "sale"
                    ? formatPrice(o.total_amount, o.currency)
                    : (o.order_items?.[0]?.products?.name ?? "Consulta general")}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    {statusLabel(o.tracking_status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className="text-accent-link transition-opacity duration-300 ease-in-out hover:opacity-70"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <OrderModal
          order={selected}
          kind={kind}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </dt>
      <dd className="text-right text-sm text-foreground">{value}</dd>
    </div>
  );
}

function OrderModal({
  order,
  kind,
  onClose,
}: {
  order: AdminOrder;
  kind: "sale" | "quote";
  onClose: () => void;
}) {
  const [fulfillment, setFulfillment] = useState(
    order.fulfillment === "pickup" ? "pickup" : "shipping",
  );
  const [status, setStatus] = useState(
    order.tracking_status ?? (kind === "quote" ? "solicitado" : "pagado"),
  );

  const options = kind === "quote" ? QUOTE_STATUS_FLOW : saleStatusFlow(fulfillment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-label text-muted">
              {kind === "quote" ? "Cotización" : "Venta"} · {order.tracking_code}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {order.full_name ?? "Cliente"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-muted transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <dl className="mt-4 flex flex-col divide-y divide-border border-y border-border">
          <Row label="Email" value={order.email ?? "—"} />
          <Row label="Teléfono" value={order.phone ?? "—"} />
          <Row label="Fecha" value={fmtDate(order.created_at)} />
          {kind === "sale" && (
            <Row label="Total" value={formatPrice(order.total_amount, order.currency)} />
          )}
          {order.shipping_district && (
            <Row label="Distrito" value={order.shipping_district} />
          )}
        </dl>

        {order.order_items && order.order_items.length > 0 && (
          <div className="mt-4">
            <p className="font-mono text-[11px] uppercase tracking-label text-muted">
              Productos
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {order.order_items.map((it) => (
                <li
                  key={it.id}
                  className="flex justify-between gap-4 text-space-gray"
                >
                  <span>
                    {it.products?.name ?? "—"} × {it.quantity}
                  </span>
                  {kind === "sale" && (
                    <span>
                      {formatPrice(it.price_at_purchase * it.quantity, order.currency)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {order.notes && (
          <div className="mt-4">
            <p className="font-mono text-[11px] uppercase tracking-label text-muted">
              Mensaje
            </p>
            <p className="mt-1 text-sm leading-relaxed text-space-gray">
              {order.notes}
            </p>
          </div>
        )}

        <form
          action={updateOrderStatus}
          className="mt-6 flex flex-col gap-4 border-t border-border pt-5"
        >
          <input type="hidden" name="id" value={order.id} />
          <input
            type="hidden"
            name="tab"
            value={kind === "quote" ? "cotizacion" : "ventas"}
          />

          {kind === "sale" ? (
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-label text-muted">
                Método de entrega
              </span>
              <select
                name="fulfillment"
                value={fulfillment}
                onChange={(e) => {
                  const next = e.target.value;
                  setFulfillment(next);
                  const flow = saleStatusFlow(next);
                  if (!flow.some((s) => s.value === status))
                    setStatus(flow[0].value);
                }}
                className={selectClass}
              >
                <option value="shipping">Envío</option>
                <option value="pickup">Recojo en tienda</option>
              </select>
            </label>
          ) : (
            <input type="hidden" name="fulfillment" value="" />
          )}

          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-label text-muted">
              Estado
            </span>
            <select
              name="tracking_status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <button type="submit" className={buttonClasses("primary")}>
              Guardar estado
            </button>
            <button
              type="button"
              onClick={onClose}
              className={buttonClasses("secondary")}
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
