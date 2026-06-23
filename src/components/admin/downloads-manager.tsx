"use client";

import { useState } from "react";
import { uploadViaSignedUrl } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ProductDownload } from "@/types";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

/**
 * Manages the product's downloadable files (datasheets, manuals…). Files are
 * uploaded straight to the `product-files` bucket via signed URLs; the list is
 * serialized into the hidden `downloads` field (JSON) for the Server Action.
 */
export function DownloadsManager({
  productId,
  defaultDownloads = [],
}: {
  productId?: string;
  defaultDownloads?: ProductDownload[];
}) {
  const [items, setItems] = useState<ProductDownload[]>(defaultDownloads);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch(i: number, next: Partial<ProductDownload>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...next } : it)));
  }

  async function handleFile(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(i);
    setError(null);
    try {
      const url = await uploadViaSignedUrl(file, {
        bucket: "product-files",
        productId,
      });
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === i
            ? { url, label: it.label || file.name.replace(/\.[^.]+$/, "") }
            : it,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Submitted with the form; only rows with a URL are kept. */}
      <input
        type="hidden"
        name="downloads"
        value={JSON.stringify(items.filter((it) => it.url))}
      />

      {items.length === 0 && (
        <p className="text-xs text-muted">
          Sin descargables. Agrega la ficha técnica u otros archivos (PDF, etc.).
        </p>
      )}

      {items.map((it, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
        >
          <input
            value={it.label}
            onChange={(e) => patch(i, { label: e.target.value })}
            placeholder="Nombre (ej. Ficha técnica)"
            className={cn(inputClass, "sm:flex-1")}
          />
          <input
            type="file"
            onChange={(e) => handleFile(i, e)}
            disabled={uploading === i}
            className={cn(inputClass, "py-2 sm:flex-1")}
          />
          {it.url && (
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-accent-link"
            >
              ver
            </a>
          )}
          <button
            type="button"
            onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
            className="text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            Quitar
          </button>
        </div>
      ))}

      {uploading !== null && (
        <span className="text-xs text-muted">Subiendo archivo…</span>
      )}
      {error && <span className="text-xs font-medium text-accent-2">Error: {error}</span>}

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, { label: "", url: "" }])}
        className="self-start text-sm font-medium text-accent-link transition-opacity hover:opacity-70"
      >
        + Agregar descargable
      </button>
    </div>
  );
}
