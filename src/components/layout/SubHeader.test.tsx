import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SubHeader } from "./SubHeader";

vi.mock("next/navigation", () => ({
  usePathname: () => "/promociones",
}));

describe("SubHeader", () => {
  it("uses the shared mobile header height so its sticky state stays flush with Header", () => {
    const { container } = render(<SubHeader />);

    expect(container.firstElementChild).toHaveClass(
      "sticky",
      "top-[var(--public-mobile-header-height)]",
      "md:top-[65px]",
    );
    expect(screen.getByRole("link", { name: "Carta" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Promociones" })).toHaveAttribute(
      "href",
      "/promociones",
    );
    expect(screen.getByRole("link", { name: "Promociones" })).toHaveClass(
      "border-primary",
      "text-primary",
    );
    expect(screen.getByRole("link", { name: "Ventas Corporativas" })).toHaveAttribute(
      "href",
      "/trabaja-con-nosotros",
    );
  });
});
