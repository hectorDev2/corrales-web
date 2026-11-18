import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CheckoutForm } from "./CheckoutForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/script", () => ({
  default: () => null,
}));

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    getStored: () => null,
    requestLocation: vi.fn(),
  }),
}));

vi.mock("@/store/cart", () => ({
  useCartStore: () => ({
    items: [
      {
        product: { id: "product-1", name: "Pollo", image: { src: "", alt: "Pollo" } },
        variant: { id: "variant-1" },
        quantity: 1,
        selectedOptions: {},
      },
    ],
    total: () => 20,
    clearCart: vi.fn(),
  }),
}));

vi.mock("./MapboxAutocomplete", () => ({
  MapboxAutocomplete: () => <input aria-label="Dirección de entrega" />,
  reverseGeocode: vi.fn(),
}));

vi.mock("./OrderSummary", () => ({
  OrderSummary: () => <div>Resumen del pedido</div>,
}));

vi.mock("./UpsellSection", () => ({
  UpsellSection: () => <div>También te puede interesar</div>,
}));

describe("CheckoutForm", () => {
  it("shows the three checkout stages and starts with customer data", () => {
    render(<CheckoutForm />);

    expect(screen.getByRole("navigation", { name: "Progreso del checkout" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cliente/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Datos del Cliente")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej. Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Datos de Entrega")).not.toBeInTheDocument();
  });

  it("advances through customer, delivery, and payment stages after validation", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);

    await user.type(screen.getByPlaceholderText("Ej. Juan Pérez"), "Ana Pérez");
    await user.type(screen.getByPlaceholderText("999 999 999"), "999999999");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Datos de Entrega")).toBeInTheDocument();
    await user.click(screen.getByDisplayValue("pickup"));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Pago seguro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pagar con Culqi/ })).toBeInTheDocument();
  });
});
