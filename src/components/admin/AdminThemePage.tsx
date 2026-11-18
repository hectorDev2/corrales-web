"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SeasonalEffects } from "@/components/theme";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { updateThemeSettings } from "@/lib/api/theme";
import { addDaysISO, formatShort, todayISO } from "@/lib/dates";
import {
  type SeasonalMode,
  THEME_INTENSITIES,
  THEME_LABEL,
  type ThemeIntensity,
  type ThemeMode,
  type ThemeSettings,
  getThemeStatus,
  suggestedRange,
} from "@/lib/theme";

const ICON = (filled = false) => ({
  fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
});

const MODES: { id: ThemeMode; emoji: string; blurb: string }[] = [
  { id: "none", emoji: "🍗", blurb: "El sitio se ve como siempre." },
  { id: "halloween", emoji: "🎃", blurb: "Arañas colgando, fantasmas, murciélagos y calabazas." },
  { id: "navidad", emoji: "🎄", blurb: "Nieve, luces, adornos, árbol y regalos." },
];

const INTENSITY_LABEL: Record<ThemeIntensity, string> = { suave: "Suave", normal: "Normal", intenso: "Intenso" };

function Preview({ mode, intensity }: { mode: ThemeMode; intensity: ThemeIntensity }) {
  return (
    <div
      className={`relative h-40 overflow-hidden rounded-2xl border border-black/5 ${
        mode === "halloween" ? "bg-gradient-to-b from-violet-50 to-orange-50" : mode === "navidad" ? "bg-gradient-to-b from-sky-50 to-white" : "bg-surface-container-low"
      }`}
    >
      <div className="bg-primary h-6 w-full" />
      <div className="space-y-2 p-3">
        <div className="bg-black/10 h-2.5 w-2/3 rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white/80 shadow-sm" />
          ))}
        </div>
      </div>
      {mode !== "none" && <SeasonalEffects mode={mode as SeasonalMode} intensity={intensity} contained />}
    </div>
  );
}

function statusText(settings: ThemeSettings): { tone: "on" | "wait" | "off"; text: string } {
  const st = getThemeStatus(settings);
  switch (st.kind) {
    case "off":
      return { tone: "off", text: "Sin tema: el sitio se ve normal." };
    case "active":
      return {
        tone: "on",
        text: st.until
          ? `${THEME_LABEL[st.mode]} activo ahora, hasta el ${formatShort(st.until, true)}.`
          : `${THEME_LABEL[st.mode]} activo ahora, sin fecha de fin.`,
      };
    case "scheduled":
      return { tone: "wait", text: `${THEME_LABEL[st.mode]} programado: empieza el ${formatShort(st.from, true)}.` };
    case "expired":
      return { tone: "off", text: `${THEME_LABEL[st.mode]} terminó el ${formatShort(st.to, true)}. Elige nuevas fechas o desactívalo.` };
  }
}

