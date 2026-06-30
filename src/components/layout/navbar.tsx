"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { CartButton } from "@/components/cart/cart-button";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/button";
import { mainNav, catalogCategories } from "@/config/site";
import type { TenantBrand } from "@/lib/tenant";

export function Navbar({
  brand,
  quoteHref,
}: {
  brand: TenantBrand;
  quoteHref: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Link
              href="/"
              aria-label={`${brand.name} — inicio`}
              onClick={() => setMobileOpen(false)}
            >
              <Logo
                name={brand.name}
                logoUrl={brand.logoUrl}
                accent={brand.accent}
                accent2={brand.accent2}
              />
            </Link>

            <div className="hidden items-center gap-8 lg:flex">
              {mainNav.map((item) =>
                item.label === "Catálogo" ? (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setCatalogOpen(true)}
                    onMouseLeave={() => setCatalogOpen(false)}
                  >
                    <Link
                      href={item.href}
                      aria-expanded={catalogOpen}
                      className="flex items-center gap-1 text-sm text-space-gray transition-colors duration-300 ease-in-out hover:text-foreground"
                    >
                      {item.label}
                      <span aria-hidden className="text-[10px] text-steel">
                        ▾
                      </span>
                    </Link>

                    {catalogOpen && (
                      <div className="absolute left-1/2 top-full z-50 w-[32rem] -translate-x-1/2 pt-3">
                        <div className="overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-xl shadow-ink/5">
                          <ul className="grid grid-cols-2 gap-1">
                            {catalogCategories.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  className="block rounded-xl p-3 transition-colors duration-200 hover:bg-surface"
                                >
                                  <span className="block text-sm font-medium text-foreground">
                                    {c.label}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                                    {c.desc}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Link
                            href="/catalogo"
                            className="mt-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-accent-link transition-colors duration-200 hover:bg-surface"
                          >
                            Ver todo el catálogo <span aria-hidden>›</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-space-gray transition-colors duration-300 ease-in-out hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/rastreo"
              className="hidden text-sm text-space-gray transition-colors duration-300 ease-in-out hover:text-foreground lg:inline"
            >
              Rastrear pedido
            </Link>
            <Link
              href={quoteHref}
              className={buttonClasses(
                "primary",
                "hidden h-10 px-5 text-[13px] sm:inline-flex",
              )}
            >
              Cotizar
            </Link>
            <CartButton />
            <button
              type="button"
              aria-label="Menú"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="text-foreground lg:hidden"
            >
              {mobileOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </Container>

      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <Container>
            <div className="flex flex-col py-3">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-3 text-sm text-foreground"
                >
                  {item.label}
                </Link>
              ))}

              <p className="pt-4 text-xs font-medium uppercase tracking-label text-muted">
                Catálogo
              </p>
              <div className="grid grid-cols-2 gap-x-4">
                {catalogCategories.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-sm text-space-gray"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/rastreo"
                onClick={() => setMobileOpen(false)}
                className="mt-4 border-t border-border pt-4 text-sm text-foreground"
              >
                Rastrear pedido
              </Link>
              <Link
                href={quoteHref}
                onClick={() => setMobileOpen(false)}
                className={buttonClasses("primary", "mt-4")}
              >
                Cotizar
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
