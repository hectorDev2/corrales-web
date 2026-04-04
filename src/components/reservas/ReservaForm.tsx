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
    <div className="max-w-xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-on-surface mb-2">
          Hacer una Reserva
        </h1>
        <p className="text-on-surface-variant leading-relaxed">
          Reservá tu mesa y viví la experiencia Corrales. Te confirmamos por WhatsApp.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-6">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Nombre Completo
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Ej. Juan Pérez"
              className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
            />
            {errors.name && (
              <p className="text-xs text-error ml-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Teléfono / WhatsApp
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="999 999 999"
              className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
            />
            {errors.phone && (
              <p className="text-xs text-error ml-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                Fecha
              </label>
              <input
                {...register("date")}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
              />
              {errors.date && (
                <p className="text-xs text-error ml-1">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                Hora
              </label>
              <select
                {...register("time")}
                className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
              >
                <option value="">Elegí</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="text-xs text-error ml-1">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              N° de Personas
            </label>
            <input
              {...register("guests", { valueAsNumber: true })}
              type="number"
              min={1}
              max={20}
              className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
            />
            {errors.guests && (
              <p className="text-xs text-error ml-1">{errors.guests.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Notas adicionales
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Ej. Cumpleaños, silla para bebé, alergias..."
              className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline resize-none text-on-surface"
            />
            {errors.notes && (
              <p className="text-xs text-error ml-1">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              Tu Ubicación <span className="text-outline font-normal normal-case tracking-normal">(opcional)</span>
            </p>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Compartí tu ubicación para que podamos orientarte o coordinar el acceso.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLocation}
            disabled={locLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span
              className={`material-symbols-outlined text-primary transition-all ${locLoading ? "animate-spin" : ""}`}
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {locLoading ? "progress_activity" : location ? "my_location" : "location_on"}
            </span>
            <span className="font-bold text-sm text-on-surface">
              {locLoading
                ? "Obteniendo ubicación..."
                : location
                  ? "Ubicación capturada"
                  : "Usar mi ubicación actual"}
            </span>
          </button>

          {location && (
            <a
              href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] text-primary font-bold hover:underline"
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
          className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary font-black py-5 rounded-2xl shadow-[0_8px_30px_rgba(158,32,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-lg tracking-tight disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isSubmitting ? "Enviando..." : "Confirmar Reserva por WhatsApp"}
        </button>

        <p className="text-center text-[10px] text-outline flex items-center justify-center gap-1 uppercase font-bold tracking-widest">
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
