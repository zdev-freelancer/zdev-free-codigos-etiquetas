import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Guards every admin section and renders the shell (top bar + sidebar) once.
 * As a shared layout it persists across client-side navigation between sections,
 * so switching tabs no longer re-runs auth or re-mounts the chrome — only the
 * page slot re-renders. Login lives outside this group so it stays unguarded.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
