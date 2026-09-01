import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Product } from "@/types/product";

import { ProductDetailPage } from "./ProductDetailPage";

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
  it("keeps product context sticky only on desktop below the stacked public navigation", () => {
    render(<ProductDetailPage product={product} />);

    const productContextPanel = screen.getByTestId("product-detail-sticky-panel");

    expect(productContextPanel).toHaveClass("lg:sticky", "lg:top-[121px]");
    expect(productContextPanel).not.toHaveClass("sticky");
    expect(productContextPanel).toHaveClass("lg:max-h-[calc(100dvh-137px)]", "lg:overflow-y-auto");
    expect(productContextPanel.querySelector("img")).toHaveAttribute("src", "/pollo.jpg");
    expect(productContextPanel).toHaveTextContent("S/ 80.00");
    expect(productContextPanel).toHaveTextContent(product.description);
  });
});
