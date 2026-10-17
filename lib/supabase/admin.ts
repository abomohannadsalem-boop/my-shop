import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with the service_role key (bypasses RLS).
 * NEVER import this from a client component. Needs SUPABASE_SERVICE_ROLE_KEY in .env.local / Render.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
