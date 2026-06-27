import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/data/products";
import { AdminShell } from "@/components/admin/admin-shell";
import { buttonClasses } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const products = await getProducts();

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Productos
          </h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} productos en el catálogo
          </p>
        </div>
        <Link href="/admin/products/new" className={buttonClasses("primary")}>
          Nuevo producto
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-label">
                Producto
              </th>
              <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-label">
                Categoría
              </th>
              <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-label">
                Precio
              </th>
              <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-label">
                Stock
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-5 py-4 font-medium text-foreground">
                  {product.name}
                </td>
                <td className="px-5 py-4 capitalize text-space-gray">
                  {product.collection ?? "—"}
                </td>
                <td className="px-5 py-4 text-space-gray">
                  {product.pricing_mode === "quote"
                    ? "Cotización"
                    : formatPrice(product.price, product.currency)}
                </td>
                <td className="px-5 py-4 text-space-gray">
                  {product.inventory?.stock_level ?? 0}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-accent-link transition-opacity duration-300 ease-in-out hover:opacity-70"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
