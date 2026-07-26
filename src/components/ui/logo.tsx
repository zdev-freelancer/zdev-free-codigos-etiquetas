import Image from "next/image";
import { cn } from "@/lib/utils";

// Fallback brand colors (Códigos y Etiquetas) when a tenant has no theme set.
const DEFAULT_ACCENT = "#1b9fe0";
const DEFAULT_ACCENT2 = "#2a2a8c";

/**
 * This deployment's own brand mark (`public/logo.png`). One front = one tenant,
 * so each deploy ships its logo here; a tenant-uploaded `logo_url` still wins.
 */
const DEFAULT_LOGO = "/logo.png";

/**
 * Generic brand emblem — concentric ring + open "C" + "e", rendered with the
 * tenant's vertical gradient (accent → accent2). Used as the logo fallback when
 * a tenant has no uploaded `logo_url`.
 */
export function LogoMark({
  className,
  accent = DEFAULT_ACCENT,
  accent2 = DEFAULT_ACCENT2,
  label = "Logo",
}: {
  className?: string;
  accent?: string;
  accent2?: string;
  label?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={label}>
      <defs>
        <linearGradient id="brand-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={accent2} />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="url(#brand-gradient)"
        strokeWidth="3"
      />

      {/* Open "C" */}
      <path
        d="M 91.1 81.8 A 38 38 0 1 1 91.1 38.2"
        fill="none"
        stroke="url(#brand-gradient)"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Center "e" */}
      <text
        x="60"
        y="62"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="44"
        fill="url(#brand-gradient)"
      >
        e
      </text>
    </svg>
  );
}

/**
 * Emblem + wordmark lockup. Brand identity (name, logo image, colors) comes
 * from the tenant row so the same storefront template rebrands per tenant.
 */
export function Logo({
  name = "Códigos y Etiquetas",
  logoUrl = null,
  className,
  markClassName,
  withText = true,
}: {
  name?: string;
  logoUrl?: string | null;
  /** Accepted for callers that theme the standalone `LogoMark`; the lockup
   *  renders the brand image instead. */
  accent?: string;
  accent2?: string;
  className?: string;
  markClassName?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {logoUrl ? (
        // A tenant-uploaded logo can live on any host, so it stays a plain <img>
        // rather than next/image (which would need the host allow-listed).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={name}
          className={cn("h-8 w-8 shrink-0 object-contain", markClassName)}
        />
      ) : (
        <Image
          src={DEFAULT_LOGO}
          alt={name}
          width={80}
          height={80}
          priority
          className={cn("h-8 w-8 shrink-0 object-contain", markClassName)}
        />
      )}
      {withText && (
        <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-foreground">
          {name}
        </span>
      )}
    </span>
  );
}
