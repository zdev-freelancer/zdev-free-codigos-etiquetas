import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = {
  title: "Nuevo artículo",
  robots: { index: false },
};

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Nuevo artículo
      </h1>
      <div className="mt-8 max-w-3xl">
        <BlogForm />
      </div>
    </AdminShell>
  );
}
