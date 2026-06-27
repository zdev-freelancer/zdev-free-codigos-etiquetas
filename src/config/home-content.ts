/**
 * Editable home-page content. Stored per tenant in `tenants.home_content`
 * (jsonb) and managed from the admin panel (/admin/content). Any missing field
 * falls back to these defaults via `resolveHomeContent`.
 */
import { parseBlocks, type BlogBlock } from "@/config/blog";

export type Stat = { value: string; label: string };
export type ValueProp = { title: string; desc: string };

export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: Stat[];
  lines: { eyebrow: string; title: string };
  featured: { eyebrow: string; title: string };
  valueProps: ValueProp[];
  banner: { eyebrow: string; title: string; subtitle: string; cta: string };
  /** Extra free-form blocks appended to the home page. */
  blocks: BlogBlock[];
};

export const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    eyebrow: "Identificación automática",
    title: "Todo para identificar y etiquetar tu operación.",
    subtitle:
      "Etiquetas, ribbons, impresoras y lectores de código de barras. Equipos e insumos confiables, con asesoría especializada para tu empresa.",
    ctaPrimary: "Ver catálogo",
    ctaSecondary: "Solicitar cotización",
  },
  stats: [
    { value: "+15", label: "años de experiencia" },
    { value: "24–48 h", label: "despacho típico" },
    { value: "100%", label: "asesoría técnica" },
  ],
  lines: {
    eyebrow: "Líneas de producto",
    title: "Todo lo que tu operación necesita",
  },
  featured: {
    eyebrow: "Destacados",
    title: "Productos más solicitados",
  },
  valueProps: [
    {
      title: "Asesoría especializada",
      desc: "Te ayudamos a elegir el insumo y el equipo correcto para tu proceso.",
    },
    {
      title: "Stock y continuidad",
      desc: "Insumos compatibles disponibles para que tu línea de etiquetado no se detenga.",
    },
    {
      title: "Soporte y despacho",
      desc: "Soporte técnico y despacho a todo el Perú, con respaldo postventa.",
    },
  ],
  banner: {
    eyebrow: "Para empresas",
    title: "Equipamos tu operación de punta a punta.",
    subtitle:
      "Impresoras, lectores e insumos con soporte técnico y asesoría especializada en todo el Perú.",
    cta: "Solicitar asesoría",
  },
  blocks: [],
};

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

/** Merge stored content over the defaults so the home page always has values. */
export function resolveHomeContent(raw: unknown): HomeContent {
  const c = (raw && typeof raw === "object" ? raw : {}) as Partial<HomeContent>;
  const d = DEFAULT_HOME_CONTENT;

  const stats = Array.isArray(c.stats) ? c.stats : [];
  const valueProps = Array.isArray(c.valueProps) ? c.valueProps : [];

  return {
    hero: {
      eyebrow: str(c.hero?.eyebrow, d.hero.eyebrow),
      title: str(c.hero?.title, d.hero.title),
      subtitle: str(c.hero?.subtitle, d.hero.subtitle),
      ctaPrimary: str(c.hero?.ctaPrimary, d.hero.ctaPrimary),
      ctaSecondary: str(c.hero?.ctaSecondary, d.hero.ctaSecondary),
    },
    stats: d.stats.map((def, i) => ({
      value: str(stats[i]?.value, def.value),
      label: str(stats[i]?.label, def.label),
    })),
    lines: {
      eyebrow: str(c.lines?.eyebrow, d.lines.eyebrow),
      title: str(c.lines?.title, d.lines.title),
    },
    featured: {
      eyebrow: str(c.featured?.eyebrow, d.featured.eyebrow),
      title: str(c.featured?.title, d.featured.title),
    },
    valueProps: d.valueProps.map((def, i) => ({
      title: str(valueProps[i]?.title, def.title),
      desc: str(valueProps[i]?.desc, def.desc),
    })),
    banner: {
      eyebrow: str(c.banner?.eyebrow, d.banner.eyebrow),
      title: str(c.banner?.title, d.banner.title),
      subtitle: str(c.banner?.subtitle, d.banner.subtitle),
      cta: str(c.banner?.cta, d.banner.cta),
    },
    blocks: parseBlocks((c as { blocks?: unknown }).blocks),
  };
}
