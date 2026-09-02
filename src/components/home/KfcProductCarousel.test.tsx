import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KfcProductCarousel } from "./KfcProductCarousel";

vi.mock("./QuickAddButton", () => ({
  QuickAddButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button" aria-label="Agregar al carrito">
      {children}
    </button>
  ),
}));

const products = [
  {
    id: "pollo-a-la-brasa",
    name: "Pollo a la brasa",
    description: "Pollo dorado con papas fritas y ensalada.",
    image: { src: "/pollo.jpg", alt: "Pollo a la brasa" },
    category: "Pollo a la Brasa",
    variants: [{ id: "regular", label: null, price: 45, sort_order: 0 }],
  },
];

const carouselProducts = Array.from({ length: 4 }, (_, index) => ({
  ...products[0],
  id: `producto-${index + 1}`,
  name: `Producto ${index + 1}`,
}));

describe("KfcProductCarousel", () => {
  it("uses equal-height product cards with square media and the catalog action", () => {
    const { container } = render(
      <KfcProductCarousel title="Lo más pedido" products={products} href="/menu" />,
    );

    expect(screen.getByRole("heading", { name: "Lo más pedido" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver todos/i })).toHaveAttribute("href", "/menu");

    const productImage = screen.getByAltText("Pollo a la brasa");
    expect(productImage).toHaveClass("aspect-square", "object-contain");
    const card = container.querySelector("[data-product-carousel-card]");
    const cardContent = container.querySelector("[data-product-carousel-card-content]");

    expect(card).toHaveClass("self-stretch");
    expect(cardContent).toHaveClass("h-[152px]", "md:h-[168px]", "shrink-0");
    expect(screen.getAllByRole("link", { name: "Pollo a la brasa" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeEnabled();
  });

  it("reserves identical content space for short and long product metadata", () => {
    const longDescription =
      "Pollo marinado acompañado de papas fritas, ensalada fresca y todas nuestras cremas de la casa.";
    const productsWithDifferentMetadata = [
      products[0],
      {
        ...products[0],
        id: "producto-con-texto-largo",
        name: "Producto con un nombre suficientemente largo para ocupar más de una línea",
        description: longDescription,
        tag: "PROMOCIÓN ESPECIAL MUY LARGA",
        variants: [
          { id: "oferta", label: null, price: 32, sort_order: 0 },
          { id: "regular", label: null, price: 56, sort_order: 1 },
        ],
      },
    ];
    const { container } = render(
      <KfcProductCarousel title="Lo más pedido" products={productsWithDifferentMetadata} />,
    );

    const cards = container.querySelectorAll<HTMLElement>("[data-product-carousel-card]");
    const contentSlots = container.querySelectorAll<HTMLElement>(
      "[data-product-carousel-card-content]",
    );

    expect(cards).toHaveLength(2);
    contentSlots.forEach((contentSlot) => {
      expect(contentSlot).toHaveClass("h-[152px]", "md:h-[168px]", "shrink-0");
    });

    expect(screen.getByText(longDescription)).toHaveClass("line-clamp-2", "h-8", "md:h-10");
    expect(cards[1].querySelector("h3")).toHaveClass("line-clamp-2", "h-9", "md:h-10");
    expect(cards[1].querySelector("[data-product-carousel-price-meta]")).toHaveClass(
      "h-5",
      "overflow-hidden",
    );
  });

  it("only lets its controls advance one snapped card at a time", () => {
    const { container } = render(
      <KfcProductCarousel title="Lo más pedido" products={carouselProducts} />,
    );

    const carousel = container.querySelector<HTMLElement>("[data-product-carousel]");
    const viewport = container.querySelector<HTMLElement>("[data-product-carousel-viewport]");
    const cards = container.querySelectorAll<HTMLElement>("[data-product-carousel-card]");

    expect(viewport).toHaveClass("overflow-hidden", "min-w-0");
    expect(viewport).toContainElement(carousel);
    expect(viewport).not.toContainElement(screen.getByRole("button", { name: "Siguiente" }));
    expect(carousel).toHaveClass("overflow-x-hidden", "touch-pan-y");
    expect(carousel).not.toHaveClass("overflow-x-auto");
    expect(cards[0]).toHaveClass(
      "min-w-0",
      "flex-[0_0_calc((100%_-_0.75rem)_/_2)]",
      "md:flex-[0_0_calc((100%_-_3rem)_/_4)]",
      "lg:flex-[0_0_calc((100%_-_4rem)_/_5)]",
    );

    Object.defineProperty(carousel, "scrollLeft", { configurable: true, value: 0, writable: true });
    [0, 252, 504, 756].forEach((offsetLeft, index) => {
      Object.defineProperty(cards[index], "offsetLeft", { configurable: true, value: offsetLeft });
    });

    const scrollTo = vi.fn((optionsOrX: ScrollToOptions | number) => {
      carousel!.scrollLeft =
        typeof optionsOrX === "number" ? optionsOrX : (optionsOrX.left ?? 0);
    }) as unknown as HTMLElement["scrollTo"];
    carousel!.scrollTo = scrollTo;

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 252, behavior: "smooth" });

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 504, behavior: "smooth" });

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 252, behavior: "smooth" });
  });
});
