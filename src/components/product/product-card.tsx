import Image from "next/image";
import Link from "next/link";
import type { ProductWithImages } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AddToBagButton } from "@/components/cart/add-to-bag-button";

export function ProductCard({
  product,
  preload = false,
}: {
  product: ProductWithImages;
  preload?: boolean;
}) {
  const image = product.product_images?.[0];
  const stock = product.inventory?.stock_level ?? 0;
  const soldOut = stock <= 0;
  const isQuote = product.pricing_mode === "quote";

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface">
        {image ? (
          <Image
            src={image.image_url}
            alt={image.alt_text ?? product.name}
            fill
            preload={preload}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.03]"
          />
        ) : null}

        {soldOut && (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-label text-snow">
            Agotado
          </span>
        )}

        {/* Quick add — only for fixed-price products in stock. */}
        {!soldOut && !isQuote && (
          <div className="absolute inset-x-3 bottom-3 z-20 md:translate-y-1 md:opacity-0 md:transition-all md:duration-300 md:ease-in-out md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <AddToBagButton product={product} className="w-full" />
          </div>
        )}
      </div>

      {/* Stretched link covers the card without nesting a button inside an <a>. */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.name}
        className="absolute inset-0 z-10"
      />

      <div className="mt-4 flex flex-col gap-1">
        {(product.material || product.collection) && (
          <span className="font-mono text-[11px] uppercase tracking-label text-muted">
            {product.material ?? product.collection}
          </span>
        )}
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-space-gray">
          {isQuote ? "Cotización" : formatPrice(product.price, product.currency)}
        </p>
      </div>
    </div>
  );
}
