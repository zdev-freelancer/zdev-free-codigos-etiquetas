import type { ProductWithImages } from "@/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: ProductWithImages[] }) {
  if (products.length === 0) {
    return (
      <p className="py-24 text-center text-sm text-muted">
        No hay productos en esta colección.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          preload={index === 0}
        />
      ))}
    </div>
  );
}
