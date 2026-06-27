import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllPosts } from "@/lib/data/blog";
import { AdminShell } from "@/components/admin/admin-shell";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false },
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await getAllPosts();

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Blog
          </h1>
          <p className="mt-1 text-sm text-muted">{posts.length} artículos</p>
        </div>
        <Link href="/admin/blog/new" className={buttonClasses("primary")}>
          Nuevo artículo
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-border bg-background p-10 text-center text-sm text-muted">
          Aún no hay artículos. Crea el primero.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-label">
                  Título
                </th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-label">
                  Estado
                </th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-label">
                  Fecha
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-medium text-foreground">
                    {p.title}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                        p.status === "published"
                          ? "bg-surface text-foreground"
                          : "bg-surface text-muted",
                      )}
                    >
                      {p.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-space-gray">
                    {fmtDate(p.published_at ?? p.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/blog/${p.id}`}
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
      )}
    </AdminShell>
  );
}
