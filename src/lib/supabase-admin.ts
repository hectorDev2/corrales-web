import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/**
 * Supabase client con service_role key — solo usar en API routes / server.
 * NUNCA exponer al browser.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
