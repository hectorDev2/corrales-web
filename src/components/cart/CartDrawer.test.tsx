import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types/cart";

import { CartDrawer } from "./CartDrawer";

const cartItem: CartItem = {
  key: "pollo-clasico",
  product: {
    id: "pollo",
    name: "1/2 Pollo a la Brasa",
    description: "Pollo con papas",
    image: { src: "/images/pollo.png", alt: "1/2 Pollo a la Brasa" },
    category: "Pollos",
    variants: [],
  },
  variant: {
    id: "pollo-clasico",
    label: null,
    price: 43,
    stock: 10,
    sort_order: 0,
  },
  quantity: 1,
  selectedOptions: {},
};

describe("CartDrawer", () => {
  beforeEach(() => {
    useCartStore.setState({ isOpen: false, items: [] });
  });

  it("does not render when closed", () => {
    render(<CartDrawer />);
    expect(screen.queryByRole("dialog", { name: "Tu pedido" })).not.toBeInTheDocument();
  });

  it("renders with a z-index higher than fixed page footers (z-[110]) so it sits in front", () => {
    useCartStore.setState({ isOpen: true });
    render(<CartDrawer />);

    const dialog = screen.getByRole("dialog", { name: "Tu pedido" });
    const backdrop = document.body.querySelector('[aria-hidden="true"]');

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass("z-[130]");
    expect(backdrop).toHaveClass("z-[120]");
  });

  it("portals the drawer above page-level sticky purchase bars", async () => {
    useCartStore.setState({ isOpen: true, items: [cartItem] });
    render(<CartDrawer />);

    const dialog = await screen.findByRole("dialog", { name: "Tu pedido" });

    expect(dialog.parentElement).toBe(document.body);
  });

  it("renders the mobile cart as a page-like checkout flow", () => {
    useCartStore.setState({ isOpen: true, items: [cartItem] });
    render(<CartDrawer />);

    expect(screen.getByRole("heading", { name: "Carrito" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vaciar carrito" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Resumen de pedido" })).toHaveClass(
      "rounded-xl",
      "bg-white",
    );
    expect(screen.getByRole("link", { name: "Seguir comprando" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Ir a pagar" })).toHaveAttribute("href", "/checkout");
  });

  it("clears every item from the mobile cart", () => {
    useCartStore.setState({ isOpen: true, items: [cartItem] });
    render(<CartDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));

    expect(useCartStore.getState().items).toEqual([]);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("renders repeated persisted item keys without a React duplicate-key warning", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    useCartStore.setState({
      isOpen: true,
      items: [cartItem, { ...cartItem, quantity: 2 }],
    });

    render(<CartDrawer />);

    expect(screen.getAllByText("1/2 Pollo a la Brasa")).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("Encountered two children with the same key"),
      expect.anything(),
    );
    consoleError.mockRestore();
  });
});
