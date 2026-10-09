import type { CategoryOption } from "@/lib/api/products";

const LEGACY_CATEGORY_BY_SLUG = {
  "para-compartir": "Pollo a la Brasa",
  "para-2": "Parrillas",
  "para-ti": "Acompañamiento",
  "twister-xl": "Bebidas",
} as const;

export type LegacyCartaCategorySlug = keyof typeof LEGACY_CATEGORY_BY_SLUG;

const LEGACY_SLUG_BY_CATEGORY = new Map<string, LegacyCartaCategorySlug>(
  Object.entries(LEGACY_CATEGORY_BY_SLUG).map(([slug, category]) => [
    category,
    slug as LegacyCartaCategorySlug,
  ]),
);

export function slugifyCategoryName(category: string): string {
  return (
    category
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "categoria"
  );
}

export function getCartaHrefForLabel(label: string): string {
  return `/carta/${slugifyCategoryName(label)}`;
}

export function getLegacyTargetCategory(href: string): string | null {
  try {
    const url = new URL(href, "https://corrales.local");
    if (url.hash) return null;

    if (url.pathname === "/menu" && url.searchParams.size === 1) {
      return url.searchParams.get("categoria");
    }

    if (url.pathname.startsWith("/carta/") && !url.search) {
      const slug = decodeURIComponent(url.pathname.slice(7));
      return LEGACY_CATEGORY_BY_SLUG[slug as LegacyCartaCategorySlug] ?? null;
    }

    return null;
  } catch {
    return null;
  }
}

function categoriesForBaseSlug(slug: string, categories: CategoryOption[]): CategoryOption[] {
  return categories.filter((category) => slugifyCategoryName(category.name) === slug);
}

function routeCandidates(slug: string, categories: CategoryOption[]): CategoryOption[] {
  const resolved = new Map<string, CategoryOption>();
  categoriesForBaseSlug(slug, categories).forEach((category) =>
    resolved.set(category.id, category),
  );

  const legacyName = LEGACY_CATEGORY_BY_SLUG[slug as LegacyCartaCategorySlug];
  const legacyCategory = legacyName
    ? categories.find((category) => category.name === legacyName)
    : undefined;
  if (legacyCategory) resolved.set(legacyCategory.id, legacyCategory);

  return [...resolved.values()];
}

export function getCartaHrefForCategory(
  category: CategoryOption,
  categories: CategoryOption[],
): string | null {
  const current = categories.find((candidate) => candidate.id === category.id);
  if (!current) return null;

  const baseSlug = slugifyCategoryName(current.name);
  const hasCollision = routeCandidates(baseSlug, categories).length > 1;
  const slug = hasCollision ? `${baseSlug}--${encodeURIComponent(current.id)}` : baseSlug;
  return `/carta/${slug}`;
}

export function getCategoryForCartaSlug(slug: string, categories: CategoryOption[]): string | null {
  const separatorIndex = slug.lastIndexOf("--");
  if (separatorIndex > 0) {
    const baseSlug = slug.slice(0, separatorIndex);
    const categoryId = slug.slice(separatorIndex + 2);
    const candidates = routeCandidates(baseSlug, categories);
    const category = candidates.find((candidate) => candidate.id === categoryId);
    return candidates.length > 1 && category ? category.name : null;
  }

  const candidates = routeCandidates(slug, categories);
  return candidates.length === 1 ? candidates[0].name : null;
}

export function getCategoryIdForHref(href: string, categories: CategoryOption[]): string | null {
  try {
    const url = new URL(href, "https://corrales.local");
    let categoryName: string | null = null;

    if (url.pathname.startsWith("/carta/") && !url.search && !url.hash) {
      categoryName = getCategoryForCartaSlug(decodeURIComponent(url.pathname.slice(7)), categories);
    } else if (url.pathname === "/menu" && !url.hash && url.searchParams.size === 1) {
      categoryName = url.searchParams.get("categoria");
    }

    return categories.find((category) => category.name === categoryName)?.id ?? null;
  } catch {
    return null;
  }
}

/** Preserves arbitrary admin links while upgrading the four legacy category URLs. */
export function normalizeCategoryHref(href: string): string {
  try {
    const url = new URL(href, "https://corrales.local");
    if (url.pathname !== "/menu" || url.hash || url.searchParams.size !== 1) return href;

    const category = url.searchParams.get("categoria");
    const slug = category ? LEGACY_SLUG_BY_CATEGORY.get(category) : null;
    return slug ? `/carta/${slug}` : href;
  } catch {
    return href;
  }
}
