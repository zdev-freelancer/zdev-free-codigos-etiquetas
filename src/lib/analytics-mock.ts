/**
 * Deterministic mock analytics data adapted to this app's domain
 * (identificación automática: etiquetas / ribbons / impresoras / lectores).
 * Seeded so the numbers are stable and plausible across renders.
 */
export type Period = "daily" | "weekly" | "monthly" | "yearly";

export const PERIODS: { key: Period; label: string }[] = [
  { key: "daily", label: "Diario" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
  { key: "yearly", label: "Anual" },
];

// ---- seeded RNG ----
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(key: string) {
  return mulberry32(hashSeed(key));
}
function rand(key: string, min: number, max: number) {
  return Math.round(min + rng(key)() * (max - min));
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const CATEGORIES = ["Etiquetas", "Ribbons", "Impresoras", "Lectores"] as const;

const PRODUCTS = [
  { name: "Etiqueta térmica 100×150 mm", cat: "Etiquetas", price: 28 },
  { name: "Etiqueta TT couché 50×25 mm", cat: "Etiquetas", price: 19 },
  { name: "Ribbon cera 110×300 m", cat: "Ribbons", price: 42 },
  { name: "Ribbon cera-resina 110×450 m", cat: "Ribbons", price: 65 },
  { name: "Impresora Zebra ZD230", cat: "Impresoras", price: 980 },
  { name: "Impresora industrial Zebra ZT411", cat: "Impresoras", price: 3200 },
  { name: "Lector Honeywell Voyager 1250g", cat: "Lectores", price: 320 },
  { name: "Lector 2D Zebra DS2208", cat: "Lectores", price: 410 },
];

function periodMeta(period: Period) {
  const now = new Date();
  switch (period) {
    case "daily": {
      const labels = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (13 - i));
        return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
      });
      return { labels, scale: 1, prev: "vs. 14 días previos" };
    }
    case "weekly": {
      const labels = Array.from({ length: 12 }, (_, i) => `S-${11 - i}`);
      return { labels, scale: 7, prev: "vs. 12 semanas previas" };
    }
    case "monthly": {
      const labels = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (11 - i));
        return MONTHS[d.getMonth()];
      });
      return { labels, scale: 30, prev: "vs. 12 meses previos" };
    }
    case "yearly": {
      const y = now.getFullYear();
      const labels = Array.from({ length: 5 }, (_, i) => String(y - 4 + i));
      return { labels, scale: 365, prev: "vs. 5 años previos" };
    }
  }
}

function delta(key: string) {
  return rand(key, -22, 38) / 100; // -22% .. +38%
}

