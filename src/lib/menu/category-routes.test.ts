import { describe, expect, it } from "vitest";

import type { CategoryOption } from "@/lib/api/products";

import {
  getCartaHrefForCategory,
  getCategoryForCartaSlug,
  getCategoryIdForHref,
  normalizeCategoryHref,
  slugifyCategoryName,
} from "./category-routes";

const categories: CategoryOption[] = [
  { id: "pollo", name: "Pollo a la Brasa" },
  { id: "parrillas", name: "Parrillas" },
  { id: "acompanamiento", name: "Acompañamiento" },
  { id: "bebidas", name: "Bebidas" },
  { id: "cafe-1", name: "Café & Té" },
];

describe("category routes", () => {
  it.each([
    ["Pollo a la Brasa", "pollo-a-la-brasa"],
    ["Acompañamiento", "acompanamiento"],
    ["  Café & Té  ", "cafe-te"],
    ["PROMOS / Familia", "promos-familia"],
  ])("slugifies the real category %s as %s", (category, slug) => {
    expect(slugifyCategoryName(category)).toBe(slug);
  });

  it("generates and resolves clean routes from the real category list", () => {
    expect(getCartaHrefForCategory(categories[4], categories)).toBe("/carta/cafe-te");
    expect(getCategoryForCartaSlug("cafe-te", categories)).toBe("Café & Té");
  });

  it.each([
    ["para-compartir", "Pollo a la Brasa"],
    ["para-2", "Parrillas"],
    ["para-ti", "Acompañamiento"],
    ["twister-xl", "Bebidas"],
  ])("keeps resolving the legacy /carta/%s alias", (slug, category) => {
    expect(getCategoryForCartaSlug(slug, categories)).toBe(category);
  });

  it("uses the category id for colliding slugs and never guesses an ambiguous plain slug", () => {
    const colliding: CategoryOption[] = [
      { id: "category-a", name: "Café" },
      { id: "category-b", name: "Cafe" },
    ];

    expect(getCartaHrefForCategory(colliding[0], colliding)).toBe("/carta/cafe--category-a");
    expect(getCartaHrefForCategory(colliding[1], colliding)).toBe("/carta/cafe--category-b");
    expect(getCategoryForCartaSlug("cafe", colliding)).toBeNull();
    expect(getCategoryForCartaSlug("cafe--category-b", colliding)).toBe("Cafe");
  });

  it("returns null instead of routing a legacy alias to the wrong category when it collides", () => {
    const ambiguous = [...categories, { id: "para-2", name: "Para 2" }];
    expect(getCartaHrefForCategory(ambiguous.at(-1)!, ambiguous)).toBe("/carta/para-2--para-2");
    expect(getCategoryForCartaSlug("para-2", ambiguous)).toBeNull();
    expect(getCategoryForCartaSlug("para-2--para-2", ambiguous)).toBe("Para 2");
  });

  it("finds the selected category from clean, legacy carta, and legacy query links", () => {
    expect(getCategoryIdForHref("/carta/cafe-te", categories)).toBe("cafe-1");
    expect(getCategoryIdForHref("/carta/para-2", categories)).toBe("parrillas");
    expect(getCategoryIdForHref("/menu?categoria=Acompa%C3%B1amiento", categories)).toBe(
      "acompanamiento",
    );
    expect(getCategoryIdForHref("/promociones", categories)).toBeNull();
  });

  it("normalizes only the four known legacy menu category links", () => {
    expect(normalizeCategoryHref("/menu?categoria=Parrillas")).toBe("/carta/para-2");
    expect(normalizeCategoryHref("/menu?categoria=Acompa%C3%B1amiento")).toBe("/carta/para-ti");
    expect(normalizeCategoryHref("/menu?tag=ahorro")).toBe("/menu?tag=ahorro");
    expect(normalizeCategoryHref("/promociones")).toBe("/promociones");
  });
});
