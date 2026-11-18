import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppDownloadBanner } from "./AppDownloadBanner";

describe("AppDownloadBanner", () => {
  it("uses the square mobile creative and the wide desktop creative", () => {
    const { container } = render(<AppDownloadBanner />);

    expect(container.querySelector("picture")).toHaveClass("block", "h-full");
    expect(container.querySelector("source")).toHaveAttribute(
      "srcset",
      "/banner-descargaapp_mobile.png",
    );
    expect(container.querySelector("source")).toHaveAttribute("media", "(max-width: 767px)");
    expect(screen.getByRole("img", { name: "Descarga la app Corrales" })).toHaveAttribute(
      "src",
      "/banner-descargaapp_desktop.webp",
    );
    expect(container.querySelector("[class*='aspect-square']")).toHaveClass(
      "aspect-square",
      "md:aspect-[4.56]",
    );
  });
});
