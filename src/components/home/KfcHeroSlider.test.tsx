import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KfcHeroSlider } from "./KfcHeroSlider";

const slides = [
  {
    id: "hero-1",
    type: "image" as const,
    sort_order: 0,
    is_active: true,
    image_url: "/hero-1.jpg",
    image_url_mobile: null,
    eyebrow: null,
    title: "Promoción Corrales",
    subtitle: null,
    cta_label: null,
    cta_href: null,
    bg_gradient: null,
    accent_color: null,
    icon: null,
  },
];

describe("KfcHeroSlider", () => {
  it("renders a rounded compact banner and accessible side navigation", () => {
    const { container } = render(<KfcHeroSlider slides={slides} />);

    expect(container.querySelector("section")).toHaveClass("rounded-xl");
    expect(container.querySelector("section")).not.toHaveClass("mt-4");
    expect(screen.getByRole("button", { name: "Anterior" })).toHaveClass("rounded-r-lg");
    expect(screen.getByRole("button", { name: "Siguiente" })).toHaveClass("rounded-l-lg");
    expect(screen.getByRole("button", { name: "Ir a slide 1" })).toBeInTheDocument();
  });
});
