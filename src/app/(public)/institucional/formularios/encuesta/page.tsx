import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

import { SurveyForm } from "./SurveyForm";

export const metadata: Metadata = {
  title: "Encuesta — Corrales",
  description: "Comparte tu experiencia y ayúdanos a mejorar en Corrales.",
};

export default function Page() {
  return (
    <InstitutionalPage title="Encuesta" currentPath="/institucional/formularios/encuesta">
      <p>Tu opinión nos ayuda a seguir mejorando. Cuéntanos cómo fue tu experiencia en Corrales.</p>
      <SurveyForm />
    </InstitutionalPage>
  );
}
