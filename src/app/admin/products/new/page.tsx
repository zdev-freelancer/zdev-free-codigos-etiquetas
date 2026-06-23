import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Nuevo producto",
  robots: { index: false },
};

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <>
      <AdminHeader />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Nuevo producto
        </h1>
        <div className="mt-8">
          <ProductForm />
        </div>
      </div>
    </>
  );
}
