import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

const variants: Record<Variant, string> = {
  // Brand gradient pill (cyan → indigo, from the logo).
  primary: "bg-brand-gradient text-white hover:opacity-90",
  // Subtle outlined pill for secondary actions.
  secondary: "border border-border text-foreground hover:border-foreground",
};

/**
 * Shared pill button classes. Works on both <button> and <Link>.
 * Default height is `h-12`; override via `className` (twMerge resolves conflicts).
 */
export function buttonClasses(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-medium transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-40",
    variants[variant],
    className,
  );
}
