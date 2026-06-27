import Link from "next/link";
import { saveProduct, deleteProduct } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { DownloadsManager } from "@/components/admin/downloads-manager";
import { SpecsManager } from "@/components/admin/specs-manager";
import { cn } from "@/lib/utils";
import { parseDownloads, parseSpecs, type ProductWithImages } from "@/types";

const COLLECTIONS = ["etiquetas", "ribbons", "impresoras", "lectores"];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--color-accent)]"
      />
      <span className="flex flex-col">
        <span className="text-sm text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function ProductForm({ product }: { product?: ProductWithImages }) {
  const image = product?.product_images?.[0]?.image_url ?? "";
  const stock = product?.inventory?.stock_level ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <form
        action={saveProduct}
        className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 sm:p-8"
      >
        {product && <input type="hidden" name="id" defaultValue={product.id} />}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Nombre">
            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Slug" hint="Identificador en la URL, ej. etiquetas-termicas">
            <input
              name="slug"
              required
              defaultValue={product?.slug ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field
          label="Modo de precio"
          hint="«Precio fijo» muestra el precio y permite comprar. «Cotización» oculta el precio y muestra un botón para solicitarlo."
        >
          <select
            name="pricing_mode"
            defaultValue={product?.pricing_mode ?? "fixed"}
            className={inputClass}
          >
            <option value="fixed">Precio fijo</option>
            <option value="quote">Requiere cotización</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Field label="Precio" hint="Se ignora si el modo es «cotización».">
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.price ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Moneda">
            <select
              name="currency"
              defaultValue={product?.currency ?? "PEN"}
              className={inputClass}
            >
              <option value="PEN">PEN (S/)</option>
              <option value="USD">USD ($)</option>
            </select>
          </Field>
          <Field label="Stock">
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={stock}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Categoría">
            <select
              name="collection"
              defaultValue={product?.collection ?? "etiquetas"}
              className={inputClass}
            >
              {COLLECTIONS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Material / Tipo">
            <input
              name="material"
              defaultValue={product?.material ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Compatibilidad" hint="Separar con comas, ej. USB, Ethernet">
          <input
            name="compatibility"
            defaultValue={product?.compatibility?.join(", ") ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          label="Imagen del producto"
          hint="Sube un archivo (va directo a Storage) o pega una URL pública"
        >
          <ImageUpload productId={product?.id} defaultUrl={image} />
        </Field>

        <Field
          label="Descargables"
          hint="Ficha técnica, manuales u otros archivos (PDF, etc.)"
        >
          <DownloadsManager
            productId={product?.id}
            defaultDownloads={parseDownloads(product?.downloads)}
          />
        </Field>

        <Field
          label="Características"
          hint="Tabla de atributos (medidas, material, etc.). Cada fila se muestra u oculta de forma independiente."
        >
          <SpecsManager defaultSpecs={parseSpecs(product?.specs)} />
        </Field>

        <fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <legend className="px-1 font-mono text-[11px] uppercase tracking-label text-muted">
            Bloques visibles en la página del producto
          </legend>
          <Toggle
            name="show_description"
            label="Descripción"
            defaultChecked={product?.show_description ?? true}
          />
          <Toggle
            name="show_specs"
            label="Tabla de características y disponibilidad"
            defaultChecked={product?.show_specs ?? true}
          />
          <Toggle
            name="show_downloads"
            label="Descargables"
            defaultChecked={product?.show_downloads ?? true}
          />
        </fieldset>

        <Toggle
          name="is_featured"
          label="Destacar en la portada"
          defaultChecked={product?.is_featured ?? false}
        />

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className={buttonClasses("primary")}>
            Guardar producto
          </button>
          <Link href="/admin" className={buttonClasses("secondary")}>
            Cancelar
          </Link>
        </div>
      </form>

      {product && (
        <form
          action={deleteProduct}
          className="rounded-2xl border border-border bg-background p-6"
        >
          <input type="hidden" name="id" defaultValue={product.id} />
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Eliminar producto
              </h3>
              <p className="mt-1 text-xs text-muted">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <button
              type="submit"
              className="h-11 shrink-0 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors duration-300 ease-in-out hover:border-foreground"
            >
              Eliminar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
