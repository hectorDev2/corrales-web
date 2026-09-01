/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_HOME_SAVINGS_SETTINGS } from "@/lib/api/settings";

import { SavingsCategories } from "./SavingsCategories";

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => <img {...props} />,
}));

describe("SavingsCategories", () => {
  it("keeps the category navigation while displaying a product image in every card", () => {
    const { container } = render(<SavingsCategories />);

    expect(screen.getByRole("heading", { name: "Ahorrar nunca fue tan rico" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Para Compartir" })).toHaveAttribute(
      "href",
      "/menu?categoria=Pollo%20a%20la%20Brasa",
    );
    expect(screen.getByRole("link", { name: "Para 2" })).toHaveAttribute(
      "href",
      "/menu?categoria=Parrillas",
    );
    expect(screen.getByRole("link", { name: "Para ti" })).toHaveAttribute(
      "href",
      "/menu?categoria=Acompa%C3%B1amiento",
    );
    expect(screen.getByRole("link", { name: "Twister XL" })).toHaveAttribute(
      "href",
      "/menu?categoria=Bebidas",
    );

    const images = container.querySelectorAll("img");

    expect(images).toHaveLength(4);
    images.forEach((image) => {
      expect(image).toHaveClass("h-12", "w-auto", "object-contain");
      expect(image).not.toHaveClass("w-16");
    });
  });

  it("renders the saved title, route, and active tiles in their configured order", () => {
    const settings = {
      ...DEFAULT_HOME_SAVINGS_SETTINGS,
      title: "Elegí tu favorito",
      allHref: "/menu?tag=ahorro",
      tiles: [
        { ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[2], label: "Tercero", sortOrder: 2 },
        { ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[0], label: "Primero", sortOrder: 0 },
        {
          ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[3],
          label: "Oculto",
          sortOrder: 3,
          isActive: false,
        },
        { ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[1], label: "Segundo", sortOrder: 1 },
      ],
    };

    render(<SavingsCategories settings={settings} />);

    expect(screen.getByRole("heading", { name: "Elegí tu favorito" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver todos" })).toHaveAttribute(
      "href",
      "/menu?tag=ahorro",
    );
    expect(
      screen
        .getAllByRole("link")
        .slice(1)
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      DEFAULT_HOME_SAVINGS_SETTINGS.tiles[0].href,
      DEFAULT_HOME_SAVINGS_SETTINGS.tiles[1].href,
      DEFAULT_HOME_SAVINGS_SETTINGS.tiles[2].href,
    ]);
    expect(screen.queryByRole("link", { name: "Oculto" })).not.toBeInTheDocument();
  });
});
