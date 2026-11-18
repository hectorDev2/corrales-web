import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const authorization = await requireAdmin();
  if (authorization.response) return authorization.response;

  const { full_name, email, password, phone, role: requestedRole } = await req.json();
  const role: "delivery" | "cocina" = requestedRole === "cocina" ? "cocina" : "delivery";

  if (!full_name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Nombre, email y contraseña son obligatorios." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name.trim() },
  });

  if (error) {
    const msg = error.message.includes("already registered")
      ? "Ya existe un usuario con ese email."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // El trigger crea el perfil como "delivery"; aquí se asigna el perfil elegido y el teléfono.
  if (data.user) {
    const { error: profileError } = await admin
      .from("profiles")
      .update({ role, ...(phone?.trim() ? { phone: phone.trim() } : {}) })
      .eq("id", data.user.id);
    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: "No se pudo asignar el perfil. ¿Ya ejecutaste la migración de cocina?" }, { status: 500 });
    }
  }

  return NextResponse.json({ id: data.user?.id }, { status: 201 });
}
