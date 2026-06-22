import { cn } from "@/lib/utils";

/** Centered max-width layout primitive with consistent horizontal gutters. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}
