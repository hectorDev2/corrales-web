/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/types/product";

import { MenuPage } from "./MenuPage";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: React.ComponentProps<"img"> & { fill?: boolean }) => (
    <img {...props} />
  ),
}));

const products: Product[] = Array.from({ length: 13 }, (_, index) => ({
  id: `product-${index + 1}`,
  name: `Producto ${index + 1}`,
  description: "Una opción de nuestra carta.",
  image: { src: "/images/404-image.png", alt: `Producto ${index + 1}` },
  category: index < 7 ? "Pollo a la Brasa" : "Parrillas",
  variants: [{ id: `variant-${index + 1}`, label: null, price: 20 + index, sort_order: 0 }],
}));

describe("MenuPage", () => {
  it("renders a catalog strip, desktop product grid, and accessible pagination", async () => {
    const user = userEvent.setup();
    render(<MenuPage products={products} categories={["Pollo a la Brasa", "Parrillas"]} />);

    expect(screen.getByRole("link", { name: "Ver todo" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Pollo a la Brasa" })).toHaveAttribute(
      "href",
      "/menu?categoria=Pollo%20a%20la%20Brasa",
    );
    expect(screen.getByText("13 resultados")).toBeInTheDocument();
    expect(screen.getByTestId("menu-product-grid")).toHaveClass("xl:grid-cols-4");
    expect(screen.getByRole("main")).toHaveClass("lg:px-10");
    expect(screen.getByRole("link", { name: "Producto 1" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Página 2" }));

    expect(screen.getByRole("link", { name: "Producto 13" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Producto 1" })).not.toBeInTheDocument();
  });

  it("defaults to the vertical catalog and switches to horizontal product rows", async () => {
    const user = userEvent.setup();
    render(<MenuPage products={products} categories={["Pollo a la Brasa", "Parrillas"]} />);

    const verticalButton = screen.getByRole("button", {
      name: "Ver productos en modo vertical",
    });
    const horizontalButton = screen.getByRole("button", {
      name: "Ver productos en modo horizontal",
    });

    expect(verticalButton).toHaveAttribute("aria-pressed", "true");
    expect(horizontalButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("menu-product-grid")).toBeInTheDocument();
    expect(screen.queryByTestId("menu-product-list")).not.toBeInTheDocument();

    await user.click(horizontalButton);

    expect(verticalButton).toHaveAttribute("aria-pressed", "false");
    expect(horizontalButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("menu-product-list")).toBeInTheDocument();
    expect(screen.queryByTestId("menu-product-grid")).not.toBeInTheDocument();
  });
});