export function getAnalytics(period: Period) {
  const { labels, scale, prev } = periodMeta(period);

  // ---------- Sales ----------
  const series = labels.map((label, i) => {
    const r = rand(`${period}-rev-${i}`, 1800, 4200) * scale;
    const o = Math.max(1, Math.round(r / rand(`${period}-aov-${i}`, 280, 520)));
    return { label, revenue: r, orders: o };
  });
  const revenue = series.reduce((s, p) => s + p.revenue, 0);
  const orders = series.reduce((s, p) => s + p.orders, 0);
  const aov = Math.round(revenue / Math.max(orders, 1));

  const category = labels.map((label, i) => {
    const row: Record<string, number | string> = { label };
    for (const c of CATEGORIES) {
      row[c] = rand(`${period}-cat-${c}-${i}`, 600, 2200) * scale;
    }
    return row;
  });

  const topProducts = [...PRODUCTS]
    .map((p) => {
      const units = rand(`tp-units-${period}-${p.name}`, 20, 480) * Math.min(scale, 30);
      return {
        name: p.name,
        category: p.cat,
        units,
        revenue: units * p.price,
        stock: rand(`tp-stock-${p.name}`, 0, 320),
        trend: delta(`tp-trend-${period}-${p.name}`),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const refunds = PRODUCTS.map((p) => ({
    name: p.name,
    rate: rand(`ref-${p.name}`, 1, 90) / 10, // 0.1% .. 9%
  }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  // ---------- Visitors ----------
  const visitSeries = labels.map((label, i) => ({
    label,
    organic: rand(`v-org-${period}-${i}`, 120, 460) * scale,
    paid: rand(`v-paid-${period}-${i}`, 40, 220) * scale,
    direct: rand(`v-dir-${period}-${i}`, 60, 260) * scale,
    referral: rand(`v-ref-${period}-${i}`, 20, 130) * scale,
  }));
  const totalVisits = visitSeries.reduce(
    (s, p) => s + p.organic + p.paid + p.direct + p.referral,
    0,
  );

  const duration = [
    { bucket: "0–30 s", count: rand(`d0-${period}`, 800, 2200) * scale },
    { bucket: "31–60 s", count: rand(`d1-${period}`, 600, 1600) * scale },
    { bucket: "1–3 min", count: rand(`d2-${period}`, 900, 2000) * scale },
    { bucket: "3–10 min", count: rand(`d3-${period}`, 400, 1100) * scale },
    { bucket: "+10 min", count: rand(`d4-${period}`, 120, 480) * scale },
  ];

  const topPages = [
    { path: "/catalogo", visits: rand(`p-cat-${period}`, 2200, 5200) * scale },
    { path: "/", visits: rand(`p-home-${period}`, 1800, 4600) * scale },
    { path: "/products/[slug]", visits: rand(`p-prod-${period}`, 1400, 3800) * scale },
    { path: "/cotizar", visits: rand(`p-cot-${period}`, 600, 1800) * scale },
    { path: "/blog", visits: rand(`p-blog-${period}`, 400, 1400) * scale },
    { path: "/quienes-somos", visits: rand(`p-about-${period}`, 300, 1000) * scale },
    { path: "/rastreo", visits: rand(`p-track-${period}`, 200, 900) * scale },
  ].sort((a, b) => b.visits - a.visits);
  const pagesTotal = topPages.reduce((s, p) => s + p.visits, 0);

  const heatmap = DAYS.map((day, di) => ({
    day,
    hours: Array.from({ length: 24 }, (_, h) => {
      const work = h >= 8 && h <= 19 ? 1 : 0.25;
      const weekend = di >= 5 ? 0.5 : 1;
      return Math.round(rand(`hm-${day}-${h}`, 4, 60) * work * weekend);
    }),
  }));

  // ---------- Funnel ----------
  const fv = Math.round(totalVisits);
  const fpv = Math.round(fv * (rand(`f-pv-${period}`, 38, 46) / 100));
  const fac = Math.round(fpv * (rand(`f-ac-${period}`, 24, 34) / 100));
  const fci = Math.round(fac * (rand(`f-ci-${period}`, 40, 56) / 100));
  const fpu = Math.round(fci * (rand(`f-pu-${period}`, 44, 62) / 100));
  const steps = [
    { name: "Visitantes", value: fv },
    { name: "Vista de producto", value: fpv },
    { name: "Agregó al carrito", value: fac },
    { name: "Inició checkout", value: fci },
    { name: "Compra completada", value: fpu },
  ];

  const bySource = [
    { source: "Orgánico", rate: rand(`cs-org-${period}`, 18, 34) / 10 },
    { source: "Pago", rate: rand(`cs-paid-${period}`, 22, 42) / 10 },
    { source: "Directo", rate: rand(`cs-dir-${period}`, 16, 30) / 10 },
    { source: "Referido", rate: rand(`cs-ref-${period}`, 12, 26) / 10 },
  ];
  const byDevice = [
    { device: "Escritorio", rate: rand(`cd-desk-${period}`, 26, 42) / 10 },
    { device: "Móvil", rate: rand(`cd-mob-${period}`, 14, 26) / 10 },
    { device: "Tablet", rate: rand(`cd-tab-${period}`, 16, 30) / 10 },
  ];

  // ---------- Interaction ----------
  const ctas = [
    { name: "Ver catálogo (hero)", ctr: rand(`cta-1-${period}`, 60, 140) / 10 },
    { name: "Solicitar cotización", ctr: rand(`cta-2-${period}`, 40, 110) / 10 },
    { name: "Producto destacado", ctr: rand(`cta-3-${period}`, 30, 90) / 10 },
    { name: "Banner «Para empresas»", ctr: rand(`cta-4-${period}`, 20, 70) / 10 },
    { name: "Cotizar (navbar)", ctr: rand(`cta-5-${period}`, 25, 80) / 10 },
  ];

  const scroll = [
    { depth: "25%", pct: rand(`sc-25-${period}`, 88, 98) },
    { depth: "50%", pct: rand(`sc-50-${period}`, 64, 82) },
    { depth: "75%", pct: rand(`sc-75-${period}`, 40, 60) },
    { depth: "100%", pct: rand(`sc-100-${period}`, 18, 34) },
  ];

  const searches = [
    { query: "etiqueta térmica", count: rand(`s1-${period}`, 90, 320), zero: false },
    { query: "ribbon cera", count: rand(`s2-${period}`, 70, 240), zero: false },
    { query: "zebra zd230", count: rand(`s3-${period}`, 50, 200), zero: false },
    { query: "lector 2d", count: rand(`s4-${period}`, 40, 160), zero: false },
    { query: "etiqueta adhesiva", count: rand(`s5-${period}`, 30, 130), zero: false },
    { query: "etiqueta rfid", count: rand(`s6-${period}`, 20, 90), zero: true },
    { query: "impresora 3d", count: rand(`s7-${period}`, 10, 60), zero: true },
  ].sort((a, b) => b.count - a.count);

  const visitorMix = labels.map((label, i) => {
    const nuevos = rand(`vm-new-${period}-${i}`, 120, 380) * scale;
    const recurrentes = rand(`vm-ret-${period}-${i}`, 70, 260) * scale;
    return { label, nuevos, recurrentes };
  });

  return {
    period,
    prevLabel: prev,
    sales: {
      revenue,
      orders,
      aov,
      revenueDelta: delta(`d-rev-${period}`),
      ordersDelta: delta(`d-ord-${period}`),
      aovDelta: delta(`d-aov-${period}`),
      series,
      category,
      topProducts,
      refunds,
    },
    visitors: {
      totalVisits,
      bounceRate: rand(`bounce-${period}`, 320, 520) / 10,
      series: visitSeries,
      duration,
      topPages,
      pagesTotal,
      heatmap,
    },
    funnel: { steps, bySource, byDevice },
    interaction: {
      ctas,
      scroll,
      searches,
      returningRate: rand(`rr-${period}`, 280, 440) / 10,
      visitorMix,
    },
  };
}

export type Analytics = ReturnType<typeof getAnalytics>;
export const CATEGORY_LIST = CATEGORIES;
