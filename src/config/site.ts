/** Central brand + site configuration for Códigos y Etiquetas. */
export const siteConfig = {
  name: "Códigos y Etiquetas",
  shortName: "C&E",
  tagline: "Identificación automática para la industria",
  description:
    "Etiquetas, ribbons, impresoras y lectores de código de barras para empresas en el Perú. Insumos y equipos de identificación automática con asesoría especializada.",
  locale: "es-PE",
  defaultCurrency: "PEN",
  url: "https://codigosyetiquetas.pe",
  phone: "+51 999 000 111",
  quoteUrl: "https://wa.me/51999000111",
} as const;

/** Primary navigation — B2B sections, not a product list. */
export const mainNav = [
  { label: "Inicio", href: "/" },
  { label: "Quiénes Somos", href: "/quienes-somos" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Blog", href: "/blog" },
] as const;

/** Product lines — consolidated under the "Catálogo" section / dropdown. */
export const catalogCategories = [
  {
    code: "ET",
    label: "Etiquetas",
    href: "/collections/etiquetas",
    desc: "Térmicas, transferencia térmica y autoadhesivas.",
  },
  {
    code: "RB",
    label: "Ribbons",
    href: "/collections/ribbons",
    desc: "Cera, cera-resina y resina para impresión.",
  },
  {
    code: "IM",
    label: "Impresoras",
    href: "/collections/impresoras",
    desc: "De escritorio, industriales y portátiles.",
  },
  {
    code: "LC",
    label: "Lectores",
    href: "/collections/lectores",
    desc: "1D/2D, de mano e industriales fijos.",
  },
] as const;

/** Social channels (placeholders until the real handles are live). */
export const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/codigosyetiquetas",
    icon: "instagram",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@codigosyetiquetas",
    icon: "tiktok",
  },
  { label: "X", href: "https://x.com/codigosyetiq", icon: "x" },
  { label: "WhatsApp", href: "https://wa.me/51999000111", icon: "whatsapp" },
] as const;
