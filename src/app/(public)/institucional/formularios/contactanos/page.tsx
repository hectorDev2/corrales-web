import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

export const metadata: Metadata = {
  title: "Contáctanos — Corrales",
  description: "Ponete en contacto con el equipo de Pollería & Fastfood Corrales.",
};

export default function Page() {
  return (
    <InstitutionalPage title="Contáctanos" currentPath="/institucional/formularios/contactanos">
      <p>Estamos para ayudarte. Escribinos o llamanos y nuestro equipo te atenderá con gusto.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <a
          href="tel:5050505"
          className="bg-surface-container-low text-on-surface hover:bg-primary/10 hover:text-primary rounded-2xl p-5 font-bold transition-colors"
        >
          <span
            className="material-symbols-outlined text-primary mb-3 block text-3xl"
            aria-hidden="true"
          >
            call
          </span>
          Llamanos
          <span className="text-on-surface-variant mt-1 block text-sm font-normal">505-0505</span>
        </a>
        <a
          href="mailto:corrales@contacto.pe"
          className="bg-surface-container-low text-on-surface hover:bg-primary/10 hover:text-primary rounded-2xl p-5 font-bold transition-colors"
        >
          <span
            className="material-symbols-outlined text-primary mb-3 block text-3xl"
            aria-hidden="true"
          >
            mail
          </span>
          Escribinos
          <span className="text-on-surface-variant mt-1 block text-sm font-normal">
            corrales@contacto.pe
          </span>
        </a>
        <a
          href="https://wa.me/51999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-surface-container-low text-on-surface hover:bg-primary/10 hover:text-primary rounded-2xl p-5 font-bold transition-colors"
        >
          <span
            className="material-symbols-outlined text-primary mb-3 block text-3xl"
            aria-hidden="true"
          >
            chat
          </span>
          WhatsApp
          <span className="text-on-surface-variant mt-1 block text-sm font-normal">
            Atención al cliente
          </span>
        </a>
      </div>
    </InstitutionalPage>
  );
}
