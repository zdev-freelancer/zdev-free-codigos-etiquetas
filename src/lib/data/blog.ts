import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/tenant";
import type { Tables } from "@/types/database.types";

export type BlogPost = Tables<"blog_posts">;

/** Published posts for the current tenant (public). */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/** All posts (any status) for the current tenant (admin). */
export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
