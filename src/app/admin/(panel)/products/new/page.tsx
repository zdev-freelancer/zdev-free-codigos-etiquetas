import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Nuevo producto",
  robots: { index: false },
};

export default function NewProductPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Nuevo producto
      </h1>
      <div className="mt-8 max-w-3xl">
        <ProductForm />
      </div>
    </>
  );
}
