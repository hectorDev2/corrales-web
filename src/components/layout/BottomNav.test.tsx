import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePathname } from "next/navigation";

import { BottomNav } from "./BottomNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("BottomNav", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("is hidden on product detail pages so the purchase bar remains visible", () => {
    vi.mocked(usePathname).mockReturnValue("/producto/pollo-a-la-brasa");

    render(<BottomNav />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
