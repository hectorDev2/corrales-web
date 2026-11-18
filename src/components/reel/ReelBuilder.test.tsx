import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReelBuilder } from "./ReelBuilder";

describe("ReelBuilder", () => {
  it("reveals the Corrales experience progressively across seven recording stages", async () => {
    const user = userEvent.setup();

    render(<ReelBuilder />);

    expect(screen.getByRole("heading", { name: "Estructura vacía" })).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Navegación de demostración" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Siguiente etapa" }));
    expect(screen.getByRole("heading", { name: "Navbar" })).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Navegación de demostración" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hero" }));
    expect(screen.getByRole("heading", { name: "Hero" })).toBeInTheDocument();
    expect(screen.getByText("El sabor que reúne a todos")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Página completa" }));
    expect(screen.getByRole("heading", { name: "Página completa" })).toBeInTheDocument();
    expect(screen.getByText("Promos grupales")).toBeInTheDocument();
    expect(screen.getByText("Clásico Corrales")).toBeInTheDocument();
    expect(screen.getByText("Tu pedido")).toBeInTheDocument();
    expect(screen.getByText("Cliente → Entrega → Pago")).toBeInTheDocument();
    expect(screen.getByText("Corrales. Todos los derechos reservados.")).toBeInTheDocument();
  });

  it("supports keyboard navigation and reset for fast recording", async () => {
    const user = userEvent.setup();

    render(<ReelBuilder />);

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("heading", { name: "Hero" })).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("heading", { name: "Navbar" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reiniciar demostración" }));
    expect(screen.getByRole("heading", { name: "Estructura vacía" })).toBeInTheDocument();
  });
});
