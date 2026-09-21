"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type SubmissionState = "idle" | "submitting" | "success" | "error";

async function getResponseError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "message" in body) {
      const message = body.message;
      if (typeof message === "string" && message.trim()) return message;
    }
  } catch {
    // The API may return an empty or non-JSON error response.
  }

  return "No pudimos enviar la solicitud. Intentá de nuevo.";
}

export function CorporateSalesPage() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionState === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      formType: "corporate-sales",
      name: formData.get("name"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
      additionalInformation: formData.get("additionalInformation"),
      privacyPolicy: formData.get("privacyPolicy") === "true",
    };

    setSubmissionState("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/public/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await getResponseError(response));

      form.reset();
      setSubmissionState("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "No pudimos enviar la solicitud. Intentá de nuevo.",
      );
      setSubmissionState("error");
    }
  }

  const isSubmitting = submissionState === "submitting";

  return (
    <div className="bg-surface-container-low px-4 py-10 md:px-8 md:py-16">
      <div className="shadow-card mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white md:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-primary text-on-primary flex flex-col justify-between gap-10 p-8 md:p-12">
          <div>
            <p className="mb-4 text-xs font-bold tracking-[0.25em] text-white/70 uppercase">
              Corrales para empresas
            </p>
            <h1 className="text-4xl leading-tight font-black tracking-tight md:text-5xl">
              Celebrá en grande con nosotros
            </h1>
            <p className="mt-6 leading-7 text-white/85">
              Organizá tus reuniones, celebraciones y eventos corporativos con el sabor de la
              familia Corrales.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              groups
            </span>
            Atención personalizada para cada evento
          </div>
        </div>

        <form className="space-y-6 p-6 md:p-12" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-on-surface text-2xl font-black tracking-tight">
              Contactá a nuestro equipo de Ventas Corporativas
            </h2>
            <p className="text-on-surface-variant mt-2 text-sm">
              Dejanos tus datos y un asesor se pondrá en contacto con vos.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-on-surface space-y-2 text-sm font-bold">
              Nombres
              <input
                name="name"
                type="text"
                required
                className="border-outline-variant focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none focus:ring-2"
              />
            </label>
            <label className="text-on-surface space-y-2 text-sm font-bold">
              Apellidos
              <input
                name="lastName"
                type="text"
                required
                className="border-outline-variant focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none focus:ring-2"
              />
            </label>
          </div>

          <label className="text-on-surface block space-y-2 text-sm font-bold">
            Correo electrónico
            <input
              name="email"
              type="email"
              required
              className="border-outline-variant focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none focus:ring-2"
            />
          </label>

          <label className="text-on-surface block space-y-2 text-sm font-bold">
            Número de celular
            <input
              name="phoneNumber"
              type="tel"
              inputMode="tel"
              maxLength={9}
              pattern="[0-9]{9}"
              required
              className="border-outline-variant focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none focus:ring-2"
            />
          </label>

          <label className="text-on-surface block space-y-2 text-sm font-bold">
            Comentarios
            <textarea
              name="additionalInformation"
              rows={4}
              className="border-outline-variant focus:border-primary focus:ring-primary/20 w-full resize-y rounded-xl border bg-white px-4 py-3 font-normal outline-none focus:ring-2"
              placeholder="Contanos sobre tu evento"
            />
          </label>

          <label className="text-on-surface-variant flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              name="privacyPolicy"
              value="true"
              required
              className="accent-primary mt-1 h-4 w-4"
            />
            <span>
              Acepto la{" "}
              <Link
                href="/institucional/paginas-informativas/politicas-privacidad"
                className="text-primary font-bold hover:underline"
              >
                Política de Privacidad
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-on-primary hover:bg-primary/90 w-full rounded-xl py-4 text-sm font-black tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Solicitar información"}
          </button>

          {errorMessage && (
            <p role="alert" className="bg-error/10 text-error rounded-xl p-4 text-sm font-semibold">
              {errorMessage}
            </p>
          )}
          {submissionState === "success" && (
            <p
              role="status"
              className="bg-success/10 rounded-xl p-4 text-sm font-semibold text-green-800"
            >
              Gracias. Recibimos tu solicitud y pronto nos pondremos en contacto.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
