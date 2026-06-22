-- ============================================================================
-- Kanso — Harden helper functions (security advisor remediation)
-- 1. Pin search_path on set_updated_at to prevent search_path injection.
-- 2. Remove trigger-only functions from the exposed PostgREST RPC surface.
--    Triggers still fire (they run as the table owner); only direct RPC access
--    by anon/authenticated is revoked.
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
