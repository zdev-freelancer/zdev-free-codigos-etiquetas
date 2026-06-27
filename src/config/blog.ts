/**
 * Blog content is a list of typed blocks (the "visual structure templates").
 * Stored in `blog_posts.blocks` (jsonb) and rendered by BlogBlocks.
 */
export type BlogBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "video"; url: string }
  | { type: "quote"; text: string; author?: string };

export type BlockType = BlogBlock["type"];

export const BLOCK_TEMPLATES: { type: BlockType; label: string; hint: string }[] =
  [
    { type: "heading", label: "Título", hint: "Subtítulo de sección" },
    { type: "paragraph", label: "Párrafo", hint: "Bloque de texto" },
    { type: "image", label: "Imagen", hint: "Sube una imagen con epígrafe" },
    { type: "video", label: "Video", hint: "Enlace de YouTube o Vimeo" },
    { type: "quote", label: "Cita", hint: "Destacado o testimonio" },
  ];

export function emptyBlock(type: BlockType): BlogBlock {
  switch (type) {
    case "image":
      return { type, url: "", caption: "" };
    case "video":
      return { type, url: "" };
    case "quote":
      return { type, text: "", author: "" };
    default:
      return { type, text: "" };
  }
}

export function parseBlocks(value: unknown): BlogBlock[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (b): b is BlogBlock =>
      !!b &&
      typeof b === "object" &&
      typeof (b as { type?: unknown }).type === "string",
  );
}

/** Turn a YouTube/Vimeo watch link into an embeddable URL (or null). */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com") {
      if (u.pathname.startsWith("/embed/")) return url;
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (host === "player.vimeo.com") return url;
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
