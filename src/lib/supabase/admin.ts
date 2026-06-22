import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Server-only Supabase client authenticated with the `service_role` key.
 * BYPASSES Row Level Security — use it solely for trusted server work that
 * cannot run under a user session: creating guest orders and reading each
 * tenant's Mercado Pago credentials.
 *
 * NEVER import this into a Client Component or expose the key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Set the service_role key (Supabase → Settings → API) to enable " +
        "guest orders and per-tenant payments.",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
