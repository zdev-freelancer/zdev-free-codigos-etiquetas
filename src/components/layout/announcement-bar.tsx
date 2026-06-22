"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/ui/icons";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-accent-2 text-white">
      <div className="relative mx-auto flex max-w-7xl items-center justify-center px-10 py-2.5">
        <p className="text-center text-xs font-medium tracking-wide">
          Asesoría especializada en identificación automática · Despacho a todo
          el Perú
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar aviso"
          className="absolute right-3 text-white/80 transition-opacity duration-300 ease-in-out hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
