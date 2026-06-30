import { cache } from "react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Returns the current authenticated user, or null. */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Which tenant a user administers. Cached across requests (cookieless
 * service-role client) since membership essentially never changes — this keeps
 * the per-page admin guard down to a single Auth round-trip instead of two.
 */
const loadMembership = unstable_cache(
  async (userId: string) => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("tenant_members")
      .select("tenant_id, role")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    return data;
  },
  ["tenant-membership"],
  { revalidate: 300, tags: ["membership"] },
);

/**
 * Guard for admin routes. Redirects to the login page unless the current
 * session belongs to a member of a tenant (`tenant_members`). Returns the
 * Supabase client, the user, and the tenant they administer.
 *
 * `cache()` dedupes within a render so the panel layout and a page that also
 * needs `tenantId` share one execution. Single-tenant admin for now: a user
 * administers one tenant; when several, this picks the first.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const membership = await loadMembership(user.id);

  if (!membership) redirect("/admin/login");

  return { supabase, user, tenantId: membership.tenant_id, role: membership.role };
});
