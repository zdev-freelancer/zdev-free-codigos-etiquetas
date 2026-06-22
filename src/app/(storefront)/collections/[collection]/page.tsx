import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FilterBar } from "@/components/product/filter-bar";
import { ProductGrid } from "@/components/product/product-grid";
import { getCollections, getProducts } from "@/lib/data/products";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  return {
    title: capitalize(collection),
    description: `Colección ${capitalize(collection)} — accesorios premium Kanso para el ecosistema Apple.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const collections = await getCollections();

  if (!collections.includes(collection)) notFound();

  const products = await getProducts({ collection });

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col items-center py-16 text-center sm:py-20">
          <p className="font-mono text-xs uppercase tracking-label text-muted">
            Colección
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {capitalize(collection)}
          </h1>
        </Container>
      </section>

      <Container className="py-12">
        <FilterBar collections={collections} active={collection} />
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
      </Container>
    </>
  );
}
