import { supabase } from "@/lib/supabase";

export type StaffRole = "delivery" | "cocina";

export interface DeliveryUser {
  id: string;
  role: StaffRole;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getDeliveryUsers(): Promise<DeliveryUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, is_active, created_at")
    .in("role", ["delivery", "cocina"])
    .order("full_name");

  if (error) throw error;
  return data as DeliveryUser[];
}

export async function createDeliveryUser(input: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: StaffRole;
}): Promise<void> {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "No se pudo crear el usuario.");
  }
}

export async function toggleDeliveryUser(
  id: string,
  is_active: boolean,
): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "No se pudo actualizar el usuario.");
  }
}
