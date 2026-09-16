import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

export const metadata: Metadata = {
  title: "Encuesta — Corrales",
  description: "Compartí tu experiencia y ayudanos a mejorar en Corrales.",
};

export default function Page() {
  return (
    <InstitutionalPage title="Encuesta" currentPath="/institucional/formularios/encuesta">
      <p>Tu opinión nos ayuda a seguir mejorando. Contanos cómo fue tu experiencia en Corrales.</p>
      <form className="space-y-5" action="/institucional/formularios/encuesta" method="get">
        <label className="text-on-surface block space-y-2 font-bold">
          ¿Cómo calificarías tu experiencia?
          <select
            name="calificacion"
            className="border-outline-variant focus:border-primary w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none"
          >
            <option value="">Seleccioná una opción</option>
            <option>Excelente</option>
            <option>Muy buena</option>
            <option>Buena</option>
            <option>Puede mejorar</option>
          </select>
        </label>
        <label className="text-on-surface block space-y-2 font-bold">
          Comentarios
          <textarea
            name="comentarios"
            rows={5}
            className="border-outline-variant focus:border-primary w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none"
            placeholder="Contanos más sobre tu visita"
          />
        </label>
        <button
          type="submit"
          className="bg-primary text-on-primary hover:bg-primary/90 rounded-xl px-6 py-3 font-black transition-colors"
        >
          Enviar encuesta
        </button>
      </form>
    </InstitutionalPage>
  );
}
