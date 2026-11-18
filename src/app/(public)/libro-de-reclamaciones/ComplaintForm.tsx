"use client";

import { type FormEvent, useState } from "react";

type SubmissionState = "idle" | "submitting" | "success" | "error";

const field =
  "border-outline-variant focus:border-primary w-full rounded-xl border bg-white px-4 py-3 font-normal outline-none";
const label = "text-on-surface block space-y-1.5 text-sm font-bold";

export function ComplaintForm() {
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    try {
      const response = await fetch("/api/public/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "complaint",
          fullName: get("fullName"),
          documentType: get("documentType"),
          documentNumber: get("documentNumber"),
          phone: get("phone"),
          email: get("email"),
          address: get("address"),
          itemType: get("itemType"),
          itemDescription: get("itemDescription"),
          amount: get("amount"),
          kind: get("kind"),
          detail: get("detail"),
          consumerRequest: get("consumerRequest"),
          privacyPolicy: data.get("privacyPolicy") ? "true" : "false",
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setMessage(body?.message ?? "");
        throw new Error("Complaint request failed");
      }
      form.reset();
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div role="status" className="rounded-2xl bg-green-50 p-6 text-green-900">
        <p className="text-lg font-black">¡Recibimos tu reclamación!</p>
        <p className="mt-1 text-sm">
          Te responderemos al correo y teléfono que nos indicaste en un plazo máximo de 15 días calendario.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 rounded-xl bg-green-800 px-5 py-2.5 text-sm font-bold text-white"
        >
          Registrar otra
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <fieldset className="space-y-4">
        <legend className="text-on-surface mb-2 text-lg font-black">1. Tus datos</legend>
        <label className={label}>
          Nombre completo
          <input name="fullName" required minLength={3} maxLength={150} autoComplete="name" className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <label className={label}>
            Documento
            <select name="documentType" required defaultValue="DNI" className={field}>
              <option>DNI</option>
              <option>CE</option>
              <option>Pasaporte</option>
              <option>RUC</option>
            </select>
          </label>
          <label className={label}>
            Número de documento
            <input name="documentNumber" required minLength={6} maxLength={20} className={field} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Teléfono
            <input name="phone" type="tel" required minLength={7} maxLength={20} autoComplete="tel" className={field} />
          </label>
          <label className={label}>
            Correo electrónico
            <input name="email" type="email" required autoComplete="email" className={field} />
          </label>
        </div>
        <label className={label}>
          Dirección
          <input name="address" required minLength={5} maxLength={200} autoComplete="street-address" className={field} />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-on-surface mb-2 text-lg font-black">2. Qué compraste</legend>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr_9rem]">
          <label className={label}>
            Tipo
            <select name="itemType" required defaultValue="producto" className={field}>
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
          </label>
          <label className={label}>
            Descripción
            <input
              name="itemDescription"
              required
              minLength={3}
              maxLength={300}
              placeholder="Ej: 1/4 de pollo a la brasa"
              className={field}
            />
          </label>
          <label className={label}>
            Monto (S/)
            <input name="amount" type="number" min="0" step="0.01" placeholder="Opcional" className={field} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-on-surface mb-2 text-lg font-black">3. Tu reclamo o queja</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["reclamo", "Reclamo", "Disconformidad con el producto o servicio."],
            ["queja", "Queja", "Malestar por la atención, sin relación con el producto."],
          ].map(([value, title, text]) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="kind" value={value} required defaultChecked={value === "reclamo"} className="peer sr-only" />
              <span className="border-outline-variant peer-checked:border-primary peer-checked:bg-primary/5 block rounded-xl border-2 p-3">
                <span className="block text-sm font-black">{title}</span>
                <span className="text-on-surface-variant block text-xs">{text}</span>
              </span>
            </label>
          ))}
        </div>
        <label className={label}>
          Detalle: cuéntanos qué pasó
          <textarea name="detail" required minLength={10} maxLength={2000} rows={5} className={field} />
        </label>
        <label className={label}>
          ¿Qué solución esperas?
          <textarea name="consumerRequest" required minLength={5} maxLength={1000} rows={3} className={field} />
        </label>
      </fieldset>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="privacyPolicy" required className="mt-1 size-5 accent-[#e4002b]" />
        <span>Acepto que Corrales use mis datos para atender este reclamo, según su política de privacidad.</span>
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        aria-busy={state === "submitting"}
        className="bg-primary text-on-primary hover:bg-primary/90 min-h-12 rounded-xl px-8 py-3 font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? "Enviando…" : "Enviar reclamación"}
      </button>
      {state === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">
          {message || "No pudimos enviar tu reclamación. Intenta nuevamente."}
        </p>
      )}
    </form>
  );
}
