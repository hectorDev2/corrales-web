import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublicHeaderHeightSync } from "./PublicHeaderHeightSync";

describe("PublicHeaderHeightSync", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty("--public-mobile-header-height");
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("keeps the mobile sticky offset equal to the rendered public header height", () => {
    const header = document.createElement("header");
    header.dataset.publicHeader = "true";
    document.body.append(header);
    vi.spyOn(header, "getBoundingClientRect").mockReturnValue({
      bottom: 104,
      height: 104,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    render(<PublicHeaderHeightSync />);

    expect(document.documentElement.style.getPropertyValue("--public-mobile-header-height")).toBe(
      "104px",
    );
  });
});
