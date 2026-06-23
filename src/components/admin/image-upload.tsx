"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

/**
 * Image picker that uploads straight from the browser to Supabase Storage using
 * a server-minted signed upload URL (see /api/admin/upload-url). This avoids the
 * Server Action / Vercel request-body limits AND does not depend on the browser
 * client carrying the admin session. Only the resulting public URL is submitted
 * via the form's `image_url` field.
 */
export function ImageUpload({
  productId,
  defaultUrl = "",
}: {
  productId?: string;
  defaultUrl?: string;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError(null);
    try {
      // 1) ask the server (admin-only) for a signed upload URL
      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, productId }),
      });
      if (!res.ok) throw new Error("No se pudo autorizar la subida.");
      const { path, token } = await res.json();

      // 2) upload the file directly to Storage with the signed token
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type || undefined,
        });
      if (upErr) throw upErr;

      setUrl(
        supabase.storage.from("product-images").getPublicUrl(path).data
          .publicUrl,
      );
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Vista previa"
            className="h-20 w-20 shrink-0 rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border text-[11px] text-muted">
            Sin imagen
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={status === "uploading"}
          className={cn(inputClass, "py-2")}
        />
      </div>

      <input
        type="url"
        name="image_url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL pública (o sube un archivo arriba)"
        className={inputClass}
      />

      {status === "uploading" && (
        <span className="text-xs text-muted">Subiendo imagen…</span>
      )}
      {status === "error" && (
        <span className="text-xs font-medium text-accent-2">Error: {error}</span>
      )}
    </div>
  );
}
