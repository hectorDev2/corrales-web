import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CareersForm } from "./CareersForm";

describe("CareersForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads the PDF and shows success only after the API confirms it", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<CareersForm />);

    await user.type(screen.getByLabelText("Nombre completo"), "Ana Pérez");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await user.upload(
      screen.getByLabelText("CV en PDF"),
      new File(["resume"], "ana-perez.pdf", { type: "application/pdf" }),
    );
    await user.click(screen.getByRole("checkbox"));
    fireEvent.submit(screen.getByRole("button", { name: /Enviar postulación/ }).closest("form")!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get("formType")).toBe("careers");
    expect(body.get("name")).toBe("Ana Pérez");
    expect(body.get("privacyPolicy")).toBe("true");
    expect(body.get("resume")).toBeInstanceOf(File);
    expect(await screen.findByRole("status")).toHaveTextContent("¡Postulación enviada!");
  });

  it("rejects a non-PDF before calling the API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<CareersForm />);
    await user.upload(
      screen.getByLabelText("CV en PDF"),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "ana.pdf", { type: "application/pdf" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("no puede superar los 5MB");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
