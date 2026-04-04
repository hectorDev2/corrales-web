import type { Metadata } from "next";

import { ReservaForm } from "@/components/reservas";

export const metadata: Metadata = {
  title: "Reservas — Pollería & Fastfood Corrales",
  description: "Reservá tu mesa y viví la experiencia Corrales.",
};

export default function Page() {
  return <ReservaForm />;
}
