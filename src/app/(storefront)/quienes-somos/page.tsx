import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { BlogBlocks } from "@/components/blog/blog-blocks";
import { siteConfig } from "@/config/site";
import { resolveAboutContent } from "@/config/about-content";
import { getCurrentTenant, tenantWhatsAppLink } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Quiénes Somos",
  description:
    "Especialistas en identificación automática para empresas en el Perú: etiquetas, ribbons, impresoras y lectores de código de barras.",
};

export default async function QuienesSomos() {
  const tenant = await getCurrentTenant();
  const c = resolveAboutContent(tenant.about_content);
  const quoteHref =
    tenantWhatsAppLink(tenant, "Hola, quisiera solicitar asesoría.") ??
    siteConfig.quoteUrl;

  return (
    <>
      <section className="overflow-hidden bg-surface">
        <Container className="py-20 sm:py-24">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-label text-accent-link">
              {c.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              {c.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-space-gray">
              {c.intro}
            </p>
          </Reveal>
        </Container>
      </section>

      {c.blocks.length > 0 && (
        <section>
          <Container className="max-w-3xl py-16 sm:py-20">
            <Reveal>
              <BlogBlocks blocks={c.blocks} />
            </Reveal>
          </Container>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 sm:px-14">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                ¿Hablamos de tu proyecto de identificación?
              </h2>
              <Link
                href={quoteHref}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-accent-2 transition-opacity duration-300 ease-in-out hover:opacity-90"
              >
                Solicitar asesoría
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
