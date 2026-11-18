import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

// Enlace del libro de reclamaciones propio de Corrales (se configura en el entorno).
const COMPLAINTS_BOOK_URL = process.env.NEXT_PUBLIC_COMPLAINTS_BOOK_URL;

export const metadata: Metadata = {
  title: "Libro de Reclamaciones — Corrales",
  description: "Accede al Libro de Reclamaciones Virtual de Corrales.",
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
          {COMPLAINTS_BOOK_URL ? "El formulario se abrirá en una nueva pestaña para que puedas completar tu solicitud." : "Cuéntanos tu queja o reclamo y nuestro equipo te responderá."}
        </p>
        {COMPLAINTS_BOOK_URL ? (
          <a
            href={COMPLAINTS_BOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-on-primary hover:bg-primary/90 inline-flex rounded-xl px-6 py-3 font-black transition-colors"
          >
            Ir al Libro de Reclamaciones
          </a>
        ) : (
          <a
            href="/institucional/formularios/contactanos"
            className="bg-primary text-on-primary hover:bg-primary/90 inline-flex rounded-xl px-6 py-3 font-black transition-colors"
          >
            Escríbenos tu reclamo
          </a>
        )}
      </div>
    </InstitutionalPage>
  );
}
