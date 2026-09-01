import { describe, expect, it } from "vitest";

import {
  DEFAULT_HOME_SAVINGS_SETTINGS,
  parseHomeSavingsSettings,
  resolveHomeSavingsSettings,
} from "./settings";

describe("home savings settings", () => {
  it("accepts exactly four valid, ordered category tiles", () => {
    const settings = {
      title: "Promociones para compartir",
      allHref: "/menu?tag=promos",
      tiles: DEFAULT_HOME_SAVINGS_SETTINGS.tiles.map((tile, index) => ({
        ...tile,
        label: `Categoría ${index + 1}`,
        sortOrder: index,
        isActive: index !== 3,
      })),
    };

    expect(parseHomeSavingsSettings(settings)).toEqual(settings);
  });

  it("rejects malformed settings instead of trusting arbitrary JSON or image hosts", () => {
    expect(
      parseHomeSavingsSettings({
        ...DEFAULT_HOME_SAVINGS_SETTINGS,
        tiles: DEFAULT_HOME_SAVINGS_SETTINGS.tiles.slice(0, 3),
      }),
    ).toBeNull();

    expect(
      parseHomeSavingsSettings({
        ...DEFAULT_HOME_SAVINGS_SETTINGS,
        allHref: "https://example.com/menu",
      }),
    ).toBeNull();

    expect(
      parseHomeSavingsSettings({
        ...DEFAULT_HOME_SAVINGS_SETTINGS,
        tiles: [
          {
            ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[0],
            imageSrc: "https://untrusted.example/producto.webp",
          },
          ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles.slice(1),
        ],
      }),
    ).toBeNull();
  });

  it("uses the current safe cards whenever stored data is absent or invalid", () => {
    expect(resolveHomeSavingsSettings(null)).toEqual(DEFAULT_HOME_SAVINGS_SETTINGS);
    expect(resolveHomeSavingsSettings({ title: "No confiable" })).toEqual(
      DEFAULT_HOME_SAVINGS_SETTINGS,
    );
  });
});
