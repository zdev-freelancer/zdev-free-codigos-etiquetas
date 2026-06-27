import { parseBlocks, type BlogBlock } from "@/config/blog";

/** Editable "Quiénes somos" page content (stored in tenants.about_content). */
export type AboutContent = {
  eyebrow: string;
  title: string;
  intro: string;
  blocks: BlogBlock[];
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  eyebrow: "Quiénes somos",
  title: "Hacemos que cada producto sea legible para tu operación.",
  intro:
    "Somos especialistas en identificación automática para empresas en el Perú. Convertimos productos, activos y procesos en datos que tus sistemas pueden leer, rastrear y controlar.",
  blocks: [
    { type: "heading", text: "Cómo trabajamos" },
    {
      type: "paragraph",
      text: "Especialización: solo identificación automática. Conocemos cada material, cada impresora y cada entorno de uso.",
    },
    {
      type: "paragraph",
      text: "Continuidad: insumos compatibles y stock disponible para que tu línea de etiquetado no se detenga.",
    },
    {
      type: "paragraph",
      text: "Asesoría: acompañamiento técnico antes y después de la compra, no solo venta de productos.",
    },
    { type: "heading", text: "Sectores que atendemos" },
    {
      type: "paragraph",
      text: "Logística, manufactura, retail, alimentos, salud y textil.",
    },
  ],
};

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

export function resolveAboutContent(raw: unknown): AboutContent {
  const c = (raw && typeof raw === "object" ? raw : {}) as Partial<AboutContent>;
  const d = DEFAULT_ABOUT_CONTENT;
  const hasBlocks =
    Array.isArray((c as { blocks?: unknown }).blocks) &&
    parseBlocks((c as { blocks?: unknown }).blocks).length > 0;
  return {
    eyebrow: str(c.eyebrow, d.eyebrow),
    title: str(c.title, d.title),
    intro: str(c.intro, d.intro),
    // Only fall back to the default blocks when nothing was saved yet.
    blocks: hasBlocks ? parseBlocks((c as { blocks?: unknown }).blocks) : d.blocks,
  };
}
