import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones — Corrales",
  description: "Accedé al Libro de Reclamaciones Virtual de Corrales.",
};

export default function Page() {
  return (
    <InstitutionalPage title="Libro de Reclamaciones" currentPath="/libro-de-reclamaciones">
      <p>
        Ponemos a tu disposición nuestro Libro de Reclamaciones Virtual para que puedas registrar
        una queja o reclamo.
      </p>
      <div className="bg-surface-container-low rounded-2xl p-6 md:p-8">
        <span className="material-symbols-outlined text-primary text-4xl" aria-hidden="true">
          rate_review
        </span>
        <h2 className="text-on-surface mt-4 text-2xl font-black">Registrar una reclamación</h2>
        <p className="mt-2 mb-6">
          El formulario se abrirá en una nueva pestaña para que puedas completar tu solicitud.
        </p>
        <a
          href="https://librodereclamaciones.franquiciasperu.com/Reclamo/RegistrarReclamo?idmarca=1"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-on-primary hover:bg-primary/90 inline-flex rounded-xl px-6 py-3 font-black transition-colors"
        >
          Ir al Libro de Reclamaciones
        </a>
      </div>
    </InstitutionalPage>
  );
}
