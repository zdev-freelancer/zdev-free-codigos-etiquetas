"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Shows a success toast when the URL carries an `?ok=<message>` param (set by
 * server actions after a successful mutation), then strips it from the URL.
 */
export function FlashToast() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [msg, setMsg] = useState<string | null>(null);
  const ok = sp.get("ok");

  useEffect(() => {
    if (!ok) return;
    setMsg(ok);
    const params = new URLSearchParams(Array.from(sp.entries()));
    params.delete("ok");
    router.replace(
      pathname + (params.toString() ? `?${params.toString()}` : ""),
      { scroll: false },
    );
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);

  if (!msg) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg">
      ✓ {msg}
    </div>
  );
}
