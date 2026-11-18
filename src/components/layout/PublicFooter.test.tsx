import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicFooter } from "./PublicFooter";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname }));
vi.mock("./Footer", () => ({ Footer: () => <footer>Global footer</footer> }));

describe("PublicFooter", () => {
  beforeEach(() => usePathname.mockReturnValue("/"));

  it("keeps the global footer on regular public routes", () => {
    render(<PublicFooter />);

    expect(screen.getByText("Global footer")).toBeInTheDocument();
  });

  it.each(["/producto/427", "/producto/combo-big-crunch"])(
    "hides the global footer on product detail route %s",
    (pathname) => {
      usePathname.mockReturnValue(pathname);
      render(<PublicFooter />);

      expect(screen.queryByText("Global footer")).not.toBeInTheDocument();
    },
  );

  it("does not hide the footer on a similarly prefixed route", () => {
    usePathname.mockReturnValue("/productos");
    render(<PublicFooter />);

    expect(screen.getByText("Global footer")).toBeInTheDocument();
  });
});
