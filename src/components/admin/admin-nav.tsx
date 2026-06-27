"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; match: (p: string) => boolean }[] = [
  {
    href: "/admin",
    label: "Productos",
    match: (p) => p === "/admin" || p.startsWith("/admin/products"),
  },
  {
    href: "/admin/content",
    label: "Contenido del inicio",
    match: (p) => p.startsWith("/admin/content"),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 lg:flex-col">
      {NAV.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-space-gray hover:bg-background/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
