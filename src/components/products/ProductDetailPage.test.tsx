import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/types/product";

import { ProductDetailPage } from "./ProductDetailPage";

const { toast } = vi.hoisted(() => ({
  toast: { error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast }));

const product: Product = {
  id: "pollo-a-la-brasa",
  name: "1 Pollo a la Brasa",
  description: "Pollo a la brasa con acompañamientos.",
  image: { src: "/pollo.jpg", alt: "1 Pollo a la Brasa" },
  category: "Parrillas",
  variants: [{ id: "regular", label: null, price: 80, sort_order: 0 }],
  optionGroups: [
    {
      id: "acompanamiento",
      name: "Elige tu Complemento",
      selectionType: "single",
      minSelect: 1,
      maxSelect: 1,
      isRequired: true,
      sortOrder: 0,
      options: [
        {
          id: "papas",
          name: "Papas Fritas",
          imageUrl: null,
          priceDelta: 0,
          sortOrder: 0,
        },
      ],
    },
  ],
};

describe("ProductDetailPage", () => {
  beforeEach(() => {
    toast.error.mockClear();
  });

  it("renders the fixed mobile purchase bar with quantity controls", () => {
    render(<ProductDetailPage product={product} />);

    expect(screen.getByRole("group", { name: "Cantidad del producto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Disminuir cantidad del producto" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Incrementar cantidad del producto" })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Agregar al carrito/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("link", { name: "Comprar ahora (S/ 80.00)" })).toBeInTheDocument();
  });

  it("scrolls to the first incomplete required group and shows an error", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      render(<ProductDetailPage product={product} />);

      const addButton = screen.getByRole("button", { name: /Agregar al carrito/ });
      expect(addButton).toHaveAttribute("aria-disabled", "true");
      expect(addButton).not.toBeDisabled();

      fireEvent.click(addButton);

      expect(toast.error).toHaveBeenCalledWith("Falta completar esta sección");
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
      expect(
        screen.getByTestId("product-option-group-acompanamiento").querySelector("button"),
      ).toHaveFocus();
    } finally {
      delete (HTMLElement.prototype as HTMLElement & { scrollIntoView?: unknown }).scrollIntoView;
    }
  });

  it("shows a trash icon when an optional quantity reaches its minimum", () => {
    const quantityProduct: Product = {
      ...product,
      optionGroups: [
        {
          id: "extras",
          name: "Agrega un Extra",
          selectionType: "quantity",
          minSelect: 0,
          maxSelect: null,
          isRequired: false,
          sortOrder: 0,
          options: [
            {
              id: "extra-pollo",
              name: "Extra Pollo",
              imageUrl: null,
              priceDelta: 6,
              sortOrder: 0,
            },
          ],
        },
      ],
    };

    render(<ProductDetailPage product={quantityProduct} />);

    fireEvent.click(screen.getByRole("button", { name: "Incrementar cantidad de Extra Pollo" }));

    expect(screen.getByRole("img", { name: "trash" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "minus" })).not.toBeInTheDocument();
  });

  it("animates quantity actions and delays removal until the feedback finishes", () => {
    vi.useFakeTimers();

    try {
      const quantityProduct: Product = {
        ...product,
        optionGroups: [
          {
            id: "extras",
            name: "Agrega un Extra",
            selectionType: "quantity",
            minSelect: 0,
            maxSelect: null,
            isRequired: false,
            sortOrder: 0,
            options: [
              {
                id: "extra-pollo",
                name: "Extra Pollo",
                imageUrl: null,
                priceDelta: 6,
                sortOrder: 0,
              },
            ],
          },
        ],
      };

      render(<ProductDetailPage product={quantityProduct} />);
      fireEvent.click(screen.getByRole("button", { name: "Incrementar cantidad de Extra Pollo" }));

      const removeButton = screen.getByRole("button", { name: "Eliminar Extra Pollo" });
      expect(removeButton).toHaveClass("active:scale-75");

      fireEvent.click(removeButton);

      expect(removeButton).toHaveClass("scale-75");
      expect(screen.getByRole("img", { name: "trash" })).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(180));

      expect(screen.queryByRole("img", { name: "trash" })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the product detail content separated from the viewport edges", () => {
    render(<ProductDetailPage product={product} />);

    expect(screen.getByRole("main")).toHaveClass("px-4", "md:px-6", "lg:px-8");
  });

  it("keeps product context sticky only on desktop below the stacked public navigation", () => {
    render(<ProductDetailPage product={product} />);

    const productContextPanel = screen.getByTestId("product-detail-sticky-panel");

    expect(productContextPanel).toHaveClass("lg:sticky", "lg:top-[121px]");
    expect(productContextPanel).not.toHaveClass("sticky");
    expect(productContextPanel).not.toHaveClass(
      "lg:max-h-[calc(100dvh-137px)]",
      "lg:overflow-y-auto",
    );
    expect(productContextPanel.querySelector("img")).toHaveAttribute("src", "/pollo.jpg");
    expect(productContextPanel).toHaveTextContent("S/ 80.00");
    expect(productContextPanel).toHaveTextContent(product.description);
  });
});
