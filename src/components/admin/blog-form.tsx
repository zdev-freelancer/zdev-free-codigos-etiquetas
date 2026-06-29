import Link from "next/link";
import { saveBlogPost, deleteBlogPost } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { BlocksEditor } from "@/components/admin/blocks-editor";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { parseBlocks } from "@/config/blog";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/data/blog";

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

export function BlogForm({ post }: { post?: BlogPost }) {
  return (
    <div className="flex flex-col gap-8">
      <form
        action={saveBlogPost}
        className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 sm:p-8"
      >
        {post && <input type="hidden" name="id" defaultValue={post.id} />}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Título">
            <input
              name="title"
              required
              defaultValue={post?.title ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Slug" hint="En la URL, ej. como-elegir-ribbon">
            <input
              name="slug"
              required
              defaultValue={post?.slug ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Resumen" hint="Texto corto que aparece en el listado">
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={post?.excerpt ?? ""}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field label="Imagen de portada">
          <ImageUpload
            name="cover_image"
            productId="blog"
            defaultUrl={post?.cover_image ?? ""}
          />
        </Field>

        <div>
          <span className="font-mono text-[11px] uppercase tracking-label text-muted">
            Contenido (bloques)
          </span>
          <div className="mt-3">
            <BlocksEditor defaultBlocks={parseBlocks(post?.blocks)} />
          </div>
        </div>

        <Field label="Estado">
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className={buttonClasses("primary")}>
            Guardar artículo
          </button>
          <Link href="/admin/blog" className={buttonClasses("secondary")}>
            Cancelar
          </Link>
        </div>
      </form>

      {post && (
        <form
          action={deleteBlogPost}
          className="rounded-2xl border border-border bg-background p-6"
        >
          <input type="hidden" name="id" defaultValue={post.id} />
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Eliminar artículo
              </h3>
              <p className="mt-1 text-xs text-muted">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <ConfirmSubmit
              danger
              message="¿Eliminar este artículo? Esta acción no se puede deshacer."
              confirmLabel="Eliminar"
            >
              Eliminar
            </ConfirmSubmit>
          </div>
        </form>
      )}
    </div>
  );
}
