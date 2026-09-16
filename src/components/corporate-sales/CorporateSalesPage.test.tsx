import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CorporateSalesPage } from "./CorporateSalesPage";

describe("CorporateSalesPage", () => {
  it("renders the corporate sales request form", () => {
    render(<CorporateSalesPage />);

    expect(
      screen.getByRole("heading", { name: "Contactá a nuestro equipo de Ventas Corporativas" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombres")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellidos")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Número de celular")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Política de Privacidad" })).toHaveAttribute(
      "href",
      "/institucional/paginas-informativas/politicas-privacidad",
    );
    expect(screen.getByRole("button", { name: "Solicitar información" })).toBeInTheDocument();
  });
});
