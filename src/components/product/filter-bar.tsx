import Link from "next/link";
import { cn } from "@/lib/utils";

function toLabel(collection: string) {
  return collection.charAt(0).toUpperCase() + collection.slice(1);
}

/**
 * Minimal, server-rendered collection filter. Each collection is its own
 * crawlable route (/collections/[slug]); "Todo" returns to the full catalog.
 * No client-side JavaScript required.
 */
export function FilterBar({
  collections,
  active,
}: {
  collections: string[];
  active?: string;
}) {
  const items = [
    { value: undefined as string | undefined, label: "Todo" },
    ...collections.map((c) => ({ value: c, label: toLabel(c) })),
  ];

  return (
    <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
      {items.map((item) => {
        const isActive = item.value
          ? active === item.value
          : !active;
        const href = item.value ? `/collections/${item.value}` : "/";

        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "font-mono text-xs uppercase tracking-label transition-colors duration-300 ease-in-out",
              isActive ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
