import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutResult } from "@/components/checkout/checkout-result";

export const metadata: Metadata = {
  title: "Pago pendiente",
  robots: { index: false },
};

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutResult status="pending" />
    </Suspense>
  );
}
