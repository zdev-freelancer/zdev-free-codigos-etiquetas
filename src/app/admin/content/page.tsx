import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/tenant";
import { saveHomeContent, saveAboutContent } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlocksEditor } from "@/components/admin/blocks-editor";
import { buttonClasses } from "@/components/ui/button";
import { resolveHomeContent } from "@/config/home-content";
import { resolveAboutContent } from "@/config/about-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gestión de contenido",
  robots: { index: false },
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

function Field({
  label,
  name,
  defaultValue,
  textarea,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          defaultValue={defaultValue}
          className={cn(inputClass, "resize-y")}
        />
      ) : (
        <input name={name} defaultValue={defaultValue} className={inputClass} />
      )}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-background p-6">
      <legend className="px-2 text-sm font-semibold text-foreground">
        {title}
      </legend>
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = sp.tab === "quienes" ? "quienes" : "inicio";

  const tenant = await getCurrentTenant();
  const home = resolveHomeContent(tenant.home_content);
  const about = resolveAboutContent(tenant.about_content);

  const tabs = [
    { key: "inicio", label: "Inicio", href: "/admin/content?tab=inicio" },
    { key: "quienes", label: "Quiénes Somos", href: "/admin/content?tab=quienes" },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Gestión de contenido
      </h1>

      <div className="mt-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              tab === t.key
                ? "border-accent text-foreground"
                : "border-transparent text-space-gray hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "inicio" ? (
        <form action={saveHomeContent} className="mt-8 flex flex-col gap-6">
          <Group title="Hero (sección principal)">
            <Field label="Antetítulo" name="hero_eyebrow" defaultValue={home.hero.eyebrow} />
            <Field label="Título" name="hero_title" defaultValue={home.hero.title} textarea />
            <Field label="Subtítulo" name="hero_subtitle" defaultValue={home.hero.subtitle} textarea />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Botón principal" name="hero_cta_primary" defaultValue={home.hero.ctaPrimary} hint="Enlaza al catálogo" />
              <Field label="Enlace secundario" name="hero_cta_secondary" defaultValue={home.hero.ctaSecondary} hint="Enlaza a cotización" />
            </div>
          </Group>

          <Group title="Indicadores del hero (3)">
            {home.stats.map((s, i) => (
              <div key={i} className="grid gap-5 sm:grid-cols-2">
                <Field label={`Dato ${i + 1} — valor`} name={`stat_${i}_value`} defaultValue={s.value} />
                <Field label={`Dato ${i + 1} — etiqueta`} name={`stat_${i}_label`} defaultValue={s.label} />
              </div>
            ))}
          </Group>

          <Group title="Sección «Líneas de producto»">
            <Field label="Antetítulo" name="lines_eyebrow" defaultValue={home.lines.eyebrow} />
            <Field label="Título" name="lines_title" defaultValue={home.lines.title} />
          </Group>

          <Group title="Sección «Destacados»">
            <Field label="Antetítulo" name="featured_eyebrow" defaultValue={home.featured.eyebrow} />
            <Field label="Título" name="featured_title" defaultValue={home.featured.title} />
          </Group>

          <Group title="Propuesta de valor (3 bloques)">
            {home.valueProps.map((vp, i) => (
              <div key={i} className="flex flex-col gap-4 rounded-xl border border-border p-4">
                <Field label={`Bloque ${i + 1} — título`} name={`vp_${i}_title`} defaultValue={vp.title} />
                <Field label={`Bloque ${i + 1} — texto`} name={`vp_${i}_desc`} defaultValue={vp.desc} textarea />
              </div>
            ))}
          </Group>

          <Group title="Banner corporativo">
            <Field label="Antetítulo" name="banner_eyebrow" defaultValue={home.banner.eyebrow} />
            <Field label="Título" name="banner_title" defaultValue={home.banner.title} textarea />
            <Field label="Subtítulo" name="banner_subtitle" defaultValue={home.banner.subtitle} textarea />
            <Field label="Botón" name="banner_cta" defaultValue={home.banner.cta} hint="Enlaza a cotización" />
          </Group>

          <Group title="Bloques adicionales (se muestran antes del banner)">
            <BlocksEditor defaultBlocks={home.blocks} />
          </Group>

          <div>
            <button type="submit" className={buttonClasses("primary")}>
              Guardar Inicio
            </button>
          </div>
        </form>
      ) : (
        <form action={saveAboutContent} className="mt-8 flex flex-col gap-6">
          <Group title="Encabezado">
            <Field label="Antetítulo" name="about_eyebrow" defaultValue={about.eyebrow} />
            <Field label="Título" name="about_title" defaultValue={about.title} textarea />
            <Field label="Introducción" name="about_intro" defaultValue={about.intro} textarea />
          </Group>

          <Group title="Contenido (bloques)">
            <BlocksEditor defaultBlocks={about.blocks} />
          </Group>

          <div>
            <button type="submit" className={buttonClasses("primary")}>
              Guardar Quiénes Somos
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
