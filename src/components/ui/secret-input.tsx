"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

/** Masked input with a show/hide eye — for secrets (API keys, tokens). */
export function SecretInput({
  name,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(inputClass, "pr-11 font-mono")}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar" : "Mostrar"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
      >
        {show ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
