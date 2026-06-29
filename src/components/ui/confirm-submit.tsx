"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";

/**
 * A submit button that asks for confirmation in a modal before submitting its
 * parent form. Use inside a `<form action={...}>`.
 */
export function ConfirmSubmit({
  children,
  message = "¿Confirmar esta acción?",
  confirmLabel = "Confirmar",
  danger = false,
  className,
}: {
  children: React.ReactNode;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const trigger = danger
    ? "h-11 shrink-0 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors duration-300 ease-in-out hover:border-foreground"
    : buttonClasses("primary", className);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={trigger}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-2xl">
            <p className="text-sm leading-relaxed text-foreground">{message}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button type="submit" className={buttonClasses("primary")}>
                {confirmLabel}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={buttonClasses("secondary")}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
