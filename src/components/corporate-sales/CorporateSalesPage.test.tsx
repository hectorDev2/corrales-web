import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CorporateSalesPage } from "./CorporateSalesPage";

describe("CorporateSalesPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it("sends the request and only shows success after the API confirms it", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<CorporateSalesPage />);

    await user.type(screen.getByLabelText("Nombres"), "Ana");
    await user.type(screen.getByLabelText("Apellidos"), "Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByLabelText("Número de celular"), "999999999");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Solicitar información" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("/api/public/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.stringContaining('"formType":"corporate-sales"'),
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Recibimos tu solicitud");
  });

  it("shows an error instead of success when the API rejects the request", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "No disponible" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<CorporateSalesPage />);

    await user.type(screen.getByLabelText("Nombres"), "Ana");
    await user.type(screen.getByLabelText("Apellidos"), "Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByLabelText("Número de celular"), "999999999");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Solicitar información" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No disponible");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
