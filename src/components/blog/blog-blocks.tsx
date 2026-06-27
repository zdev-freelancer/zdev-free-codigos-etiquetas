import { toEmbedUrl, type BlogBlock } from "@/config/blog";

/** Renders a post's blocks (the public article body). */
export function BlogBlocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="mt-4 text-2xl font-semibold tracking-tight text-foreground"
              >
                {b.text}
              </h2>
            );
          case "paragraph":
            return (
              <p
                key={i}
                className="whitespace-pre-line text-base leading-relaxed text-space-gray"
              >
                {b.text}
              </p>
            );
          case "image":
            return b.url ? (
              <figure key={i} className="my-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.url}
                  alt={b.caption ?? ""}
                  className="w-full rounded-2xl border border-border"
                />
                {b.caption && (
                  <figcaption className="mt-2 text-center text-xs text-muted">
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            ) : null;
          case "video": {
            const embed = toEmbedUrl(b.url);
            return embed ? (
              <div
                key={i}
                className="aspect-video overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <iframe
                  src={embed}
                  title="Video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : b.url ? (
              <a
                key={i}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent-link"
              >
                Ver video ›
              </a>
            ) : null;
          }
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-accent pl-5 text-lg italic text-foreground"
              >
                {b.text}
                {b.author && (
                  <footer className="mt-2 text-sm not-italic text-muted">
                    — {b.author}
                  </footer>
                )}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
