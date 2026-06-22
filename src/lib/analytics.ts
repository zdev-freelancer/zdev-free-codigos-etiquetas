import { sendGAEvent } from "@next/third-parties/google";
import type { CartItem, Currency } from "@/types";

// No-op when GA isn't configured (e.g. local dev without a measurement ID).
const enabled = Boolean(process.env.NEXT_PUBLIC_GA_ID);

type GAItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

function toItems(items: CartItem[]): GAItem[] {
  return items.map((i) => ({
    item_id: i.productId,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));
}

/** GA4 `add_to_cart` recommended event. */
export function trackAddToCart(
  item: { productId: string; name: string; price: number; currency: Currency },
  quantity = 1,
) {
  if (!enabled) return;
  sendGAEvent("event", "add_to_cart", {
    currency: item.currency,
    value: item.price * quantity,
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        price: item.price,
        quantity,
      },
    ],
  });
}

/** GA4 `begin_checkout` recommended event. */
export function trackBeginCheckout(
  items: CartItem[],
  value: number,
  currency: Currency,
) {
  if (!enabled) return;
  sendGAEvent("event", "begin_checkout", {
    currency,
    value,
    items: toItems(items),
  });
}

/** GA4 `purchase` recommended event. */
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency: Currency;
  items: CartItem[];
}) {
  if (!enabled) return;
  sendGAEvent("event", "purchase", {
    transaction_id: params.transactionId,
    currency: params.currency,
    value: params.value,
    items: toItems(params.items),
  });
}
