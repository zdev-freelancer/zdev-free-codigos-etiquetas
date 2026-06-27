import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getOrderByTrackingCode } from "@/lib/data/orders";
import { buttonClasses } from "@/components/ui/button";
import {
  FULFILLMENT_LABELS,
  QUOTE_STATUS_FLOW,
  saleStatusFlow,
} from "@/config/orders";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rastrear pedido",
  robots: { index: false },
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm uppercase tracking-wide text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

type TrackedOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderByTrackingCode>>
>;

function Steps({ order }: { order: TrackedOrder }) {
  const flow =
    order.kind === "quote" ? QUOTE_STATUS_FLOW : saleStatusFlow(order.fulfillment);
  const currentIdx = flow.findIndex((s) => s.value === order.tracking_status);

  return (
    <ol className="mt-8">
      {flow.map((s, i) => {
        const done = currentIdx >= 0 && i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <li key={s.value} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
                  done
                    ? "border-accent bg-accent text-white"
                    : "border-border text-muted",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              {i < flow.length - 1 && (
                <span
                  className={cn(
                    "w-px flex-1",
                    i < currentIdx ? "bg-accent" : "bg-border",
                  )}
                  style={{ minHeight: 28 }}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={cn(
                  "text-sm font-medium",
                  done ? "text-foreground" : "text-muted",
                )}
              >
                {s.label}
              </p>
              {isCurrent && (
                <p className="mt-0.5 text-xs font-medium text-accent-link">
                  Estado actual
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default async function RastreoPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const sp = await searchParams;
  const code = (sp.code ?? "").trim();
  const order = code ? await getOrderByTrackingCode(code) : null;

  return (
    <Container className="max-w-xl py-16">
      <p className="font-mono text-xs uppercase tracking-label text-accent-link">
        Seguimiento
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Rastrear pedido
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-space-gray">
        Ingresa el código de seguimiento que recibiste al confirmar tu pedido o
        solicitud.
      </p>

      <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          name="code"
          defaultValue={code}
          placeholder="Ej. AB12CD34"
          className={inputClass}
        />
        <button type="submit" className={buttonClasses("primary", "shrink-0")}>
          Buscar
        </button>
      </form>

      {code && !order && (
        <p className="mt-8 rounded-2xl border border-border bg-surface p-6 text-sm text-space-gray">
          No encontramos un pedido con el código{" "}
          <span className="font-medium text-foreground">{code}</span>. Verifica
          el código e intenta de nuevo.
        </p>
      )}

      {order && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              {order.kind === "quote" ? "Cotización" : "Pedido"}{" "}
              <span className="font-mono text-sm text-muted">
                {order.tracking_code}
              </span>
            </h2>
            {order.fulfillment && (
              <span className="font-mono text-xs uppercase tracking-label text-muted">
                {FULFILLMENT_LABELS[order.fulfillment] ?? ""}
              </span>
            )}
          </div>

          <Steps order={order} />

          {order.order_items && order.order_items.length > 0 && (
            <ul className="mt-4 border-t border-border text-sm">
              {order.order_items.map((it, i) => (
                <li
                  key={i}
                  className="flex justify-between gap-4 border-b border-border py-3 text-space-gray"
                >
                  <span>{it.products?.name ?? "—"}</span>
                  <span>× {it.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Container>
  );
}
