"use client";

import { useCartStore } from "@/store/cart-store";
import { buttonClasses } from "@/components/ui/button";
import { trackAddToCart } from "@/lib/analytics";
import type { ProductWithImages } from "@/types";

export function AddToBagButton({
  product,
  className,
  label = "Agregar",
}: {
  product: ProductWithImages;
  className?: string;
  label?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

  const stock = product.inventory?.stock_level ?? 0;
  const soldOut = stock <= 0;

  function handleAdd(event: React.MouseEvent) {
    // Prevent the surrounding product link from navigating.
    event.preventDefault();
    event.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.product_images?.[0]?.image_url ?? null,
    });
    trackAddToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
    });
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={soldOut}
      className={buttonClasses("primary", className)}
    >
      {soldOut ? "Agotado" : label}
    </button>
  );
}
