import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key — bypasses RLS. Only ever
// import this inside server actions/route handlers, never in client code.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
