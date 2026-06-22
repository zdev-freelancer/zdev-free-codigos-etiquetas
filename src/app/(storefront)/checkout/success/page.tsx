import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutResult } from "@/components/checkout/checkout-result";

export const metadata: Metadata = {
  title: "Pago aprobado",
  robots: { index: false },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutResult status="success" />
    </Suspense>
  );
}
