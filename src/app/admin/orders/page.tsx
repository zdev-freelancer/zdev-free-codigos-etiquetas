import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getOrders } from "@/lib/data/orders";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersTable } from "@/components/admin/orders-table";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pedidos",
  robots: { index: false },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const kind: "sale" | "quote" = sp.tab === "cotizacion" ? "quote" : "sale";
  const orders = await getOrders(kind);

  const tabs = [
    { key: "sale", label: "Ventas generales", href: "/admin/orders?tab=ventas" },
    {
      key: "quote",
      label: "Pedidos por cotización",
      href: "/admin/orders?tab=cotizacion",
    },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Pedidos
      </h1>

      <div className="mt-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              kind === t.key
                ? "border-accent text-foreground"
                : "border-transparent text-space-gray hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <OrdersTable orders={orders} kind={kind} />
      </div>
    </AdminShell>
  );
}
