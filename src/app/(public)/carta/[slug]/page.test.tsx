import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Page from "./page";

const { getActiveCategoryOptions, getHomeSavingsSettings, getProductsByCategory, notFound } =
  vi.hoisted(() => ({
    getActiveCategoryOptions: vi.fn(),
    getHomeSavingsSettings: vi.fn(),
    getProductsByCategory: vi.fn(),
    notFound: vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    }),
  }));

vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/lib/api/products", () => ({ getActiveCategoryOptions, getProductsByCategory }));
vi.mock("@/lib/api/settings", () => ({ getHomeSavingsSettings }));
vi.mock("@/components/menu", () => ({
  MenuPage: ({
    activeCategory,
    categoryNavigation,
  }: {
    activeCategory: string;
    categoryNavigation?: Array<{ label: string; slug: string }>;
  }) => (
    <div>
      <h1>{activeCategory}</h1>
      {categoryNavigation?.map((item) => (
        <div
          key={item.slug}
          data-slug={item.slug}
          data-selected={item.label === activeCategory ? "true" : undefined}
        >
          {item.label}
        </div>
      ))}
    </div>
  ),
}));

describe("/carta/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveCategoryOptions.mockResolvedValue([{ id: "parrillas", name: "Parrillas" }]);
    getHomeSavingsSettings.mockResolvedValue({
      title: "Ahorrar nunca fue tan rico",
      allHref: "/menu",
      tiles: [
        {
          label: "Para 2",
          href: "/carta/para-2",
          targetCategoryId: "parrillas",
          targetCategory: "Parrillas",
          imageSrc: "/para-2.png",
          sortOrder: 0,
          isActive: true,
        },
      ],
    });
    getProductsByCategory.mockResolvedValue([{ id: "product-1" }]);
  });

  it("filters by Parrillas but presents Para 2 as the selected visible marketing category", async () => {
    render(await Page({ params: Promise.resolve({ slug: "para-2" }) }));

    expect(getProductsByCategory).toHaveBeenCalledWith("Parrillas");
    expect(screen.getByRole("heading", { name: "Para 2" })).toBeInTheDocument();
    expect(screen.getByText("Para 2", { selector: '[data-slug="para-2"]' })).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("returns not found for an unknown category slug", async () => {
    await expect(Page({ params: Promise.resolve({ slug: "desconocida" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledOnce();
    expect(getProductsByCategory).not.toHaveBeenCalled();
  });
});
