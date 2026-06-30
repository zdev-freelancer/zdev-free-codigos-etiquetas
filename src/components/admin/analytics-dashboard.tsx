"use client";

import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { PERIODS, getAnalytics, type Period } from "@/lib/analytics-mock";
import type { SalesAnalytics } from "@/lib/data/analytics";

const COLORS = ["#1b9fe0", "#2a2a8c", "#22b8a6", "#e0a234", "#8a8275"];
const AXIS = { fill: "#86868b", fontSize: 11 };
const GRID = "#ececf0";

const soles = (n: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(n);
const num = (n: number) => new Intl.NumberFormat("es-PE").format(Math.round(n));
const signed = (n: number) => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;

const MODULES = [
  { key: "sales", label: "Ventas y productos", demo: false },
  { key: "visitors", label: "Visitantes", demo: true },
  { key: "funnel", label: "Embudo", demo: true },
  { key: "interaction", label: "Interacción", demo: true },
] as const;
type ModuleKey = (typeof MODULES)[number]["key"];

function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background p-5",
        className,
      )}
    >
      {title && (
        <h3 className="font-mono text-[11px] uppercase tracking-label text-muted">
          {title}
        </h3>
      )}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {delta !== undefined && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            delta >= 0 ? "text-[#15803d]" : "text-[#b91c1c]",
          )}
        >
          {signed(delta)}
        </p>
      )}
    </div>
  );
}

/** Toggleable legend driven by component state. */
function useToggle(keys: string[]) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  return {
    hidden,
    isOn: (k: string) => !hidden.has(k),
    toggle: (k: string) =>
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else if (keys.length - next.size > 1) next.add(k);
        return next;
      }),
  };
}

function LegendChips({
  items,
  state,
}: {
  items: { key: string; label: string; color: string }[];
  state: ReturnType<typeof useToggle>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => state.toggle(it.key)}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-opacity",
            state.isOn(it.key) ? "text-space-gray" : "text-muted opacity-40",
          )}
        >
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: it.color }}
          />
          {it.label}
        </button>
      ))}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e3e3e8",
  fontSize: 12,
  boxShadow: "0 8px 24px -12px rgba(10,10,10,.2)",
};

