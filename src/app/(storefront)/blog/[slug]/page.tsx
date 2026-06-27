import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getPublishedPostBySlug } from "@/lib/data/blog";
import { BlogBlocks } from "@/components/blog/blog-blocks";
import { parseBlocks } from "@/config/blog";

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const blocks = parseBlocks(post.blocks);

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <Link
        href="/blog"
        className="font-mono text-xs uppercase tracking-label text-muted transition-colors duration-300 ease-in-out hover:text-foreground"
      >
        ← Blog
      </Link>

      <p className="mt-8 text-xs text-muted">
        {fmtDate(post.published_at ?? post.created_at)}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>
      {post.excerpt && (
        <p className="mt-4 text-lg leading-relaxed text-space-gray">
          {post.excerpt}
        </p>
      )}

      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.title}
          className="mt-8 w-full rounded-3xl border border-border"
        />
      )}

      <div className="mt-10">
        <BlogBlocks blocks={blocks} />
      </div>
    </Container>
  );
}
