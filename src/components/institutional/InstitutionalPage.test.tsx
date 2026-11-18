import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InstitutionalPage } from "./InstitutionalPage";

describe("InstitutionalPage", () => {
  it("renders breadcrumbs, institutional navigation and page content", () => {
    render(
      <InstitutionalPage title="Política de privacidad" currentPath="/privacidad">
        <p>Contenido de prueba</p>
      </InstitutionalPage>,
    );

    expect(screen.getByRole("heading", { name: "Política de privacidad" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Historia" })).toHaveAttribute("href", "/nosotros");
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });
});
