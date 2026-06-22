import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client. Used to
 * gate rendering of localStorage-persisted state (the cart) so the server's
 * empty markup matches the client's first paint, avoiding hydration mismatch.
 */
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
