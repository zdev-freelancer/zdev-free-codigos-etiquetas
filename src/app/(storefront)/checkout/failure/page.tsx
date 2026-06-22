import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutResult } from "@/components/checkout/checkout-result";

export const metadata: Metadata = {
  title: "Pago no completado",
  robots: { index: false },
};

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={null}>
      <CheckoutResult status="failure" />
    </Suspense>
  );
}
