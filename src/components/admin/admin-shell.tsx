import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { FlashToast } from "@/components/ui/flash-toast";
import { signOutAction } from "@/app/admin/actions";

/** Admin panel shell: top bar + sidebar navigation + main content area. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" aria-label="Panel de administración">
            <Logo />
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-space-gray transition-colors duration-300 ease-in-out hover:text-foreground"
            >
              Ver tienda
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-space-gray transition-colors duration-300 ease-in-out hover:text-foreground"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
    </div>
  );
}
