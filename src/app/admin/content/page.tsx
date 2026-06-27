import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/tenant";
import { saveHomeContent } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { buttonClasses } from "@/components/ui/button";
import { resolveHomeContent } from "@/config/home-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contenido del inicio",
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

export default async function ContentPage() {
  await requireAdmin();
  const tenant = await getCurrentTenant();
  const c = resolveHomeContent(tenant.home_content);

  return (
    <AdminShell>
      <form action={saveHomeContent} className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Contenido del inicio
            </h1>
            <p className="mt-1 text-sm text-muted">
              Edita los textos de las secciones de la página de inicio.
            </p>
          </div>
          <button type="submit" className={buttonClasses("primary")}>
            Guardar cambios
          </button>
        </div>

        <Group title="Hero (sección principal)">
          <Field
            label="Antetítulo"
            name="hero_eyebrow"
            defaultValue={c.hero.eyebrow}
          />
          <Field
            label="Título"
            name="hero_title"
            defaultValue={c.hero.title}
            textarea
          />
          <Field
            label="Subtítulo"
            name="hero_subtitle"
            defaultValue={c.hero.subtitle}
            textarea
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Botón principal"
              name="hero_cta_primary"
              defaultValue={c.hero.ctaPrimary}
              hint="Enlaza al catálogo"
            />
            <Field
              label="Enlace secundario"
              name="hero_cta_secondary"
              defaultValue={c.hero.ctaSecondary}
              hint="Enlaza a cotización"
            />
          </div>
        </Group>

        <Group title="Indicadores del hero (3)">
          {c.stats.map((s, i) => (
            <div key={i} className="grid gap-5 sm:grid-cols-2">
              <Field
                label={`Dato ${i + 1} — valor`}
                name={`stat_${i}_value`}
                defaultValue={s.value}
              />
              <Field
                label={`Dato ${i + 1} — etiqueta`}
                name={`stat_${i}_label`}
                defaultValue={s.label}
              />
            </div>
          ))}
        </Group>

        <Group title="Sección «Líneas de producto»">
          <Field
            label="Antetítulo"
            name="lines_eyebrow"
            defaultValue={c.lines.eyebrow}
          />
          <Field
            label="Título"
            name="lines_title"
            defaultValue={c.lines.title}
          />
        </Group>

        <Group title="Sección «Destacados»">
          <Field
            label="Antetítulo"
            name="featured_eyebrow"
            defaultValue={c.featured.eyebrow}
          />
          <Field
            label="Título"
            name="featured_title"
            defaultValue={c.featured.title}
          />
        </Group>

        <Group title="Propuesta de valor (3 bloques)">
          {c.valueProps.map((vp, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl border border-border p-4"
            >
              <Field
                label={`Bloque ${i + 1} — título`}
                name={`vp_${i}_title`}
                defaultValue={vp.title}
              />
              <Field
                label={`Bloque ${i + 1} — texto`}
                name={`vp_${i}_desc`}
                defaultValue={vp.desc}
                textarea
              />
            </div>
          ))}
        </Group>

        <Group title="Banner corporativo">
          <Field
            label="Antetítulo"
            name="banner_eyebrow"
            defaultValue={c.banner.eyebrow}
          />
          <Field
            label="Título"
            name="banner_title"
            defaultValue={c.banner.title}
            textarea
          />
          <Field
            label="Subtítulo"
            name="banner_subtitle"
            defaultValue={c.banner.subtitle}
            textarea
          />
          <Field
            label="Botón"
            name="banner_cta"
            defaultValue={c.banner.cta}
            hint="Enlaza a cotización"
          />
        </Group>

        <div className="flex items-center gap-3">
          <button type="submit" className={buttonClasses("primary")}>
            Guardar cambios
          </button>
          <Link
            href="/"
            target="_blank"
            className={buttonClasses("secondary")}
          >
            Ver inicio
          </Link>
        </div>
      </form>
    </AdminShell>
  );
}
