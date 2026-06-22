import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Quiénes Somos",
  description:
    "Especialistas en identificación automática para empresas en el Perú: etiquetas, ribbons, impresoras y lectores de código de barras.",
};

const PILARES: [string, string][] = [
  [
    "Especialización",
    "Solo identificación automática. Conocemos cada material, cada impresora y cada entorno de uso.",
  ],
  [
    "Continuidad",
    "Insumos compatibles y stock disponible para que tu línea de etiquetado no se detenga.",
  ],
  [
    "Asesoría",
    "Acompañamiento técnico antes y después de la compra, no solo venta de productos.",
  ],
];

const SECTORES = [
  "Logística",
  "Manufactura",
  "Retail",
  "Alimentos",
  "Salud",
  "Textil",
];

export default function QuienesSomos() {
  return (
    <>
      <section className="overflow-hidden bg-surface">
        <Container className="py-20 sm:py-24">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-label text-accent-link">
              Quiénes somos
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              Hacemos que cada producto sea legible para tu operación.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-space-gray">
              Somos {siteConfig.name}: especialistas en identificación
              automática para empresas en el Perú. Convertimos productos,
              activos y procesos en datos que tus sistemas pueden leer, rastrear
              y controlar.
            </p>
          </Reveal>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-label text-accent-link">
              Cómo trabajamos
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {PILARES.map(([title, desc], i) => (
              <Reveal key={title} delay={i * 90} className="h-full">
                <div className="h-full rounded-2xl bg-surface p-7">
                  <h3 className="text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-space-gray">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="pb-4 sm:pb-8">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-label text-accent-link">
              Sectores que atendemos
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {SECTORES.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surface px-4 py-2 text-sm text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 sm:px-14">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                ¿Hablamos de tu proyecto de identificación?
              </h2>
              <Link
                href={siteConfig.quoteUrl}
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
