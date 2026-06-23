import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a file straight from the browser to Supabase Storage using a
 * server-minted signed upload URL (see /api/admin/upload-url). Returns the
 * public URL. No client session / RLS dependency, no Server Action body limit.
 */
export async function uploadViaSignedUrl(
  file: File,
  opts: { bucket?: "product-images" | "product-files"; productId?: string } = {},
): Promise<string> {
  const res = await fetch("/api/admin/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      productId: opts.productId,
      bucket: opts.bucket,
    }),
  });
  if (!res.ok) throw new Error("No se pudo autorizar la subida.");

  const { path, token, bucket } = await res.json();
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type || undefined,
    });
  if (error) throw error;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
