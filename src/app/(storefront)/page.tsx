import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { HeroGraphic } from "@/components/ui/hero-graphic";
import { buttonClasses } from "@/components/ui/button";
import { catalogCategories, siteConfig } from "@/config/site";
import { resolveHomeContent } from "@/config/home-content";
import { BlogBlocks } from "@/components/blog/blog-blocks";
import { getProducts } from "@/lib/data/products";
import { getCurrentTenant, tenantWhatsAppLink } from "@/lib/tenant";

export default async function Home() {
  const [products, tenant] = await Promise.all([
    getProducts(),
    getCurrentTenant(),
  ]);
  const c = resolveHomeContent(tenant.home_content);
  const quoteHref =
    tenantWhatsAppLink(tenant, "Hola, quisiera solicitar una cotización.") ??
    siteConfig.quoteUrl;
  const featured = products.filter((p) => p.is_featured);
  const showcase = (featured.length ? featured : products).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden bg-surface">
        <Container className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-label text-accent-link">
              {c.hero.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              {c.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-space-gray">
              {c.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/catalogo" className={buttonClasses("primary")}>
                {c.hero.ctaPrimary}
              </Link>
              <Link
                href={quoteHref}
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-link transition-opacity duration-300 ease-in-out hover:opacity-70"
              >
                {c.hero.ctaSecondary} <span aria-hidden>›</span>
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
              {c.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-2xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </dt>
                  <dd className="mt-0.5 text-xs text-space-gray">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="order-first lg:order-none">
            <HeroGraphic className="mx-auto h-auto w-full max-w-md" />
          </Reveal>
        </Container>
      </section>

      {/* Product lines */}
      <section>
        <Container className="py-16 sm:py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-label text-accent-link">
                  {c.lines.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {c.lines.title}
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="hidden text-sm font-medium text-accent-link transition-opacity duration-300 ease-in-out hover:opacity-70 sm:inline"
              >
                Ver catálogo ›
              </Link>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {catalogCategories.map((cat, i) => (
              <Reveal key={cat.href} delay={i * 90}>
                <Link
                  href={cat.href}
                  className="group flex h-full flex-col rounded-2xl bg-surface p-6 transition-colors duration-300 ease-in-out hover:bg-mist"
                >
                  <span className="text-lg font-semibold text-foreground">
                    {cat.label}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-space-gray">
                    {cat.desc}
                  </span>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent-link">
                    Ver {cat.label.toLowerCase()}
                    <span
                      aria-hidden
                      className="transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
                    >
                      ›
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="bg-surface">
        <Container className="py-16 sm:py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-label text-accent-link">
                  {c.featured.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {c.featured.title}
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="hidden text-sm font-medium text-accent-link transition-opacity duration-300 ease-in-out hover:opacity-70 sm:inline"
              >
                Ver todo ›
              </Link>
            </div>
          </Reveal>
          <Reveal className="mt-10">
            <ProductGrid products={showcase} />
          </Reveal>
        </Container>
      </section>

      {/* Value props */}
      <section>
        <Container className="py-16 sm:py-20">
          <div className="grid gap-10 sm:grid-cols-3">
            {c.valueProps.map((vp, i) => (
              <Reveal key={vp.title} delay={i * 90}>
                <h3 className="text-lg font-semibold text-foreground">
                  {vp.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-space-gray">
                  {vp.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Extra blocks (managed from the admin) */}
      {c.blocks.length > 0 && (
        <section className="border-t border-border">
          <Container className="py-16 sm:py-20">
            <Reveal>
              <BlogBlocks blocks={c.blocks} />
            </Reveal>
          </Container>
        </section>
      )}

      {/* Corporate banner */}
      <section className="pb-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 sm:px-14 sm:py-16">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-medium uppercase tracking-label text-white/70">
                    {c.banner.eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                    {c.banner.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">
                    {c.banner.subtitle}
                  </p>
                </div>
                <Link
                  href={quoteHref}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-accent-2 transition-opacity duration-300 ease-in-out hover:opacity-90"
                >
                  {c.banner.cta}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
