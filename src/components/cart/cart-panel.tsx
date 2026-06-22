"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCartStore,
  selectTotalItems,
  selectTotalAmount,
} from "@/store/cart-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";

export function CartPanel() {
  const mounted = useHasMounted();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const count = useCartStore(selectTotalItems);
  const total = useCartStore(selectTotalAmount);

  // Avoid hydration mismatch: persisted cart state is client-only.
  if (!mounted) return null;

  const currency = items[0]?.currency ?? "PEN";

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Slide-over */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Bolsa de compras"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-mono text-xs uppercase tracking-label">
            Bolsa ({count})
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="text-foreground transition-opacity duration-300 ease-in-out hover:opacity-60"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted">Tu bolsa está vacía.</p>
            <button
              type="button"
              onClick={close}
              className="font-mono text-xs uppercase tracking-label text-foreground underline-offset-4 hover:underline"
            >
              Seguir explorando
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 border-b border-border py-5"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground">
                      {item.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="font-mono text-[11px] uppercase tracking-label text-muted transition-colors duration-300 ease-in-out hover:text-foreground"
                    >
                      Quitar
                    </button>
                  </div>

                  <p className="mt-1 text-sm text-space-gray">
                    {formatPrice(item.price, item.currency)}
                  </p>

                  <div className="mt-auto flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 ease-in-out hover:border-foreground"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center font-mono text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 ease-in-out hover:border-foreground"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <footer className="border-t border-border px-6 py-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-space-gray">Subtotal</span>
              <span className="text-sm font-medium text-foreground">
                {formatPrice(total, currency)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Envío e impuestos calculados al finalizar.
            </p>
            <Link
              href="/checkout"
              onClick={close}
              className={buttonClasses("primary", "mt-5 w-full")}
            >
              Finalizar compra
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
