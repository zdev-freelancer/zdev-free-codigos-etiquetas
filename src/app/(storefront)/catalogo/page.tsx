import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { FilterBar } from "@/components/product/filter-bar";
import { ProductGrid } from "@/components/product/product-grid";
import { getCollections, getProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo de etiquetas, ribbons, impresoras y lectores de código de barras para empresas.",
};

export default async function CatalogoPage() {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);

  return (
    <Container className="py-12 sm:py-16">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-label text-accent-link">
          Catálogo
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Catálogo
        </h1>
        <p className="mt-3 max-w-2xl text-space-gray">
          Insumos y equipos de identificación automática. Filtra por línea o
          material; cotiza por volumen con asesoría técnica.
        </p>
      </Reveal>

      <Reveal delay={80} className="mt-10">
        <FilterBar collections={collections} />
      </Reveal>
      <Reveal delay={140} className="mt-8">
        <ProductGrid products={products} />
      </Reveal>
    </Container>
  );
}
