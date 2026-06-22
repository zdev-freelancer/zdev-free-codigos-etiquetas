import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Returns the current authenticated user, or null. */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Guard for admin routes. Redirects to the login page unless the current
 * session belongs to a member of a tenant (`tenant_members`). Returns the
 * Supabase client, the user, and the tenant they administer.
 *
 * Single-tenant admin for now: a user administers one tenant. When a user
 * belongs to several, this picks the first — a tenant switcher comes later.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: membership } = await supabase
    .from("tenant_members")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/admin/login");

  return { supabase, user, tenantId: membership.tenant_id, role: membership.role };
}
