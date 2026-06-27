"use client";

import { useState } from "react";
import { uploadViaSignedUrl } from "@/lib/upload";
import {
  BLOCK_TEMPLATES,
  emptyBlock,
  type BlockType,
  type BlogBlock,
} from "@/config/blog";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

const LABELS: Record<BlockType, string> = Object.fromEntries(
  BLOCK_TEMPLATES.map((t) => [t.type, t.label]),
) as Record<BlockType, string>;

export function BlocksEditor({
  defaultBlocks = [],
}: {
  defaultBlocks?: BlogBlock[];
}) {
  const [blocks, setBlocks] = useState<BlogBlock[]>(defaultBlocks);
  const [uploading, setUploading] = useState<number | null>(null);

  const set = (i: number, patch: Record<string, unknown>) =>
    setBlocks((prev) =>
      prev.map((b, idx) => (idx === i ? ({ ...b, ...patch } as BlogBlock) : b)),
    );

  const move = (i: number, dir: -1 | 1) =>
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function onImage(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(i);
    try {
      const url = await uploadViaSignedUrl(file, {
        bucket: "product-images",
        productId: "blog",
      });
      set(i, { url });
    } catch {
      // surfaced by the empty preview; keep it simple
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />

      {blocks.length === 0 && (
        <p className="text-xs text-muted">
          Sin bloques todavía. Usa las plantillas de abajo para construir el
          artículo.
        </p>
      )}

      {blocks.map((b, i) => (
        <div key={i} className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-label text-muted">
              {LABELS[b.type]}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted">
              <button
                type="button"
                onClick={() => move(i, -1)}
                aria-label="Subir"
                className="hover:text-foreground"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                aria-label="Bajar"
                className="hover:text-foreground"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => setBlocks((p) => p.filter((_, idx) => idx !== i))}
                className="font-medium hover:text-foreground"
              >
                Quitar
              </button>
            </div>
          </div>

          {b.type === "heading" && (
            <input
              value={b.text}
              onChange={(e) => set(i, { text: e.target.value })}
              placeholder="Título de la sección"
              className={inputClass}
            />
          )}

          {b.type === "paragraph" && (
            <textarea
              value={b.text}
              onChange={(e) => set(i, { text: e.target.value })}
              rows={4}
              placeholder="Escribe el texto…"
              className={cn(inputClass, "resize-y")}
            />
          )}

          {b.type === "quote" && (
            <div className="flex flex-col gap-2">
              <textarea
                value={b.text}
                onChange={(e) => set(i, { text: e.target.value })}
                rows={2}
                placeholder="Cita o destacado"
                className={cn(inputClass, "resize-y")}
              />
              <input
                value={b.author ?? ""}
                onChange={(e) => set(i, { author: e.target.value })}
                placeholder="Autor (opcional)"
                className={inputClass}
              />
            </div>
          )}

          {b.type === "video" && (
            <input
              value={b.url}
              onChange={(e) => set(i, { url: e.target.value })}
              placeholder="https://youtube.com/watch?v=… o https://vimeo.com/…"
              className={inputClass}
            />
          )}

          {b.type === "image" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {b.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.url}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-[11px] text-muted">
                    Imagen
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImage(i, e)}
                  disabled={uploading === i}
                  className={cn(inputClass, "py-2")}
                />
              </div>
              <input
                value={b.caption ?? ""}
                onChange={(e) => set(i, { caption: e.target.value })}
                placeholder="Epígrafe (opcional)"
                className={inputClass}
              />
              {uploading === i && (
                <span className="text-xs text-muted">Subiendo imagen…</span>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <span className="mr-1 self-center font-mono text-[11px] uppercase tracking-label text-muted">
          Agregar:
        </span>
        {BLOCK_TEMPLATES.map((t) => (
          <button
            key={t.type}
            type="button"
            title={t.hint}
            onClick={() => setBlocks((p) => [...p, emptyBlock(t.type)])}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface"
          >
            + {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
