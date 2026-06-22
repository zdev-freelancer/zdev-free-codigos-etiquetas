import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { signOutAction } from "@/app/admin/actions";

export function AdminHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/admin"
          aria-label="Panel de administración"
          className="flex items-center"
        >
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
  );
}
