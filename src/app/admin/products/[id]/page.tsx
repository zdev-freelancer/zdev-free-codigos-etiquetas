import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getProductById } from "@/lib/data/products";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Editar producto",
  robots: { index: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Editar producto
      </h1>
      <div className="mt-8 max-w-3xl">
        <ProductForm product={product} />
      </div>
    </AdminShell>
  );
}
