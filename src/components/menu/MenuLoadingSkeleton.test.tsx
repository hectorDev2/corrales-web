import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuLoadingSkeleton } from "./MenuLoadingSkeleton";

describe("MenuLoadingSkeleton", () => {
  it("renders the menu catalog structure with cascading product-card placeholders", () => {
    render(<MenuLoadingSkeleton />);

    expect(screen.getByRole("status", { name: "Cargando carta" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByTestId("menu-loading-category-strip")).toBeInTheDocument();
    expect(screen.getByTestId("menu-loading-controls")).toBeInTheDocument();
    expect(screen.getByTestId("menu-loading-grid")).toHaveClass("xl:grid-cols-4");
    expect(screen.getAllByTestId("menu-loading-product-card")).toHaveLength(12);
    expect(screen.getAllByTestId("menu-loading-card-image")[0]).toHaveStyle({
      "--skeleton-delay": "0ms",
    });
    expect(screen.getAllByTestId("menu-loading-card-image")[5]).toHaveStyle({
      "--skeleton-delay": "500ms",
    });
    expect(screen.getAllByTestId("menu-loading-card-image")[6]).toHaveStyle({
      "--skeleton-delay": "0ms",
    });
    expect(screen.getAllByTestId("menu-loading-cascade")[0]).toHaveStyle(
      "--skeleton-delay: 0ms",
    );
  });
});
