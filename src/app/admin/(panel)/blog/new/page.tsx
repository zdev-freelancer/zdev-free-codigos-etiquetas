import type { Metadata } from "next";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = {
  title: "Nuevo artículo",
  robots: { index: false },
};

export default function NewPostPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Nuevo artículo
      </h1>
      <div className="mt-8 max-w-3xl">
        <BlogForm />
      </div>
    </>
  );
}
