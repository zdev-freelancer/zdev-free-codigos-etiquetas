"use client";

import { useCartStore, selectTotalItems } from "@/store/cart-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { BagIcon } from "@/components/ui/icons";

export function CartButton() {
  const mounted = useHasMounted();
  const open = useCartStore((s) => s.open);
  const count = useCartStore(selectTotalItems);

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Bolsa de compras"
      className="flex items-center gap-2 text-foreground transition-opacity duration-300 ease-in-out hover:opacity-60"
    >
      <BagIcon className="h-5 w-5" />
      <span className="font-mono text-xs tabular-nums">
        {mounted ? count : 0}
      </span>
    </button>
  );
}
