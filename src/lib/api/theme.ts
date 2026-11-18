import { supabase } from "@/lib/supabase";
import { DEFAULT_THEME, type ThemeSettings, resolveThemeSettings, themeSettingsSchema } from "@/lib/theme";

// `theme` aún no está en los tipos generados de Supabase.
interface ThemeTable {
  select(columns: string): {
    eq(column: "id", value: number): { single(): Promise<{ data: unknown; error: unknown }> };
  };
  update(values: { theme: ThemeSettings; updated_at: string }): {
    eq(column: "id", value: number): Promise<{ error: unknown }>;
  };
}

const table = () => (supabase as unknown as { from(name: "site_settings"): ThemeTable }).from("site_settings");

/** Lectura pública: si falla, el sitio se ve normal. */
export async function getThemeSettings(): Promise<ThemeSettings> {
  const { data, error } = await table().select("theme").eq("id", 1).single();
  if (error) return DEFAULT_THEME;
  return resolveThemeSettings((data as { theme?: unknown } | null)?.theme);
}

export async function updateThemeSettings(theme: ThemeSettings): Promise<void> {
  const valid = themeSettingsSchema.parse(theme);
  const { error } = await table()
    .update({ theme: valid, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}
