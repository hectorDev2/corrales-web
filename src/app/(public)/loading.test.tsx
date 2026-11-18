import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeLoadingSkeleton } from "@/components/home/HomeLoadingSkeleton";

describe("Home loading state", () => {
  it("renders an accessible skeleton with progressively staggered placeholders", () => {
    const { container } = render(<HomeLoadingSkeleton />);

    expect(screen.getByRole("status", { name: "Cargando inicio" })).toHaveAttribute(
      "aria-busy",
      "true",
    );

    const skeletons = container.querySelectorAll("[data-home-skeleton]");
    expect(skeletons.length).toBeGreaterThan(10);
    expect(skeletons[0]).toHaveClass("home-skeleton-cascade");
    expect(skeletons[0]).toHaveStyle({ "--skeleton-delay": "0ms" });
    expect(skeletons[1]).toHaveStyle({ "--skeleton-delay": "100ms" });
  });
});
