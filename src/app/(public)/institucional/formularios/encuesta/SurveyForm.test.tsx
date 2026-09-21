import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SurveyForm } from "./SurveyForm";

describe("SurveyForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the rating and comments and shows success feedback", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<SurveyForm />);

    await user.selectOptions(screen.getByRole("combobox"), "Excelente");
    await user.type(screen.getByRole("textbox", { name: "Comentarios" }), "Muy buena atención.");
    await user.click(screen.getByRole("button", { name: "Enviar encuesta" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("/api/public/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "survey",
        rating: "Excelente",
        comments: "Muy buena atención.",
      }),
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Gracias por compartir tu experiencia.",
    );
  });

  it("shows an error without claiming success when the survey request fails", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", fetchMock);

    render(<SurveyForm />);

    await user.selectOptions(screen.getByRole("combobox"), "Excelente");
    await user.click(screen.getByRole("button", { name: "Enviar encuesta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos enviar tu encuesta.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
