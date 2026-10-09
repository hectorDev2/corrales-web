/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/types/product";

import { PromotionsPage } from "./PromotionsPage";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: React.ComponentProps<"img"> & { fill?: boolean }) => (
    <img {...props} />
  ),
}));

const promotions: Product[] = [
  {
    id: "promo-1",
    name: "Parrilla a Compartir",
    description: "Una promoción para compartir.",
    image: { src: "/images/404-image.png", alt: "Parrilla a Compartir" },
    tag: "AHORRA",
    category: "Parrillas",
    variants: [{ id: "variant-1", label: null, price: 65, stock: 10, sort_order: 0 }],
  },
  {
    id: "promo-2",
    name: "Monstrito",
    description: "Una promoción personal.",
    image: { src: "/images/404-image.png", alt: "Monstrito" },
    tag: "ESPECIAL",
    category: "Pollo a la Brasa",
    variants: [{ id: "variant-2", label: null, price: 15, stock: 10, sort_order: 0 }],
  },
];

describe("PromotionsPage", () => {
  it("renders real promotional tags as filter chips and a three-column desktop grid", () => {
    render(<PromotionsPage products={promotions} tags={["AHORRA", "ESPECIAL"]} />);

    expect(screen.getByRole("link", { name: "Todas las promos" })).toHaveAttribute(
      "href",
      "/promociones",
    );
    expect(screen.getByRole("link", { name: "AHORRA" })).toHaveAttribute(
      "href",
      "/promociones?tag=AHORRA",
    );
    expect(screen.getByText("2 resultados")).toBeInTheDocument();
    expect(screen.getByTestId("promotions-product-grid")).toHaveClass("md:grid-cols-3");
  });

  it("marks the selected tag and can switch to the horizontal catalog view", async () => {
    const user = userEvent.setup();
    render(
      <PromotionsPage
        products={[promotions[0]]}
        tags={["AHORRA", "ESPECIAL"]}
        activeTag="AHORRA"
      />,
    );

    expect(screen.getByRole("link", { name: "AHORRA" })).toHaveClass("bg-black");

    await user.click(screen.getByRole("button", { name: "Ver productos en modo horizontal" }));

    expect(screen.getByTestId("promotions-product-list")).toBeInTheDocument();
  });

  it("resets page to 1 when activeTag changes so promotions are displayed instead of empty state", async () => {
    const user = userEvent.setup();
    const manyPromos: Product[] = Array.from({ length: 13 }, (_, index) => ({
      ...promotions[0],
      id: `promo-many-${index + 1}`,
      name: `Promo ${index + 1}`,
    }));

    const { rerender } = render(
      <PromotionsPage products={manyPromos} tags={["AHORRA", "ESPECIAL"]} />
    );

    await user.click(screen.getByRole("button", { name: "Página 2" }));
    expect(screen.getByRole("link", { name: "Promo 13" })).toBeInTheDocument();

    rerender(
      <PromotionsPage
        products={[promotions[0]]}
        tags={["AHORRA", "ESPECIAL"]}
        activeTag="AHORRA"
      />
    );

    expect(screen.queryByText("No encontramos promociones")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parrilla a Compartir" })).toBeInTheDocument();
  });
});
