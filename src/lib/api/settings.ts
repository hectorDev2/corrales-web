import { supabase } from "@/lib/supabase";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterSocial {
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface FooterSettings {
  aboutText: string;
  whatsapp: string;
  email: string;
  address: string;
  sections: FooterSection[];
  social: FooterSocial;
}

export interface SiteSettings {
  id: number;
  footer: FooterSettings;
  updated_at: string;
}

// ─── Public ──────────────────────────────────────────────────────────────────

export async function getFooterSettings(): Promise<FooterSettings | null> {
  const { data, error } = await (supabase as any)
    .from("site_settings")
    .select("footer")
    .eq("id", 1)
    .single();

  if (error) return null;
  return (data as { footer: FooterSettings }).footer;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminSettings(): Promise<SiteSettings> {
  const { data, error } = await (supabase as any)
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw error;
  return data as SiteSettings;
}

export async function updateFooterSettings(
  footer: FooterSettings,
): Promise<void> {
  const { error } = await (supabase as any)
    .from("site_settings")
    .update({ footer, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) throw error;
}
