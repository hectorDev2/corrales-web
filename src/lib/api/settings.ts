import { z } from "zod";

import { supabase } from "@/lib/supabase";

const HOME_SAVINGS_TILE_COUNT = 4;

interface SiteSettingsQuery {
  select(columns: string): SiteSettingsQuery;
  update(values: { footer: FooterSettings; updated_at: string }): SiteSettingsMutation;
  eq(column: "id", value: number): SiteSettingsQuery;
  single(): Promise<{ data: unknown; error: unknown }>;
}

interface SiteSettingsMutation {
  eq(column: "id", value: number): Promise<{ error: unknown }>;
}

const siteSettings = supabase as unknown as {
  from(table: "site_settings"): SiteSettingsQuery;
};

export interface HomeSavingsTile {
  label: string;
  href: string;
  imageSrc: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HomeSavingsSettings {
  title: string;
  allHref: string;
  tiles: HomeSavingsTile[];
}

export const DEFAULT_HOME_SAVINGS_SETTINGS: HomeSavingsSettings = {
  title: "Ahorrar nunca fue tan rico",
  allHref: "/menu",
  tiles: [
    {
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDgI9oXSTO11iRW0fYY_KBnVP50bM2_uG6Cl1AxUXg6cX-904xB1TaCQdk2t7NWQRHqRg56pBPjrlDo7a6Z4o2Rm_r1GPH3Jsq9xTT0Nv1fjVTo0gyipUeLi31qMKFm-itvtzfGDOVPLZw6-C3vNQL6g6J0whiHQIhJfnaSVS0Il7UKZhsNOJdUofZx4DhKBvjwF10KntDDXfWzmkaa3YL7mxyMy7REZIVFWWfjA-g4KwM2vP7uCiFf",
      href: "/menu?categoria=Pollo%20a%20la%20Brasa",
      label: "Para Compartir",
      sortOrder: 0,
      isActive: true,
    },
    {
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDLDDm6Eg2W6ONdjhergHQSAVA0DJpqb4dOTVFsk2RLJ1yJ-kivAMTTsTm_aYWD_GdRm6y6ZPr3htNiE2e1b-rRRsubcRlnLZcyPxb-kv_mv6TUVotCKZQRAxu2QAn-xA3mKNgTAcI51kpWw6lXOMzLbARpdOpxeAYPr4jUlbAubwZeh5YBYzOHpfldlHSFPumETH1GlPxybONDp4ldNl2epAL5O9XXm5mSHXjaTYIfPxUjAN7lsC_E",
      href: "/menu?categoria=Parrillas",
      label: "Para 2",
      sortOrder: 1,
      isActive: true,
    },
    {
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBWZ2r7TUlhi-Me7D91rL-rOQggnL5OvR4yMLym1PsHyis42YCsBfLkcUi88U0dTF10Tew2_QZ5Lt1uKyTofwqYyz160V4w6JybenSdMgQNSWiJTabfTtjMHIXEWcFjTiE73zNhC-aA787f6v1VVLTEwCiWGi44dIq2XXK5uHN-5IwNGguA3kEIekjemebP4bfBiXDIOjoYzJ0Ey9jMfN6DKXNbACi2LPe4OWhfR1kVV0L7Svj1kdhe",
      href: "/menu?categoria=Acompa%C3%B1amiento",
      label: "Para ti",
      sortOrder: 2,
      isActive: true,
    },
    {
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDLjO6zy39hqWKU_BQBDS3UEHdkv7I6zURW5cKoCkLQ8QMeboX8czSdA7m51pIDentfeGBpUr3mItp2CI-U9FGmVnvgYxQ9aqnTpLLag0QCxkKox3pa4_lTOR6QGkfCQCCdk7_ytwWbDJcoOruv6wEyADBhblwWt4VqSPU1spoKwDKqMNVHhXYmRfgyrvIQNdVT76cnAvqrdemAIK64BgDto8Xw0WOa11V9qHz8Koi1XIEEScU3CH0Q",
      href: "/menu?categoria=Bebidas",
      label: "Twister XL",
      sortOrder: 3,
      isActive: true,
    },
  ],
};

function isAllowedHomeSavingsImage(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;

    if (url.hostname === "lh3.googleusercontent.com") {
      return url.pathname.startsWith("/aida-public/");
    }

    if (url.hostname === "images.unsplash.com") return true;

    return (
      /^[^.]+\.supabase\.co$/.test(url.hostname) &&
      url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

const homeHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(2_048)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
    message: "La ruta debe ser interna.",
  });

const homeSavingsTileSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    href: homeHrefSchema,
    imageSrc: z.string().trim().min(1).max(2_048).refine(isAllowedHomeSavingsImage, {
      message: "La imagen debe usar un origen permitido.",
    }),
    sortOrder: z
      .number()
      .int()
      .min(0)
      .max(HOME_SAVINGS_TILE_COUNT - 1),
    isActive: z.boolean(),
  })
  .strict();

