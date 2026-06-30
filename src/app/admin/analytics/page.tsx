import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSalesAnalytics } from "@/lib/data/analytics";
import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analítica",
  robots: { index: false },
};

export default async function AnalyticsPage() {
  await requireAdmin();
  const sales = await getSalesAnalytics();

  return (
    <AdminShell>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Analítica
        </h1>
        <p className="mt-1 text-sm text-muted">
          <span className="font-medium text-foreground">Ventas y productos</span>{" "}
          usa datos reales de la tienda. Visitantes, embudo de conversión e
          interacción son demostrativos (requieren activar el seguimiento web).
        </p>
      </div>
      <div className="mt-6">
        <AnalyticsDashboard sales={sales} />
      </div>
    </AdminShell>
  );
}
