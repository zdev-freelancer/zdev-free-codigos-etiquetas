import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data/products";
import { Container } from "@/components/ui/container";
import { AddToBagButton } from "@/components/cart/add-to-bag-button";
import { buttonClasses } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { parseDownloads } from "@/types";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Producto no encontrado" };

  const image = product.product_images?.[0]?.image_url;

  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const image = product.product_images?.[0];
  const stock = product.inventory?.stock_level ?? 0;
  const soldOut = stock <= 0;
  const isQuote = product.pricing_mode === "quote";
  const downloads = parseDownloads(product.downloads);

  const specs: { label: string; value: string }[] = [];
  if (product.material) specs.push({ label: "Material", value: product.material });
  if (product.collection)
    specs.push({ label: "Colección", value: capitalize(product.collection) });
  if (product.compatibility?.length)
    specs.push({
      label: "Compatibilidad",
      value: product.compatibility.join(" · "),
    });
  specs.push({
    label: "Disponibilidad",
    value: soldOut ? "Agotado" : "En stock",
  });

  return (
    <Container className="py-10 sm:py-16">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-label text-muted transition-colors duration-300 ease-in-out hover:text-foreground"
      >
        ← Catálogo
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface">
            {image && (
              <Image
                src={image.image_url}
                alt={image.alt_text ?? product.name}
                fill
                preload
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>

          {product.product_images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.product_images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-surface"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text ?? product.name}
                    fill
                    sizes="(min-width: 1024px) 12vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.collection && (
            <span className="font-mono text-xs uppercase tracking-label text-muted">
              {capitalize(product.collection)}
            </span>
          )}

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          {isQuote ? (
            <div className="mt-4">
              <p className="text-xl font-medium text-foreground">
                Precio a cotizar
              </p>
              <p className="mt-1 text-sm text-space-gray">
                Solicita una cotización a medida para este producto.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-xl text-space-gray">
              {formatPrice(product.price, product.currency)}
            </p>
          )}

          {product.show_description && product.description && (
            <p className="mt-6 max-w-prose text-base leading-relaxed text-space-gray">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            {isQuote ? (
              <Link
                href={`/cotizar?producto=${product.slug}`}
                className={buttonClasses(
                  "primary",
                  "h-14 w-full text-sm sm:max-w-sm",
                )}
              >
                Solicitar cotización
              </Link>
            ) : (
              <AddToBagButton
                product={product}
                label="Agregar a la bolsa"
                className="h-14 w-full text-sm sm:max-w-sm"
              />
            )}
          </div>

          {/* Structural spec sheet */}
          {product.show_specs && specs.length > 0 && (
            <dl className="mt-12 border-t border-border">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-6 border-b border-border py-4"
                >
                  <dt className="font-mono text-xs uppercase tracking-label text-muted">
                    {spec.label}
                  </dt>
                  <dd className="text-right text-sm text-foreground">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* Downloads */}
          {product.show_downloads && downloads.length > 0 && (
            <section className="mt-12">
              <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                Descargables
              </h2>
              <ul className="mt-4 border-t border-border">
                {downloads.map((d, i) => (
                  <li key={i}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 border-b border-border py-4 text-sm text-foreground transition-colors duration-300 ease-in-out hover:text-accent-link"
                    >
                      <span>{d.label}</span>
                      <span
                        aria-hidden
                        className="font-medium text-accent-link"
                      >
                        ↓ Descargar
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Container>
  );
}
