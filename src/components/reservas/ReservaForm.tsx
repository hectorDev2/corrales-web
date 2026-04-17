"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createReservation } from "@/lib/api/reservations";

import { TIME_SLOTS, type ReservaFormData, reservaSchema } from "./reservaSchema";

const WHATSAPP_NUMBER = "51999999999"; // TODO: reemplazar con el número real

function buildWhatsAppMessage(data: ReservaFormData, mapsUrl?: string): string {
  const lines = [
    "🍗 *Nueva Reserva — Pollería Corrales*",
    "",
    `👤 *Nombre:* ${data.name}`,
    `📞 *Teléfono:* ${data.phone}`,
    `📅 *Fecha:* ${data.date}`,
    `⏰ *Hora:* ${data.time}`,
    `👥 *Personas:* ${data.guests}`,
  ];
  if (data.notes) lines.push(`📝 *Notas:* ${data.notes}`);
  if (mapsUrl) lines.push(`📍 *Ubicación del cliente:* ${mapsUrl}`);
  return lines.join("\n");
}

export function ReservaForm() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: { guests: 2 },
  });

  function handleLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        toast.success("Ubicación capturada correctamente.");
      },
      () => {
        setLocLoading(false);
        toast.error("No se pudo obtener la ubicación. Verificá los permisos.");
      },
      { timeout: 8000 },
    );
  }

  async function onSubmit(data: ReservaFormData) {
    try {
      await createReservation({
        customerName: data.name,
        customerPhone: data.phone,
        date: data.date,
        time: data.time,
        guests: data.guests,
        notes: data.notes,
      });

      const mapsUrl = location
        ? `https://maps.google.com/?q=${location.lat},${location.lng}`
        : undefined;

      const message = buildWhatsAppMessage(data, mapsUrl);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      toast.success("¡Reserva enviada! Te confirmamos por WhatsApp.");
    } catch {
      toast.error("No pudimos registrar tu reserva. Intentá de nuevo.");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-on-surface mb-2 text-3xl font-black tracking-tighter">
          Hacer una Reserva
        </h1>
        <p className="text-on-surface-variant leading-relaxed">
          Reservá tu mesa y viví la experiencia Corrales. Te confirmamos por WhatsApp.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-surface-container-low space-y-6 rounded-3xl p-6">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
              Nombre Completo
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Ej. Juan Pérez"
              className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
            />
            {errors.name && <p className="text-error ml-1 text-xs">{errors.name.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
              Teléfono / WhatsApp
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="999 999 999"
              className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
            />
            {errors.phone && <p className="text-error ml-1 text-xs">{errors.phone.message}</p>}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
                Fecha
              </label>
              <input
                {...register("date")}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="bg-surface-container-high focus:ring-primary/20 text-on-surface w-full rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
              />
              {errors.date && <p className="text-error ml-1 text-xs">{errors.date.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
                Hora
              </label>
              <select
                {...register("time")}
                className="bg-surface-container-high focus:ring-primary/20 text-on-surface w-full rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
              >
                <option value="">Elegí</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.time && <p className="text-error ml-1 text-xs">{errors.time.message}</p>}
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
              N° de Personas
            </label>
            <input
              {...register("guests", { valueAsNumber: true })}
              type="number"
              min={1}
              max={20}
              className="bg-surface-container-high focus:ring-primary/20 text-on-surface w-full rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
            />
            {errors.guests && <p className="text-error ml-1 text-xs">{errors.guests.message}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
              Notas adicionales
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Ej. Cumpleaños, silla para bebé, alergias..."
              className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full resize-none rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
            />
            {errors.notes && <p className="text-error ml-1 text-xs">{errors.notes.message}</p>}
          </div>
        </div>

        {/* Location */}
        <div className="bg-surface-container-low space-y-4 rounded-3xl p-6">
          <div>
            <p className="text-on-surface-variant mb-1 text-xs font-bold tracking-widest uppercase">
              Tu Ubicación{" "}
              <span className="text-outline font-normal tracking-normal normal-case">
                (opcional)
              </span>
            </p>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Compartí tu ubicación para que podamos orientarte o coordinar el acceso.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLocation}
            disabled={locLoading}
            className="border-outline-variant bg-surface-container hover:border-primary hover:bg-primary/5 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-4 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={`material-symbols-outlined text-primary transition-all ${locLoading ? "animate-spin" : ""}`}
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {locLoading ? "progress_activity" : location ? "my_location" : "location_on"}
            </span>
            <span className="text-on-surface text-sm font-bold">
              {locLoading
                ? "Obteniendo ubicación..."
                : location
                  ? "Ubicación guardada."
                  : "Usar mi ubicación actual"}
            </span>
          </button>

          {location && (
            <a
              href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-2 text-[11px] font-bold hover:underline"
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                open_in_new
              </span>
              Ver en Google Maps · {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </a>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="from-primary to-primary-container text-on-primary w-full rounded-2xl bg-linear-to-br py-5 text-lg font-black tracking-tight shadow-[0_8px_30px_rgba(158,32,22,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Confirmar Reserva por WhatsApp"}
        </button>

        <p className="text-outline flex items-center justify-center gap-1 text-center text-[10px] font-bold tracking-widest uppercase">
          <span
            className="material-symbols-outlined text-xs"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            verified
          </span>
          Te confirmamos en menos de 24 horas
        </p>
      </form>
    </div>
  );
}
