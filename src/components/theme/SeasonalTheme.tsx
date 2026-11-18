"use client";

import { useEffect, useState } from "react";

import { getThemeSettings } from "@/lib/api/theme";
import { type ThemeSettings, getActiveMode } from "@/lib/theme";

import { SeasonalEffects } from "./SeasonalEffects";

/** Lee el tema del sitio y pinta la temporada activa, si la hay. No bloquea la página. */
export function SeasonalTheme() {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    getThemeSettings()
      .then((s) => !cancelled && setSettings(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!settings) return null;
  const mode = getActiveMode(settings);
  if (mode === "none") return null;

  return <SeasonalEffects mode={mode} intensity={settings.intensity} />;
}
