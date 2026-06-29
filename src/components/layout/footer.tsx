import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { catalogCategories, mainNav, siteConfig } from "@/config/site";
import type { SocialLink, TenantBrand } from "@/lib/tenant";
import {
  InstagramIcon,
  TikTokIcon,
  XIcon,
  WhatsAppIcon,
  FacebookIcon,
  YouTubeIcon,
  LinkedInIcon,
} from "@/components/ui/icons";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  {
    instagram: InstagramIcon,
    tiktok: TikTokIcon,
    x: XIcon,
    whatsapp: WhatsAppIcon,
    facebook: FacebookIcon,
    youtube: YouTubeIcon,
    linkedin: LinkedInIcon,
  };

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

export function Footer({
  brand,
  social,
}: {
  brand: TenantBrand;
  social: SocialLink[];
}) {
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

            {social.length > 0 && (
              <div className="mt-6 flex items-center gap-5">
                {social.map((item) => {
                  const Icon = SOCIAL_ICONS[item.key];
                  if (!Icon) return null;
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[item.key] ?? item.key}
                      className="text-muted transition-colors duration-300 ease-in-out hover:text-accent-link"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
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
