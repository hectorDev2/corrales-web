import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UpsellSection } from "./UpsellSection";

const { addItem, getProducts, items } = vi.hoisted(() => ({
  addItem: vi.fn(),
  getProducts: vi.fn(),
  items: [
    {
      key: "pollo",
      product: { id: "pollo", category: "Pollo a la Brasa" },
      variant: { id: "pollo-regular" },
    },
  ],
}));

vi.mock("@/lib/api/products", () => ({ getProducts }));
vi.mock("@/store/cart", () => ({ useCartStore: () => ({ addItem, items }) }));
vi.mock("next/image", () => ({
  default: ({ fill: _fill, alt, ...props }: React.ComponentProps<"img"> & { fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt ?? ""} />
  ),
}));

describe("UpsellSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProducts.mockResolvedValue([
      {
        id: "bebida-1",
        name: "Chicha Morada",
        description: "Bebida",
        image: { src: "/chicha.png", alt: "Chicha Morada" },
        category: "Bebidas",
        variants: [{ id: "chicha-variant", price: 13, stock: 5 }],
      },
      {
        id: "extra-1",
        name: "Papas Fritas",
        description: "Acompañamiento",
        image: { src: "/papas.png", alt: "Papas Fritas" },
        category: "Extras",
        variants: [{ id: "papas-variant", price: 8, stock: 5 }],
      },
    ]);
  });

  it("renders directional controls to browse suggested products", async () => {
    render(<UpsellSection />);

    expect(
      await screen.findByRole("button", { name: "Productos sugeridos anteriores" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Productos sugeridos siguientes" }),
    ).toBeInTheDocument();
  });

  it("scrolls the suggested products viewport in the selected direction", async () => {
    const scrollBy = vi.fn();
    const originalScrollBy = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollBy");
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });

    try {
      render(<UpsellSection />);

      const nextButton = await screen.findByRole("button", {
        name: "Productos sugeridos siguientes",
      });
      fireEvent.click(nextButton);

      expect(scrollBy).toHaveBeenCalledWith({ left: 280, behavior: "smooth" });
    } finally {
      if (originalScrollBy) {
        Object.defineProperty(HTMLElement.prototype, "scrollBy", originalScrollBy);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "scrollBy");
      }
    }
  });
});
