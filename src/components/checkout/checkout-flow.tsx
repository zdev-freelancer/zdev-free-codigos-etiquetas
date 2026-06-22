"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, selectTotalAmount } from "@/store/cart-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { formatPrice, cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { LIMA_DISTRICTS } from "@/lib/checkout/lima-districts";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import type { CartItem, Currency } from "@/types";

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1 as Step, label: "Datos" },
  { n: 2 as Step, label: "Pago" },
  { n: 3 as Step, label: "Confirmación" },
];

interface ShippingInfo {
  email: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  district: string;
  reference: string;
}

interface Confirmation {
  reference: string;
  total: number;
  currency: Currency;
  items: CartItem[];
  district: string;
}

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

export function CheckoutFlow() {
  const mounted = useHasMounted();
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectTotalAmount);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState<Step>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const [shipping, setShipping] = useState<ShippingInfo>({
    email: "",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    district: "",
    reference: "",
  });

  const currency = items[0]?.currency ?? "PEN";

  // GA4 begin_checkout once, after mount, when the cart has items.
  const beganCheckout = useRef(false);
  useEffect(() => {
    if (mounted && !beganCheckout.current && items.length > 0) {
      beganCheckout.current = true;
      trackBeginCheckout(items, total, currency);
    }
  }, [mounted, items, total, currency]);

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tu carrito está vacío
        </h1>
        <p className="text-sm text-muted">
          Agrega productos antes de finalizar la compra.
        </p>
        <Link href="/" className={buttonClasses("primary", "mt-2")}>
          Ir al catálogo
        </Link>
      </div>
    );
  }

  function handleSubmitShipping(event: React.FormEvent) {
    event.preventDefault();
    setStep(2);
  }

  async function handlePay() {
    setError(null);
    setProcessing(true);

    try {
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          payer: { name: shipping.fullName, email: shipping.email },
        }),
      });
      const data = await res.json();

      if (data.configured && data.init_point) {
        window.location.href = data.init_point;
        return;
      }

      // Demo fallback — Mercado Pago credentials not configured yet.
      const reference = "CYE-" + Date.now().toString(36).slice(-6).toUpperCase();
      trackPurchase({ transactionId: reference, value: total, currency, items });
      setConfirmation({
        reference,
        total,
        currency,
        items: [...items],
        district: shipping.district,
      });
      clear();
      setStep(3);
    } catch {
      setProcessing(false);
      setError("No se pudo iniciar el pago. Intenta nuevamente.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
      <StepIndicator current={step} />

      {step === 3 && confirmation ? (
        <ConfirmationView confirmation={confirmation} email={shipping.email} />
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div>
            {step === 1 && (
              <form
                onSubmit={handleSubmitShipping}
                className="flex flex-col gap-8"
              >
                <section className="flex flex-col gap-5">
                  <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                    Contacto
                  </h2>
                  <Field label="Email">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={shipping.email}
                      onChange={(e) =>
                        setShipping({ ...shipping, email: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Nombre / Razón social">
                      <input
                        required
                        autoComplete="name"
                        value={shipping.fullName}
                        onChange={(e) =>
                          setShipping({ ...shipping, fullName: e.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Teléfono">
                      <input
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        value={shipping.phone}
                        onChange={(e) =>
                          setShipping({ ...shipping, phone: e.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                <section className="flex flex-col gap-5">
                  <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                    Envío
                  </h2>
                  <Field label="Dirección">
                    <input
                      required
                      autoComplete="address-line1"
                      value={shipping.line1}
                      onChange={(e) =>
                        setShipping({ ...shipping, line1: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Oficina / Interior (opcional)">
                    <input
                      autoComplete="address-line2"
                      value={shipping.line2}
                      onChange={(e) =>
                        setShipping({ ...shipping, line2: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Distrito">
                      <select
                        required
                        value={shipping.district}
                        onChange={(e) =>
                          setShipping({ ...shipping, district: e.target.value })
                        }
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Selecciona…
                        </option>
                        {LIMA_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Referencia (opcional)">
                      <input
                        value={shipping.reference}
                        onChange={(e) =>
                          setShipping({ ...shipping, reference: e.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                <button
                  type="submit"
                  className={buttonClasses("primary", "sm:max-w-xs")}
                >
                  Continuar al pago
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                    Pago
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-mono text-[11px] uppercase tracking-label text-muted transition-colors duration-300 ease-in-out hover:text-foreground"
                  >
                    ← Editar datos
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-surface px-5 py-5 text-sm leading-relaxed text-space-gray">
                  Serás redirigido a{" "}
                  <span className="font-medium text-foreground">Mercado Pago</span>{" "}
                  para completar el pago de forma segura (tarjeta, Yape, transferencia
                  y más).
                </div>

                {error && (
                  <p className="rounded-xl border border-ink bg-ink px-4 py-3 text-xs text-snow">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={processing}
                  className={buttonClasses("primary", "sm:max-w-xs")}
                >
                  {processing
                    ? "Redirigiendo…"
                    : `Pagar ${formatPrice(total, currency)}`}
                </button>

                <p className="text-xs text-muted">
                  Pago procesado por Mercado Pago. Mientras las credenciales no
                  estén configuradas, se mostrará una confirmación de demostración.
                </p>
              </div>
            )}
          </div>

          <OrderSummary items={items} total={total} currency={currency} />
        </div>
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-xs uppercase tracking-label transition-colors duration-300 ease-in-out",
              s.n <= current ? "text-foreground" : "text-muted",
            )}
          >
            {String(s.n).padStart(2, "0")} {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <span className="h-px w-8 bg-border" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderSummary({
  items,
  total,
  currency,
}: {
  items: CartItem[];
  total: number;
  currency: Currency;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-border p-6 lg:sticky lg:top-24">
      <h2 className="font-mono text-xs uppercase tracking-label text-muted">
        Resumen
      </h2>

      <div className="mt-5 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">
                {item.name}
              </span>
              <span className="text-xs text-muted">Cant. {item.quantity}</span>
            </div>
            <span className="text-sm text-space-gray">
              {formatPrice(item.price * item.quantity, item.currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-sm">
        <div className="flex justify-between text-space-gray">
          <span>Subtotal</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
        <div className="flex justify-between text-space-gray">
          <span>Envío</span>
          <span>Por coordinar</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-3 font-medium text-foreground">
          <span>Total</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
      </div>
    </aside>
  );
}

function ConfirmationView({
  confirmation,
  email,
}: {
  confirmation: Confirmation;
  email: string;
}) {
  return (
    <div className="mx-auto mt-16 flex max-w-lg flex-col items-center text-center">
      <span className="font-mono text-xs uppercase tracking-label text-muted">
        Pedido confirmado
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        ¡Gracias por tu compra!
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-space-gray">
        Tu pedido{" "}
        <span className="font-medium text-foreground">
          {confirmation.reference}
        </span>{" "}
        fue registrado. Enviamos la confirmación a{" "}
        <span className="font-medium text-foreground">{email}</span> y
        coordinaremos la entrega en {confirmation.district}.
      </p>

      <div className="mt-10 w-full rounded-2xl border border-border p-6 text-left">
        <h2 className="font-mono text-xs uppercase tracking-label text-muted">
          Detalle
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {confirmation.items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between text-sm text-space-gray"
            >
              <span>
                {item.name} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span>
                {formatPrice(item.price * item.quantity, item.currency)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm font-medium text-foreground">
          <span>Total</span>
          <span>{formatPrice(confirmation.total, confirmation.currency)}</span>
        </div>
      </div>

      <Link href="/" className={buttonClasses("primary", "mt-10")}>
        Seguir comprando
      </Link>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
