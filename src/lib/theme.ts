import { z } from "zod";

export const THEME_MODES = ["none", "halloween", "navidad"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];
export type SeasonalMode = Exclude<ThemeMode, "none">;

export const THEME_INTENSITIES = ["suave", "normal", "intenso"] as const;
export type ThemeIntensity = (typeof THEME_INTENSITIES)[number];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const themeSettingsSchema = z
  .object({
    mode: z.enum(THEME_MODES),
    intensity: z.enum(THEME_INTENSITIES),
    /** Si hay fechas, el tema solo se muestra dentro de [from, to] (inclusive). */
    from: isoDate.nullable(),
    to: isoDate.nullable(),
  })
  .refine((v) => !v.from || !v.to || v.from <= v.to, { message: "La fecha final es anterior a la inicial." });

export type ThemeSettings = z.infer<typeof themeSettingsSchema>;

export const DEFAULT_THEME: ThemeSettings = { mode: "none", intensity: "normal", from: null, to: null };

export const THEME_LABEL: Record<ThemeMode, string> = {
  none: "Normal",
  halloween: "Halloween",
  navidad: "Navidad",
};

export function resolveThemeSettings(value: unknown): ThemeSettings {
  const parsed = themeSettingsSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_THEME;
}

/** Fecha de hoy (YYYY-MM-DD) en hora de Lima, sin depender de la zona del navegador. */
export function limaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(now);
}

/** Tema que debe verse hoy, considerando la programación por fechas. */
export function getActiveMode(settings: ThemeSettings, today: string = limaToday()): ThemeMode {
  if (settings.mode === "none") return "none";
  if (settings.from && settings.to && (today < settings.from || today > settings.to)) return "none";
  return settings.mode;
}

export type ThemeStatus =
  | { kind: "off" }
  | { kind: "active"; mode: SeasonalMode; until: string | null }
  | { kind: "scheduled"; mode: SeasonalMode; from: string }
  | { kind: "expired"; mode: SeasonalMode; to: string };

export function getThemeStatus(settings: ThemeSettings, today: string = limaToday()): ThemeStatus {
  if (settings.mode === "none") return { kind: "off" };
  const mode = settings.mode;
  if (settings.from && settings.to) {
    if (today < settings.from) return { kind: "scheduled", mode, from: settings.from };
    if (today > settings.to) return { kind: "expired", mode, to: settings.to };
    return { kind: "active", mode, until: settings.to };
  }
  return { kind: "active", mode, until: null };
}

/** Fechas habituales de cada temporada, para sugerirlas al programar. */
export function suggestedRange(mode: SeasonalMode, today: string = limaToday()): { from: string; to: string } {
  const year = Number(today.slice(0, 4));
  if (mode === "halloween") {
    const y = today > `${year}-11-02` ? year + 1 : year;
    return { from: `${y}-10-20`, to: `${y}-11-02` };
  }
  const y = today > `${year}-12-31` ? year + 1 : year;
  return { from: `${y}-12-01`, to: `${y}-12-31` };
}
