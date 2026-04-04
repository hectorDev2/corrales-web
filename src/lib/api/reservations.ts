import { supabase } from "@/lib/supabase";

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
