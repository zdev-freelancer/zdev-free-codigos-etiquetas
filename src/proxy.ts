import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware` convention to `proxy`.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only the admin area is authenticated. Running the Supabase session refresh
  // (a network round-trip to Auth) on every storefront request was pure latency
  // for pages that never read a session — the cart is client-side and orders are
  // guest checkouts. Scope it to /admin so public pages stay fast.
  matcher: ["/admin/:path*"],
};
