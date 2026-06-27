import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { getPublishedPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Criterios técnicos y guías de selección sobre identificación automática: etiquetas, ribbons, impresoras y lectores.",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function Blog() {
  const posts = await getPublishedPosts();

  return (
    <Container className="py-16 sm:py-20">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-label text-accent-link">
          Blog
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Conocimiento técnico
        </h1>
        <p className="mt-3 max-w-2xl text-grafito text-space-gray">
          Criterios técnicos, guías de selección y buenas prácticas de
          identificación automática.
        </p>
      </Reveal>

      {posts.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">
          Aún no hay artículos publicados. Pronto compartiremos contenido.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 80} className="h-full">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors duration-300 ease-in-out hover:border-foreground/20"
              >
                {p.cover_image && (
                  <div className="aspect-[16/10] overflow-hidden bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.cover_image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs text-muted">
                    {fmtDate(p.published_at ?? p.created_at)}
                  </span>
                  <h2 className="mt-2 text-lg font-semibold leading-snug text-foreground">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-space-gray">
                      {p.excerpt}
                    </p>
                  )}
                  <span className="mt-4 text-sm font-medium text-accent-link">
                    Leer artículo ›
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Container>
  );
}
