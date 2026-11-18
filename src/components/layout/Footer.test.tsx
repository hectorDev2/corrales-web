import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";

vi.mock("@/lib/api/settings", () => ({
  getFooterSettings: vi.fn().mockResolvedValue(null),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("sends the newsletter data and shows success feedback", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<Footer />);

    await user.type(screen.getByLabelText("Nombre para suscribirse"), "Ana Pérez");
    await user.type(screen.getByLabelText("Correo electrónico para suscribirse"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Suscribirme" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("/api/public/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "newsletter", name: "Ana Pérez", email: "ana@example.com" }),
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Gracias. Te suscribimos correctamente.",
    );
  });

  it("shows an error without claiming success when the newsletter request fails", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<Footer />);

    await user.type(screen.getByLabelText("Nombre para suscribirse"), "Ana Pérez");
    await user.type(screen.getByLabelText("Correo electrónico para suscribirse"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Suscribirme" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos completar la suscripción.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
