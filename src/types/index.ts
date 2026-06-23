// Domain types derived from the Supabase-generated schema, plus app-level types.
import type { Tables, Enums } from "./database.types";

// ---- Database row types ----
export type Product = Tables<"products">;
export type ProductImage = Tables<"product_images">;
export type Inventory = Tables<"inventory">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Profile = Tables<"profiles">;

export type Currency = Enums<"currency_code">;
export type OrderStatus = Enums<"order_status">;

// ---- Composed view models ----
export type ProductWithImages = Product & {
  product_images: ProductImage[];
  inventory: Pick<Inventory, "stock_level"> | null;
};

/** A downloadable file attached to a product (datasheet, manual, etc.). */
export type ProductDownload = { label: string; url: string };

/** Safely read the product's `downloads` jsonb column as a typed list. */
export function parseDownloads(value: unknown): ProductDownload[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (d): d is ProductDownload =>
      !!d &&
      typeof d === "object" &&
      typeof (d as ProductDownload).label === "string" &&
      typeof (d as ProductDownload).url === "string",
  );
}

// ---- App-level (client) types ----
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: Currency;
  imageUrl: string | null;
  quantity: number;
}
