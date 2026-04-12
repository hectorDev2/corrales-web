import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { is_active } = await req.json();

  if (typeof is_active !== "boolean") {
    return NextResponse.json({ error: "Parámetro inválido." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Actualizar perfil
  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_active })
    .eq("id", id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Banear / desbanear en auth para bloquear el login
  const { error: authError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: is_active ? "none" : "876000h",
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
