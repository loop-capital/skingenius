import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-side operations that need
 * to bypass RLS (e.g., writing scan_results on behalf of a user).
 *
 * NEVER expose this client to the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase URL or service role key");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
