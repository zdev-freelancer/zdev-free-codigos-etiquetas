import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { catalogCategories, mainNav, siteConfig, socialLinks } from "@/config/site";
import type { TenantBrand } from "@/lib/tenant";
import {
  InstagramIcon,
  TikTokIcon,
  XIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  x: XIcon,
  whatsapp: WhatsAppIcon,
} as const;

export function Footer({ brand }: { brand: TenantBrand }) {
  return (
    <footer className="border-t border-border">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo
              name={brand.name}
              logoUrl={brand.logoUrl}
              accent={brand.accent}
              accent2={brand.accent2}
              markClassName="h-9 w-9"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>

            <div className="mt-6 flex items-center gap-5">
              {socialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-muted transition-colors duration-300 ease-in-out hover:text-accent-link"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-label text-muted">
              Catálogo
            </h4>
            <ul className="mt-4 space-y-3">
              {catalogCategories.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-space-gray transition-colors duration-300 ease-in-out hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-label text-muted">
              Navegación
            </h4>
            <ul className="mt-4 space-y-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-space-gray transition-colors duration-300 ease-in-out hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} {brand.name}. Lima, Perú.
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono uppercase tracking-label">
              Identificación &amp; etiquetado
            </span>
            {/* Discreet admin access */}
            <Link
              href="/admin"
              aria-label="Acceso administración"
              title="Administración"
              className="text-border transition-colors duration-300 ease-in-out hover:text-muted"
            >
              ·
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
