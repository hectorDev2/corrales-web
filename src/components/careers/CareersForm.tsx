"use client";

import { FormEvent, ChangeEvent, useState } from "react";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

type SubmissionState = "idle" | "submitting" | "success" | "error";

function validateResume(file: File | null): string | null {
  if (!file || file.size === 0) return "Adjuntá tu CV en formato PDF.";

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "El CV debe estar en formato PDF.";
  if (file.size > MAX_RESUME_SIZE) return "El CV no puede superar los 5MB.";

  return null;
}

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

  return "No pudimos enviar tu postulación. Intentá de nuevo.";
}

export function CareersForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setFileName(file?.name ?? "");
    setErrorMessage(validateResume(file));
    setSubmissionState(file && validateResume(file) ? "error" : "idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionState === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const resumeInput = form.elements.namedItem("resume") as HTMLInputElement | null;
    const resume = resumeInput?.files?.[0] ?? null;
    const resumeError = validateResume(resume);

    if (resumeError) {
      setErrorMessage(resumeError);
      setSubmissionState("error");
      return;
    }

    formData.append("formType", "careers");
    setErrorMessage(null);
    setSubmissionState("submitting");

    try {
      const response = await fetch("/api/public/forms", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(await getResponseError(response));

      form.reset();
      setFileName("");
      setErrorMessage(null);
      setSubmissionState("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "No pudimos enviar tu postulación. Intentá de nuevo.",
      );
      setSubmissionState("error");
    }
  }

  const isSubmitting = submissionState === "submitting";

  return (
    <div className="shadow-card group relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white p-8 md:p-12">
      <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <form className="relative flex flex-col gap-8" onSubmit={handleSubmit} noValidate={false}>
        <div className="space-y-2">
          <h2 className="text-on-surface flex items-center gap-2 text-2xl font-bold">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              upload_file
            </span>
            Sube tu CV
          </h2>
          <p className="text-on-surface-variant text-sm">
            Aceptamos documentos en formato PDF (máximo 5MB).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="text-on-surface text-sm font-bold">
              Nombre completo
            </label>
            <input
              type="text"
              id="firstName"
              name="name"
              placeholder="Ej. Juan Pérez"
              required
              className="bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-primary/20 placeholder:text-outline w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-on-surface text-sm font-bold">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="juan@ejemplo.com"
              required
              className="bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-primary/20 placeholder:text-outline w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="phone" className="text-on-surface text-sm font-bold">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Ej. +51 987 654 321"
              className="bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-primary/20 placeholder:text-outline w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
            />
          </div>
        </div>

        <div className="relative">
          <input
            type="file"
            id="resume"
            name="resume"
            accept="application/pdf,.pdf"
            required
            aria-label="CV en PDF"
            onChange={handleFileChange}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="border-primary/30 bg-primary/5 hover:bg-primary/10 group-hover:border-primary/50 flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-300">
            <div className="text-primary mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
              >
                cloud_upload
              </span>
            </div>
            <div>
              <p className="text-on-surface text-base font-bold">
                {fileName || "Haz clic para subir o arrastra tu PDF aquí"}
              </p>
              <p className="text-on-surface-variant mt-1 text-sm">
                Solo archivos PDF hasta 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 px-1">
          <div className="mt-0.5 flex h-5 items-center">
            <input
              id="terms"
              name="privacyPolicy"
              value="true"
              type="checkbox"
              className="border-outline-variant/30 text-primary focus:ring-primary/20 accent-primary h-5 w-5 cursor-pointer rounded"
              required
            />
          </div>
          <label
            htmlFor="terms"
            className="text-on-surface-variant cursor-pointer text-sm leading-relaxed select-none"
          >
            He leído y acepto la{" "}
            <a
              href="/institucional/paginas-informativas/politicas-privacidad"
              className="text-primary font-semibold hover:underline"
            >
              Política de Privacidad
            </a>{" "}
            y los{" "}
            <a
              href="/institucional/paginas-informativas/terminos-condiciones-web"
              className="text-primary font-semibold hover:underline"
            >
              Términos y Condiciones
            </a>
            , y consiento el uso de mis datos personales con fines de reclutamiento y selección.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-on-primary shadow-primary/25 hover:shadow-primary/40 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {isSubmitting ? "progress_activity" : "send"}
          </span>
          {isSubmitting ? "Enviando..." : "Enviar postulación"}
        </button>

        {errorMessage && (
          <p role="alert" className="bg-error/10 text-error rounded-xl p-4 text-sm font-semibold">
            {errorMessage}
          </p>
        )}
        {submissionState === "success" && (
          <p role="status" className="bg-success/10 rounded-xl p-4 text-sm font-semibold text-green-800">
            ¡Postulación enviada! Revisaremos tu CV y nos pondremos en contacto.
          </p>
        )}
      </form>
    </div>
  );
}