export const homeSavingsSettingsSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    allHref: homeHrefSchema,
    tiles: z.array(homeSavingsTileSchema).length(HOME_SAVINGS_TILE_COUNT),
  })
  .strict()
  .superRefine((value, ctx) => {
    const orders = value.tiles.map((tile) => tile.sortOrder).sort((a, b) => a - b);
    if (!orders.every((order, index) => order === index)) {
      ctx.addIssue({
        code: "custom",
        path: ["tiles"],
        message: "Las cuatro posiciones deben ser únicas y consecutivas.",
      });
    }
  });

/** Validates untrusted JSON before it reaches either public rendering or persistence. */
export function parseHomeSavingsSettings(value: unknown): HomeSavingsSettings | null {
  const parsed = homeSavingsSettingsSchema.safeParse(value);
  if (!parsed.success) return null;

  return {
    ...parsed.data,
    tiles: [...parsed.data.tiles].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function resolveHomeSavingsSettings(value: unknown): HomeSavingsSettings {
  return parseHomeSavingsSettings(value) ?? DEFAULT_HOME_SAVINGS_SETTINGS;
}

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
  /**
   * Home configuration is stored under the existing `footer` JSONB setting.
   * Keeping it optional preserves backwards compatibility with the current row.
   */
  homeSavings?: HomeSavingsSettings;
}

export interface SiteSettings {
  id: number;
  footer: FooterSettings;
  updated_at: string;
}

// ─── Public ──────────────────────────────────────────────────────────────────

export async function getFooterSettings(): Promise<FooterSettings | null> {
  const { data, error } = await siteSettings
    .from("site_settings")
    .select("footer")
    .eq("id", 1)
    .single();

  if (error) return null;
  return (data as { footer: FooterSettings }).footer;
}

export async function getHomeSavingsSettings(): Promise<HomeSavingsSettings> {
  const { data, error } = await siteSettings
    .from("site_settings")
    .select("footer")
    .eq("id", 1)
    .single();

  if (error) return DEFAULT_HOME_SAVINGS_SETTINGS;

  return resolveHomeSavingsSettings(
    (data as { footer?: { homeSavings?: unknown } } | null)?.footer?.homeSavings,
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminSettings(): Promise<SiteSettings> {
  const { data, error } = await siteSettings.from("site_settings").select("*").eq("id", 1).single();

  if (error) throw error;
  return data as SiteSettings;
}

export async function updateFooterSettings(footer: FooterSettings): Promise<void> {
  const { error } = await siteSettings
    .from("site_settings")
    .update({ footer, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) throw error;
}

export async function updateHomeSavingsSettings(
  homeSavings: unknown,
  currentFooter: FooterSettings,
): Promise<void> {
  const validated = parseHomeSavingsSettings(homeSavings);
  if (!validated) throw new Error("La configuración de categorías no es válida.");

  const { error } = await siteSettings
    .from("site_settings")
    .update({
      footer: { ...currentFooter, homeSavings: validated },
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) throw error;
}
