import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analítica",
  robots: { index: false },
};

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Analítica
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ventas, visitantes, embudo de conversión e interacción. Datos de
          demostración.
        </p>
      </div>
      <div className="mt-6">
        <AnalyticsDashboard />
      </div>
    </AdminShell>
  );
}
