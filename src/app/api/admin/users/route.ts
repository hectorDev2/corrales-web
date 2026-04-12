import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { full_name, email, password, phone } = await req.json();

  if (!full_name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Nombre, email y contraseña son obligatorios." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name.trim(), role: "delivery" },
  });

  if (error) {
    const msg = error.message.includes("already registered")
      ? "Ya existe un usuario con ese email."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Actualizar phone si fue provisto (el trigger no lo maneja)
  if (phone?.trim() && data.user) {
    await admin
      .from("profiles")
      .update({ phone: phone.trim() })
      .eq("id", data.user.id);
  }

  return NextResponse.json({ id: data.user?.id }, { status: 201 });
}
