"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore, selectTotalAmount } from "@/store/cart-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { trackPurchase } from "@/lib/analytics";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type Status = "success" | "failure" | "pending";

export function CheckoutResult({ status }: { status: Status }) {
  const mounted = useHasMounted();
  const params = useSearchParams();
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectTotalAmount);
  const clear = useCartStore((s) => s.clear);

  const handled = useRef(false);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "success" || !mounted || handled.current) return;
    handled.current = true;

    const paymentId = params.get("payment_id") ?? params.get("collection_id");
    const ref = paymentId
      ? `CYE-${paymentId}`
      : `CYE-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    setReference(ref);

    if (items.length > 0) {
      trackPurchase({
        transactionId: ref,
        value: total,
        currency: items[0]?.currency ?? "PEN",
        items,
      });
      clear();
    }
  }, [status, mounted, params, items, total, clear]);

  if (!mounted) return <Container className="py-24" />;

  const content: Record<
    Status,
    { eyebrow: string; title: string; body: string; cta: string; href: string }
  > = {
    success: {
      eyebrow: "Pago aprobado",
      title: "¡Gracias por tu compra!",
      body: reference
        ? `Tu pedido ${reference} fue confirmado. Te contactaremos para coordinar la entrega.`
        : "Tu pago fue aprobado. Te contactaremos para coordinar la entrega.",
      cta: "Volver al inicio",
      href: "/",
    },
    failure: {
      eyebrow: "Pago no completado",
      title: "No pudimos procesar tu pago",
      body: "No se realizó ningún cargo. Puedes intentarlo nuevamente.",
      cta: "Reintentar",
      href: "/checkout",
    },
    pending: {
      eyebrow: "Pago pendiente",
      title: "Tu pago está en revisión",
      body: "Te avisaremos apenas se confirme el pago de tu pedido.",
      cta: "Volver al inicio",
      href: "/",
    },
  };

  const c = content[status];

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="font-mono text-xs uppercase tracking-label text-muted">
        {c.eyebrow}
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {c.title}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-space-gray">
        {c.body}
      </p>
      <Link href={c.href} className={buttonClasses("primary", "mt-8")}>
        {c.cta}
      </Link>
    </Container>
  );
}
