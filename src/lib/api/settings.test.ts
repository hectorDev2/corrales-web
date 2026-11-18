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

    expect(parseHomeSavingsSettings(settings)).toEqual({
      ...settings,
      tiles: settings.tiles.map((tile) => ({
        ...tile,
        href: `/carta/categoria-${tile.sortOrder + 1}`,
      })),
    });
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

  it("normalizes legacy saved category query links to their clean carta routes", () => {
    const legacySettings = {
      ...DEFAULT_HOME_SAVINGS_SETTINGS,
      tiles: [
        {
          ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[0],
          href: "/menu?categoria=Pollo%20a%20la%20Brasa",
        },
        {
          ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[1],
          href: "/menu?categoria=Parrillas",
        },
        {
          ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[2],
          href: "/menu?categoria=Acompa%C3%B1amiento",
        },
        {
          ...DEFAULT_HOME_SAVINGS_SETTINGS.tiles[3],
          href: "/menu?categoria=Bebidas",
        },
      ],
    };

    const parsed = parseHomeSavingsSettings(legacySettings);
    expect(parsed?.tiles.map((tile) => tile.href)).toEqual([
      "/carta/para-compartir",
      "/carta/para-2",
      "/carta/para-ti",
      "/carta/twister-xl",
    ]);
    expect(parsed?.tiles.map((tile) => tile.targetCategory)).toEqual([
      "Pollo a la Brasa",
      "Parrillas",
      "Acompañamiento",
      "Bebidas",
    ]);
  });

  it("derives the clean href from the marketing label, independently from its target category", () => {
    const settings = {
      ...DEFAULT_HOME_SAVINGS_SETTINGS,
      tiles: DEFAULT_HOME_SAVINGS_SETTINGS.tiles.map((tile, index) =>
        index === 1
          ? { ...tile, label: "Combo Dúo", href: "/carta/para-2", targetCategory: "Parrillas" }
          : tile,
      ),
    };

    expect(parseHomeSavingsSettings(settings)?.tiles[1]).toEqual(
      expect.objectContaining({
        label: "Combo Dúo",
        href: "/carta/combo-duo",
        targetCategory: "Parrillas",
      }),
    );
  });

  it("rejects duplicate marketing slugs instead of routing to an arbitrary tile", () => {
    const settings = {
      ...DEFAULT_HOME_SAVINGS_SETTINGS,
      tiles: DEFAULT_HOME_SAVINGS_SETTINGS.tiles.map((tile, index) =>
        index === 1 ? { ...tile, label: "Para compartir" } : tile,
      ),
    };

    expect(parseHomeSavingsSettings(settings)).toBeNull();
  });
});
