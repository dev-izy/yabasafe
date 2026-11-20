import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client with the service role key. Bypasses row level security.
// Used only for sending push notifications. Never import this in a client component.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}