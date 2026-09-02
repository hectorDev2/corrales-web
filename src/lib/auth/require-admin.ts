import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type AdminAuthResult =
  | {
      user: { id: string };
      response?: never;
    }
  | {
      response: NextResponse<{ error: string }>;
      user?: never;
    };

/**
 * Authorization at the API boundary. The proxy protects navigation only; it
 * must never be the only control for an endpoint that uses service_role.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { response: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin authorization error:", profileError);
    return {
      response: NextResponse.json(
        { error: "No se pudo verificar la autorización." },
        { status: 500 },
      ),
    };
  }

  if (profile?.role !== "admin" || !profile.is_active) {
    return { response: NextResponse.json({ error: "Acceso denegado." }, { status: 403 }) };
  }

  return { user };
}
