import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Criterios técnicos y guías de selección sobre identificación automática: etiquetas, ribbons, impresoras y lectores.",
};

const POSTS: [string, string][] = [
  [
    "Cómo elegir el ribbon correcto: cera, cera-resina o resina",
    "Cómo emparejar ribbon y etiqueta según superficie, abrasión y resistencia química.",
  ],
  [
    "Etiqueta térmica vs. transferencia térmica",
    "Cuándo conviene cada tecnología según durabilidad esperada y costo por etiqueta.",
  ],
  [
    "Lectores 1D vs. 2D: qué necesita tu operación",
    "Diferencias prácticas para logística, retail y manufactura.",
  ],
];

export default function Blog() {
  return (
    <Container className="py-16 sm:py-20">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-label text-accent-link">
          Blog
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Conocimiento técnico
        </h1>
        <p className="mt-3 max-w-2xl text-space-gray">
          Criterios técnicos, guías de selección y buenas prácticas de
          identificación automática.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map(([title, desc], i) => (
          <Reveal key={title} delay={i * 90} className="h-full">
            <article className="flex h-full flex-col rounded-2xl bg-surface p-6">
              <h2 className="text-lg font-semibold leading-snug text-foreground">
                {title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-space-gray">
                {desc}
              </p>
              <span className="mt-5 text-xs font-medium uppercase tracking-label text-muted">
                Próximamente
              </span>
            </article>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
