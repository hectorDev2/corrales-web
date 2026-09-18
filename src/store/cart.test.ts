import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { Product, ProductVariant } from "@/types/product";

import { useCartStore } from "./cart";

const product: Product = {
  id: "product-1",
  name: "Producto",
  description: "Descripción del producto",
  image: { src: "/product.jpg", alt: "Producto" },
  category: "Categoría",
  variants: [],
};

const variant: ProductVariant = {
  id: "variant-1",
  label: "Regular",
  price: 10,
  stock: 2,
  sort_order: 0,
};

describe("useCartStore stock limits", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it("does not add more units than the variant stock", () => {
    act(() => {
      useCartStore.getState().addItem(product, variant, {}, 3);
    });

    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it("caps quantity updates to the current variant stock", () => {
    act(() => {
      useCartStore.getState().addItem(product, variant);
      useCartStore.getState().updateQuantity(variant.id, 99);
    });

    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it("does not add an out-of-stock variant", () => {
    act(() => {
      useCartStore.getState().addItem(product, { ...variant, stock: 0 });
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
