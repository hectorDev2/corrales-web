import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

import { ComplaintForm } from "./ComplaintForm";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones — Corrales",
  description: "Registra una queja o reclamo en el Libro de Reclamaciones Virtual de Corrales.",
};

export default function Page() {
  return (
    <InstitutionalPage title="Libro de Reclamaciones" currentPath="/libro-de-reclamaciones">
      <p>
        Pollería &amp; Fastfood Corrales pone a tu disposición su Libro de Reclamaciones Virtual. Completa el
        formulario y atenderemos tu solicitud en un plazo máximo de 15 días calendario.
      </p>
      <ComplaintForm />
    </InstitutionalPage>
  );
}
