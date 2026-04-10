import { supabase } from "@/lib/supabase";

export type ReservationStatus = "pendiente" | "confirmada" | "cancelada";

export interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  status: ReservationStatus;
  created_at: string;
}

export async function getReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) throw error;
  return data as Reservation[];
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<void> {
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

interface CreateReservationParams {
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}

export async function createReservation(params: CreateReservationParams): Promise<void> {
  const { error } = await supabase
    .from("reservations")
    .insert({
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      date: params.date,
      time: params.time,
      guests: params.guests,
      notes: params.notes ?? null,
      status: "pendiente",
    });

  if (error) throw error;
}
