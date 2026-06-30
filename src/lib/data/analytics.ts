import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTenant } from "@/lib/tenant";
import type { Period } from "@/lib/analytics-mock";

/**
 * Real sales analytics, aggregated from the tenant's own orders.
 *
 * The Sales module of the admin dashboard reads these numbers directly from the
 * database (orders + order_items + products). Visitor/funnel/interaction modules
 * stay on demo data until on-site tracking is wired up.
 *
 * All four period views (daily/weekly/monthly/yearly) are computed server-side
 * in one pass so the client can switch periods instantly without re-querying.
 */

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const COLLECTION_LABELS: Record<string, string> = {
  etiquetas: "Etiquetas",
  ribbons: "Ribbons",
  impresoras: "Impresoras",
  lectores: "Lectores",
};
const KNOWN_CATEGORIES = ["Etiquetas", "Ribbons", "Impresoras", "Lectores"];

function catLabel(c: string | null | undefined): string {
  if (!c) return "Otros";
  return COLLECTION_LABELS[c] ?? c.charAt(0).toUpperCase() + c.slice(1);
}

const STATUS_LABELS: Record<string, string> = {
  pagado: "Pagado",
  recibido: "Recibido",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  listo_para_recoger: "Listo para recoger",
  entregado: "Entregado",
};
function statusLabel(s: string | null | undefined): string {
  if (!s) return "Sin estado";
  return STATUS_LABELS[s] ?? s;
}

export type SalesPeriodData = {
  prevLabel: string;
  revenue: number;
  orders: number;
  aov: number;
  delivered: number;
  revenueDelta: number | null;
  ordersDelta: number | null;
  aovDelta: number | null;
  series: { label: string; revenue: number; orders: number }[];
  category: Record<string, number | string>[];
  topProducts: {
    name: string;
    category: string;
    units: number;
    revenue: number;
    stock: number;
    trend: number | null;
  }[];
  byStatus: { label: string; count: number }[];
};

export type SalesAnalytics = {
  hasData: boolean;
  categories: string[];
  periods: Record<Period, SalesPeriodData>;
};

type OrderRow = {
  total_amount: number;
  created_at: string;
  tracking_status: string | null;
};
type ItemRow = {
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  name: string;
  category: string;
};

const MS_DAY = 86_400_000;
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** How many period units ago `date` falls relative to `now` (0 = current bucket). */
function unitsAgo(date: Date, now: Date, period: Period): number {
  switch (period) {
    case "daily":
      return Math.floor((startOfDay(now) - startOfDay(date)) / MS_DAY);
    case "weekly":
      return Math.floor((startOfDay(now) - startOfDay(date)) / MS_DAY / 7);
    case "monthly":
      return (
        (now.getFullYear() * 12 + now.getMonth()) -
        (date.getFullYear() * 12 + date.getMonth())
      );
    case "yearly":
      return now.getFullYear() - date.getFullYear();
  }
}

function periodMeta(period: Period, now: Date): {
  n: number;
  labels: string[];
  prevLabel: string;
} {
  switch (period) {
    case "daily": {
      const n = 14;
      const labels = Array.from({ length: n }, (_, i) => {
        const d = new Date(startOfDay(now) - (n - 1 - i) * MS_DAY);
        return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
      });
      return { n, labels, prevLabel: "vs. 14 días previos" };
    }
    case "weekly": {
      const n = 12;
      const labels = Array.from({ length: n }, (_, i) => {
        const d = new Date(startOfDay(now) - (n - 1 - i) * 7 * MS_DAY);
        return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
      });
      return { n, labels, prevLabel: "vs. 12 semanas previas" };
    }
    case "monthly": {
      const n = 12;
      const labels = Array.from({ length: n }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
        return MONTHS[d.getMonth()];
      });
      return { n, labels, prevLabel: "vs. 12 meses previos" };
    }
    case "yearly": {
      const n = 5;
      const labels = Array.from({ length: n }, (_, i) =>
        String(now.getFullYear() - (n - 1 - i)),
      );
      return { n, labels, prevLabel: "vs. 5 años previos" };
    }
  }
}