export function AnalyticsDashboard({ sales }: { sales: SalesAnalytics }) {
  const [period, setPeriod] = useState<Period>("monthly");
  const [module, setModule] = useState<ModuleKey>("sales");
  // Sales: real data from the DB. Other modules: demo data until tracking exists.
  const data = useMemo(() => getAnalytics(period), [period]);
  const sd = sales.periods[period];
  const categories = sales.categories;

  const SOURCES = [
    { key: "organic", label: "Orgánico", color: COLORS[0] },
    { key: "paid", label: "Pago", color: COLORS[1] },
    { key: "direct", label: "Directo", color: COLORS[2] },
    { key: "referral", label: "Referido", color: COLORS[3] },
  ];
  const sourceToggle = useToggle(SOURCES.map((s) => s.key));
  const catToggle = useToggle(categories);
  const mixToggle = useToggle(["nuevos", "recurrentes"]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1">
          {MODULES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setModule(m.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                module === m.key
                  ? "bg-surface text-foreground"
                  : "text-space-gray hover:text-foreground",
              )}
            >
              {m.label}
              {m.demo && (
                <span className="rounded-full bg-surface px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-label text-muted">
                  demo
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                period === p.key
                  ? "bg-foreground text-background"
                  : "text-space-gray hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {module === "sales" && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Ingresos" value={soles(sd.revenue)} delta={sd.revenueDelta ?? undefined} />
              <Stat label="Pedidos" value={num(sd.orders)} delta={sd.ordersDelta ?? undefined} />
              <Stat label="Ticket promedio" value={soles(sd.aov)} delta={sd.aovDelta ?? undefined} />
              <Stat label="Pedidos entregados" value={num(sd.delivered)} />
            </div>

            <Card title={`Ingresos y pedidos · ${sd.prevLabel}`}>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={sd.series} margin={{ left: -8, right: 8 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="l" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <YAxis yAxisId="r" orientation="right" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, n) =>
                      n === "Ingresos" ? soles(Number(v)) : num(Number(v))
                    }
                  />
                  <Area yAxisId="l" type="monotone" dataKey="revenue" name="Ingresos" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.12} strokeWidth={2} />
                  <Line yAxisId="r" type="monotone" dataKey="orders" name="Pedidos" stroke={COLORS[1]} strokeWidth={2} dot={false} />
                  <Legend />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Ingresos por categoría">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sd.category} margin={{ left: -8 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
                    <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => soles(Number(v))} />
                    {categories.map((c, i) => (
                      <Bar key={c} dataKey={c} stackId="c" fill={COLORS[i % COLORS.length]} hide={!catToggle.isOn(c)} radius={i === categories.length - 1 ? [4, 4, 0, 0] : undefined} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <LegendChips
                  state={catToggle}
                  items={categories.map((c, i) => ({ key: c, label: c, color: COLORS[i % COLORS.length] }))}
                />
              </Card>

              <Card title="Pedidos por estado">
                {sd.byStatus.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">Sin pedidos en este periodo.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {sd.byStatus.map((s) => (
                      <li key={s.label}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-foreground">{s.label}</span>
                          <span className="shrink-0 font-medium text-space-gray">{num(s.count)}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-surface">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / sd.byStatus[0].count) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <Card title="Productos más vendidos">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      {["Producto", "Categoría", "Unidades", "Ingresos", "Stock", "Tendencia"].map((h) => (
                        <th key={h} className="px-3 py-2 font-mono text-[11px] uppercase tracking-label">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sd.topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                          Sin ventas en este periodo.
                        </td>
                      </tr>
                    ) : (
                      sd.topProducts.map((p) => (
                        <tr key={p.name} className="border-b border-border last:border-0">
                          <td className="px-3 py-3 font-medium text-foreground">{p.name}</td>
                          <td className="px-3 py-3 text-space-gray">{p.category}</td>
                          <td className="px-3 py-3 text-space-gray">{num(p.units)}</td>
                          <td className="px-3 py-3 text-space-gray">{soles(p.revenue)}</td>
                          <td className="px-3 py-3 text-space-gray">{p.stock}</td>
                          <td
                            className={cn(
                              "px-3 py-3 font-medium",
                              p.trend === null
                                ? "text-muted"
                                : p.trend >= 0
                                  ? "text-[#15803d]"
                                  : "text-[#b91c1c]",
                            )}
                          >
                            {p.trend === null ? "—" : `${p.trend >= 0 ? "▲" : "▼"} ${signed(p.trend)}`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {module === "visitors" && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Visitas totales" value={num(data.visitors.totalVisits)} />
              <Stat label="Tasa de rebote" value={`${data.visitors.bounceRate.toFixed(1)}%`} />
              <Stat label="Sesión media" value="2 m 14 s" />
              <Stat label="Recurrentes" value={`${data.interaction.returningRate.toFixed(1)}%`} />
            </div>

            <Card title="Visitas por fuente">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.visitors.series} margin={{ left: -8, right: 8 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => num(Number(v))} />
                  {SOURCES.map((s) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} hide={!sourceToggle.isOn(s.key)} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <LegendChips state={sourceToggle} items={SOURCES} />
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Duración de sesión">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.visitors.duration} margin={{ left: -8 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="bucket" tick={AXIS} tickLine={false} axisLine={false} />
                    <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => num(Number(v))} />
                    <Bar dataKey="count" name="Sesiones" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Páginas más visitadas">
                <ul className="flex flex-col gap-3">
                  {data.visitors.topPages.map((p) => (
                    <li key={p.path}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-mono text-xs text-foreground">{p.path}</span>
                        <span className="shrink-0 text-space-gray">{num(p.visits)}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-surface">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${(p.visits / data.visitors.topPages[0].visits) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card title="Visitas por día y hora">
              <Heatmap rows={data.visitors.heatmap} />
            </Card>
          </div>
        )}

        {module === "funnel" && (
          <div className="flex flex-col gap-5">
            <Card title="Embudo de conversión">
              <Funnel steps={data.funnel.steps} />
            </Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Conversión por fuente">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.funnel.bySource} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="source" tick={AXIS} tickLine={false} axisLine={false} width={70} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                    <Bar dataKey="rate" name="Conversión" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card title="Conversión por dispositivo">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.funnel.byDevice} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="device" tick={AXIS} tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                    <Bar dataKey="rate" name="Conversión" fill={COLORS[1]} radius={[0, 4, 4, 0]}>
                      {data.funnel.byDevice.map((_, i) => (
                        <Cell key={i} fill={COLORS[i + 1]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {module === "interaction" && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="CTR de CTAs y destacados">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.interaction.ctas} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ ...AXIS, fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                    <Bar dataKey="ctr" name="CTR" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Profundidad de scroll">
                <ul className="flex flex-col gap-4 pt-2">
                  {data.interaction.scroll.map((s) => (
                    <li key={s.depth}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">Llegó al {s.depth}</span>
                        <span className="font-medium text-space-gray">{s.pct}%</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-surface">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${s.pct}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Búsquedas en el sitio">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {data.interaction.searches.map((s) => (
                      <tr key={s.query} className="border-b border-border last:border-0">
                        <td className="py-2.5 text-foreground">
                          {s.query}
                          {s.zero && (
                            <span className="ml-2 rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-label text-[#b91c1c]">
                              Sin resultados
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-space-gray">{num(s.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card title="Nuevos vs. recurrentes">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.interaction.visitorMix} margin={{ left: -8 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
                    <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => num(Number(v))} />
                    <Bar dataKey="nuevos" name="Nuevos" stackId="v" fill={COLORS[0]} hide={!mixToggle.isOn("nuevos")} />
                    <Bar dataKey="recurrentes" name="Recurrentes" stackId="v" fill={COLORS[1]} radius={[4, 4, 0, 0]} hide={!mixToggle.isOn("recurrentes")} />
                  </BarChart>
                </ResponsiveContainer>
                <LegendChips
                  state={mixToggle}
                  items={[
                    { key: "nuevos", label: "Nuevos", color: COLORS[0] },
                    { key: "recurrentes", label: "Recurrentes", color: COLORS[1] },
                  ]}
                />
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Funnel({ steps }: { steps: { name: string; value: number }[] }) {
  const top = steps[0].value;
  return (
    <div className="flex flex-col gap-3">
      {steps.map((s, i) => {
        const widthPct = (s.value / top) * 100;
        const fromPrev = i === 0 ? 1 : s.value / steps[i - 1].value;
        const drop = i === 0 ? 0 : 1 - fromPrev;
        return (
          <div key={s.name}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{s.name}</span>
              <span className="text-space-gray">
                {num(s.value)}
                {i > 0 && (
                  <span className="ml-2 text-xs text-muted">
                    {(fromPrev * 100).toFixed(1)}% · −{(drop * 100).toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-7 rounded-lg bg-surface">
              <div
                className="flex h-full items-center rounded-lg"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${COLORS[0]}, ${COLORS[1]})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Heatmap({
  rows,
}: {
  rows: { day: string; hours: number[] }[];
}) {
  const max = Math.max(...rows.flatMap((r) => r.hours));
  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-[3px]">
        <thead>
          <tr>
            <th />
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} className="text-center font-mono text-[9px] text-muted">
                {h % 3 === 0 ? h : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.day}>
              <td className="pr-2 font-mono text-[10px] uppercase tracking-label text-muted">
                {r.day}
              </td>
              {r.hours.map((v, h) => (
                <td key={h}>
                  <div
                    title={`${r.day} ${h}:00 — ${v} visitas`}
                    className="h-5 w-5 rounded"
                    style={{
                      background: `rgba(27,159,224,${0.06 + 0.94 * (v / max)})`,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
