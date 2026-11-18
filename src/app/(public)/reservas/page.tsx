import type { Metadata } from "next";

import { ReservaForm } from "@/components/reservas";

export const metadata: Metadata = {
  title: "Reservas — Pollería & Fastfood Corrales",
  description: "Reserva tu mesa y vive la experiencia Corrales.",
};

export default function Page() {
  return <ReservaForm />;
}
