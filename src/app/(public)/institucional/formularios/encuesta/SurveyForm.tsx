"use client";

import { useState, type FormEvent } from "react";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function SurveyForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/public/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "survey",
          rating: String(formData.get("rating") ?? ""),
          comments: String(formData.get("comments") ?? "").trim(),
        }),
      });

      if (!response.ok) throw new Error("Survey request failed");

      form.reset();
      setSubmissionState("success");
    } catch {
      setSubmissionState("error");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="text-on-surface block space-y-2 font-bold">
        ¿Cómo calificarías tu experiencia?
        <select
          name="rating"
          required
          className="border-outline-variant focus:border-primary w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            Seleccioná una opción
          </option>
          <option value="Excelente">Excelente</option>
          <option value="Muy buena">Muy buena</option>
          <option value="Buena">Buena</option>
          <option value="Puede mejorar">Puede mejorar</option>
        </select>
      </label>
      <label className="text-on-surface block space-y-2 font-bold">
        Comentarios
        <textarea
          name="comments"
          rows={5}
          className="border-outline-variant focus:border-primary w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none"
          placeholder="Contanos más sobre tu visita"
        />
      </label>
      <button
        type="submit"
        disabled={submissionState === "submitting"}
        aria-busy={submissionState === "submitting"}
        className="bg-primary text-on-primary hover:bg-primary/90 rounded-xl px-6 py-3 font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submissionState === "submitting" ? "Enviando…" : "Enviar encuesta"}
      </button>
      {submissionState === "success" && (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800">
          Gracias por compartir tu experiencia.
        </p>
      )}
      {submissionState === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">
          No pudimos enviar tu encuesta. Intentá nuevamente.
        </p>
      )}
    </form>
  );
}