export function AdminThemePage({ initial }: { initial: ThemeSettings }) {
  const [saved, setSaved] = useState(initial);
  const [mode, setMode] = useState<ThemeMode>(initial.mode);
  const [intensity, setIntensity] = useState<ThemeIntensity>(initial.intensity);
  const [scheduled, setScheduled] = useState(Boolean(initial.from && initial.to));
  const [range, setRange] = useState(() =>
    initial.from && initial.to
      ? { from: initial.from, to: initial.to }
      : suggestedRange(initial.mode === "none" ? "halloween" : initial.mode),
  );
  const [saving, setSaving] = useState(false);

  const draft: ThemeSettings = useMemo(
    () => ({
      mode,
      intensity,
      from: mode !== "none" && scheduled ? range.from : null,
      to: mode !== "none" && scheduled ? range.to : null,
    }),
    [mode, intensity, scheduled, range],
  );
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const status = statusText(draft);

  function chooseMode(next: ThemeMode) {
    setMode(next);
    // Si ya hay programación, sugiere las fechas habituales de la nueva temporada.
    if (next !== "none" && scheduled) setRange(suggestedRange(next));
  }

  async function save() {
    setSaving(true);
    try {
      await updateThemeSettings(draft);
      setSaved(draft);
      toast.success(
        draft.mode === "none" ? "Tema desactivado." : `${THEME_LABEL[draft.mode]} guardado. Ya se ve en el sitio.`,
      );
    } catch {
      toast.error("No se pudo guardar el tema. ¿Ya aplicaste la migración de Supabase?");
    } finally {
      setSaving(false);
    }
  }

  const toneClass = {
    on: "bg-green-50 text-green-800 ring-green-200",
    wait: "bg-amber-50 text-amber-800 ring-amber-200",
    off: "bg-surface-container-high text-on-surface-variant ring-transparent",
  }[status.tone];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-8">
      <div>
        <h2 className="text-on-surface text-lg font-black tracking-tight">Temporada</h2>
        <p className="text-on-surface-variant text-sm">
          Cambia el ambiente del sitio para fechas especiales. Se aplica a todos los visitantes.
        </p>
      </div>

      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${toneClass}`} role="status">
        <span className="material-symbols-outlined text-xl" style={ICON(true)}>
          {status.tone === "on" ? "celebration" : status.tone === "wait" ? "schedule" : "do_not_disturb_on"}
        </span>
        {status.text}
      </div>

      {/* Elegir tema */}
      <div role="radiogroup" aria-label="Tema del sitio" className="grid gap-4 md:grid-cols-3">
        {MODES.map((m) => {
          const selected = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => chooseMode(m.id)}
              className={`space-y-3 rounded-3xl border-2 p-3 text-left transition-all ${
                selected ? "border-primary bg-primary/5 shadow-primary/10 shadow-lg" : "bg-surface-container-lowest hover:border-outline-variant border-transparent shadow-sm"
              }`}
            >
              <Preview mode={m.id} intensity="suave" />
              <div className="flex items-start gap-3 px-1 pb-1">
                <span className="text-2xl" aria-hidden="true">
                  {m.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-on-surface text-sm font-black">{THEME_LABEL[m.id]}</p>
                  <p className="text-on-surface-variant text-xs">{m.blurb}</p>
                </div>
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? "border-primary bg-primary text-on-primary" : "border-outline-variant"
                  }`}
                  aria-hidden="true"
                >
                  {selected && <span className="material-symbols-outlined text-sm" style={ICON(true)}>check</span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {mode !== "none" && (
        <div className="bg-surface-container-lowest space-y-6 rounded-3xl p-5 shadow-sm">
          {/* Intensidad */}
          <div className="space-y-2">
            <p className="text-on-surface-variant text-xs font-black tracking-widest uppercase">Cantidad de efectos</p>
            <div role="radiogroup" aria-label="Intensidad" className="bg-surface-container-high inline-flex rounded-2xl p-1">
              {THEME_INTENSITIES.map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={intensity === i}
                  onClick={() => setIntensity(i)}
                  className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                    intensity === i ? "bg-primary text-on-primary shadow" : "text-on-surface-variant"
                  }`}
                >
                  {INTENSITY_LABEL[i]}
                </button>
              ))}
            </div>
            <p className="text-on-surface-variant text-xs">
              En celulares se muestran menos elementos para que el sitio siga fluido. Quien tenga activada la opción
              «reducir movimiento» ve las decoraciones quietas.
            </p>
          </div>

          {/* Programación */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-on-surface text-sm font-black">Programar por fechas</p>
                <p className="text-on-surface-variant text-xs">Se activa y se apaga solo en el rango elegido.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={scheduled}
                aria-label="Programar por fechas"
                onClick={() => {
                  if (!scheduled) setRange((r) => (r.to < todayISO() ? suggestedRange(mode) : r));
                  setScheduled((v) => !v);
                }}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${scheduled ? "bg-primary" : "bg-outline-variant"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform ${
                    scheduled ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            {scheduled && (
              <DateRangePicker
                label="Vigencia"
                value={range}
                onChange={setRange}
                showPresets={false}
                min={todayISO()}
                max={addDaysISO(todayISO(), 730)}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => void save()}
          className="bg-primary text-on-primary shadow-primary/25 rounded-2xl px-8 py-3.5 text-xs font-bold tracking-wider uppercase shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          {saving ? "Guardando..." : dirty ? "Guardar cambios" : "Guardado"}
        </button>
        <Link
          href="/"
          target="_blank"
          className="text-on-surface-variant hover:text-primary flex items-center gap-1.5 text-xs font-bold transition-colors"
        >
          <span className="material-symbols-outlined text-base" style={ICON()}>
            open_in_new
          </span>
          Ver el sitio
        </Link>
      </div>
    </div>
  );
}
