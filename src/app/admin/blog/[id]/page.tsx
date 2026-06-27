import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/data/blog";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = {
  title: "Editar artículo",
  robots: { index: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Editar artículo
      </h1>
      <div className="mt-8 max-w-3xl">
        <BlogForm post={post} />
      </div>
    </AdminShell>
  );
}
