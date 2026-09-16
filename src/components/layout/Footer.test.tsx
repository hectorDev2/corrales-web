import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";

vi.mock("@/lib/api/settings", () => ({
  getFooterSettings: vi.fn().mockResolvedValue(null),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes working links for contact, company and policy sections", async () => {
    render(<Footer />);

    expect(await screen.findByRole("link", { name: /Contáctanos/ })).toHaveAttribute(
      "href",
      "/institucional/formularios/contactanos",
    );
    expect(screen.getByRole("link", { name: /Encuesta/ })).toHaveAttribute(
      "href",
      "/institucional/formularios/encuesta",
    );
    expect(screen.getByRole("link", { name: /505-0505/ })).toHaveAttribute("href", "tel:5050505");
    expect(screen.getByRole("link", { name: /Servicio al cliente/ })).toHaveAttribute(
      "href",
      "https://wa.me/51999999999",
    );
    expect(screen.getByRole("link", { name: /Ventas corporativas/ })).toHaveAttribute(
      "href",
      "/ventas-corporativas",
    );
    expect(screen.getByRole("link", { name: /Libro de Reclamaciones/ })).toHaveAttribute(
      "href",
      "/libro-de-reclamaciones",
    );
    expect(screen.getByRole("link", { name: /Términos y condiciones/ })).toHaveAttribute(
      "href",
      "/institucional/paginas-informativas/terminos-condiciones-web",
    );
    expect(screen.getByRole("link", { name: /Políticas de privacidad/ })).toHaveAttribute(
      "href",
      "/institucional/paginas-informativas/politicas-privacidad",
    );
    expect(screen.getByRole("link", { name: /Control de cookies/ })).toHaveAttribute(
      "href",
      "/institucional/paginas-informativas/politicas-cookies",
    );
  });
});