function buildPeriod(
  period: Period,
  now: Date,
  orders: OrderRow[],
  items: ItemRow[],
  stockByProduct: Map<string, number>,
  categories: string[],
): SalesPeriodData {
  const { n, labels, prevLabel } = periodMeta(period, now);

  const series = labels.map((label) => ({ label, revenue: 0, orders: 0 }));
  const category: Record<string, number | string>[] = labels.map((label) => {
    const row: Record<string, number | string> = { label };
    for (const c of categories) row[c] = 0;
    return row;
  });

  let curRev = 0;
  let curOrders = 0;
  let prevRev = 0;
  let prevOrders = 0;
  const byStatus = new Map<string, number>();

  for (const o of orders) {
    const ago = unitsAgo(new Date(o.created_at), now, period);
    if (ago >= 0 && ago < n) {
      const i = n - 1 - ago;
      series[i].revenue += o.total_amount;
      series[i].orders += 1;
      curRev += o.total_amount;
      curOrders += 1;
      const lab = statusLabel(o.tracking_status);
      byStatus.set(lab, (byStatus.get(lab) ?? 0) + 1);
    } else if (ago >= n && ago < 2 * n) {
      prevRev += o.total_amount;
      prevOrders += 1;
    }
  }

  const curByProduct = new Map<
    string,
    { name: string; category: string; units: number; revenue: number }
  >();
  const prevRevByProduct = new Map<string, number>();

  for (const it of items) {
    const ago = unitsAgo(new Date(it.created_at), now, period);
    const rev = it.price * it.quantity;
    if (ago >= 0 && ago < n) {
      const i = n - 1 - ago;
      category[i][it.category] = ((category[i][it.category] as number) ?? 0) + rev;
      const entry =
        curByProduct.get(it.product_id) ??
        { name: it.name, category: it.category, units: 0, revenue: 0 };
      entry.units += it.quantity;
      entry.revenue += rev;
      curByProduct.set(it.product_id, entry);
    } else if (ago >= n && ago < 2 * n) {
      prevRevByProduct.set(
        it.product_id,
        (prevRevByProduct.get(it.product_id) ?? 0) + rev,
      );
    }
  }

  const topProducts = [...curByProduct.entries()]
    .map(([pid, e]) => {
      const prev = prevRevByProduct.get(pid);
      return {
        name: e.name,
        category: e.category,
        units: e.units,
        revenue: e.revenue,
        stock: stockByProduct.get(pid) ?? 0,
        trend: prev && prev > 0 ? (e.revenue - prev) / prev : null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const aov = curOrders > 0 ? Math.round(curRev / curOrders) : 0;
  const prevAov = prevOrders > 0 ? prevRev / prevOrders : 0;

  return {
    prevLabel,
    revenue: curRev,
    orders: curOrders,
    aov,
    delivered: byStatus.get("Entregado") ?? 0,
    revenueDelta: prevRev > 0 ? (curRev - prevRev) / prevRev : null,
    ordersDelta: prevOrders > 0 ? (curOrders - prevOrders) / prevOrders : null,
    aovDelta: prevAov > 0 ? (aov - prevAov) / prevAov : null,
    series,
    category,
    topProducts,
    byStatus: [...byStatus.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
  };
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** Aggregate the current tenant's real sales into the four period views. */
export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  const tenant = await getCurrentTenant();
  const admin = createAdminClient();

  const [ordersRes, itemsRes, productsRes] = await Promise.all([
    admin
      .from("orders")
      .select("total_amount, created_at, tracking_status")
      .eq("tenant_id", tenant.id)
      .eq("kind", "sale"),
    admin
      .from("order_items")
      .select(
        "product_id, quantity, price_at_purchase, orders!inner(created_at, tenant_id, kind), products(name, collection)",
      )
      .eq("orders.tenant_id", tenant.id)
      .eq("orders.kind", "sale"),
    admin
      .from("products")
      .select("id, name, collection, inventory(stock_level)")
      .eq("tenant_id", tenant.id),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (itemsRes.error) throw itemsRes.error;
  if (productsRes.error) throw productsRes.error;

  const orders: OrderRow[] = (ordersRes.data ?? []).map((o) => ({
    total_amount: Number(o.total_amount) || 0,
    created_at: o.created_at,
    tracking_status: o.tracking_status,
  }));

  type RawItem = {
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    orders: { created_at: string } | { created_at: string }[] | null;
    products:
      | { name: string | null; collection: string | null }
      | { name: string | null; collection: string | null }[]
      | null;
  };
  const rawItems = (itemsRes.data ?? []) as unknown as RawItem[];
  const items: ItemRow[] = rawItems
    .map((r) => {
      const ord = one(r.orders);
      const prod = one(r.products);
      return {
        product_id: r.product_id,
        quantity: Number(r.quantity) || 0,
        price: Number(r.price_at_purchase) || 0,
        created_at: ord?.created_at ?? "",
        name: prod?.name ?? "Producto",
        category: catLabel(prod?.collection),
      };
    })
    .filter((it) => it.created_at);

  const stockByProduct = new Map<string, number>();
  const catSet = new Set<string>();
  for (const p of productsRes.data ?? []) {
    const inv = one(p.inventory as { stock_level: number } | { stock_level: number }[] | null);
    stockByProduct.set(p.id, inv?.stock_level ?? 0);
    catSet.add(catLabel(p.collection));
  }

  const categories = [
    ...KNOWN_CATEGORIES.filter((c) => catSet.has(c)),
    ...[...catSet].filter((c) => !KNOWN_CATEGORIES.includes(c)),
  ];
  if (categories.length === 0) categories.push(...KNOWN_CATEGORIES);

  const now = new Date();
  const periods = {
    daily: buildPeriod("daily", now, orders, items, stockByProduct, categories),
    weekly: buildPeriod("weekly", now, orders, items, stockByProduct, categories),
    monthly: buildPeriod("monthly", now, orders, items, stockByProduct, categories),
    yearly: buildPeriod("yearly", now, orders, items, stockByProduct, categories),
  } as Record<Period, SalesPeriodData>;

  return { hasData: orders.length > 0, categories, periods };
}
