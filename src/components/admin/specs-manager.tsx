"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductSpec } from "@/types";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

/**
 * Editable characteristics table for a product. Each row (medidas, material, …)
 * carries its own visibility flag, independent of the product. Serialized into
 * the hidden `specs` field (JSON) for the Server Action.
 */
export function SpecsManager({
  defaultSpecs = [],
}: {
  defaultSpecs?: ProductSpec[];
}) {
  const [rows, setRows] = useState<ProductSpec[]>(defaultSpecs);

  const set = (i: number, patch: Partial<ProductSpec>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-3">
      <input
        type="hidden"
        name="specs"
        value={JSON.stringify(rows.filter((r) => r.label.trim() || r.value.trim()))}
      />

      {rows.length === 0 && (
        <p className="text-xs text-muted">
          Sin características. Agrega filas (medidas, material, etc.); cada una se
          muestra u oculta por separado.
        </p>
      )}

      {rows.map((r, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
        >
          <input
            value={r.label}
            onChange={(e) => set(i, { label: e.target.value })}
            placeholder="Característica (ej. Medidas)"
            className={cn(inputClass, "sm:flex-1")}
          />
          <input
            value={r.value}
            onChange={(e) => set(i, { value: e.target.value })}
            placeholder="Valor (ej. 10 × 15 cm)"
            className={cn(inputClass, "sm:flex-1")}
          />
          <label className="flex shrink-0 items-center gap-2 text-xs text-space-gray">
            <input
              type="checkbox"
              checked={r.visible}
              onChange={(e) => set(i, { visible: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-[var(--color-accent)]"
            />
            Visible
          </label>
          <button
            type="button"
            onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))}
            className="shrink-0 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            Quitar
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setRows((p) => [...p, { label: "", value: "", visible: true }])
        }
        className="self-start text-sm font-medium text-accent-link transition-opacity hover:opacity-70"
      >
        + Agregar característica
      </button>
    </div>
  );
}
