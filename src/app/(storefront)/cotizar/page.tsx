import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getProductBySlug } from "@/lib/data/products";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requestQuote } from "./actions";

export const metadata: Metadata = {
  title: "Solicitar cotización",
  description:
    "Solicita una cotización a medida para productos de identificación automática.",
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          required={required}
          className={cn(inputClass, "resize-y")}
        />
      ) : (
        <input name={name} type={type} required={required} className={inputClass} />
      )}
    </label>
  );
}

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; enviado?: string; code?: string }>;
}) {
  const sp = await searchParams;

  if (sp.enviado && sp.code) {
    return (
      <Container className="flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-label text-accent-link">
          Solicitud enviada
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          ¡Gracias! Te contactaremos pronto.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-space-gray">
          Registramos tu solicitud de cotización. Tu código de seguimiento es{" "}
          <span className="font-semibold text-foreground">{sp.code}</span>.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={`/rastreo?code=${sp.code}`} className={buttonClasses("primary")}>
            Ver estado
          </Link>
          <Link href="/catalogo" className={buttonClasses("secondary")}>
            Volver al catálogo
          </Link>
        </div>
      </Container>
    );
  }

  const product = sp.producto ? await getProductBySlug(sp.producto) : null;

  return (
    <Container className="max-w-xl py-16">
      <p className="font-mono text-xs uppercase tracking-label text-accent-link">
        Cotización
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Solicitar cotización
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-space-gray">
        Cuéntanos qué necesitas y te enviamos una propuesta a medida.
        {product && (
          <>
            {" "}
            Producto:{" "}
            <span className="font-medium text-foreground">{product.name}</span>.
          </>
        )}
      </p>

      <form action={requestQuote} className="mt-8 flex flex-col gap-5">
        {product && (
          <input type="hidden" name="product_slug" value={product.slug} />
        )}
        <Field label="Nombre / Empresa" name="name" required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" required />
          <Field label="Teléfono" name="phone" />
        </div>
        <Field
          label="Detalle / cantidades"
          name="message"
          textarea
          required
        />
        <button
          type="submit"
          className={buttonClasses("primary", "mt-2 self-start")}
        >
          Enviar solicitud
        </button>
      </form>
    </Container>
  );
}
