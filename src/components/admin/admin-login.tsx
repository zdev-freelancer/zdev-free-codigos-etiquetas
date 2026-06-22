"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError("Credenciales inválidas. Verifica e intenta de nuevo.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo markClassName="h-10 w-10" />
        </div>
        <h1 className="mt-8 text-center text-xl font-semibold tracking-tight text-foreground">
          Panel de administración
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Ingresa con tu cuenta de administrador.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
        >
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-label text-muted">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-label text-muted">
              Contraseña
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>

          {error && (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-xs text-foreground">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={buttonClasses("primary", "mt-2")}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
