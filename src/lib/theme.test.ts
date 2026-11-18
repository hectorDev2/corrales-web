import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME,
  getActiveMode,
  getThemeStatus,
  limaToday,
  resolveThemeSettings,
  suggestedRange,
} from "./theme";

const base = { mode: "halloween", intensity: "normal", from: null, to: null } as const;

describe("theme", () => {
  it("valores inválidos vuelven al tema por defecto", () => {
    expect(resolveThemeSettings(null)).toEqual(DEFAULT_THEME);
    expect(resolveThemeSettings({ mode: "pascua" })).toEqual(DEFAULT_THEME);
    expect(resolveThemeSettings({ ...base, from: "2026-11-05", to: "2026-11-01" })).toEqual(DEFAULT_THEME);
  });

  it("sin fechas, el modo manual siempre está activo", () => {
    expect(getActiveMode(base, "2026-06-01")).toBe("halloween");
    expect(getActiveMode({ ...base, mode: "none" }, "2026-10-25")).toBe("none");
  });

  it("con fechas, solo está activo dentro del rango (inclusive)", () => {
    const s = { ...base, from: "2026-10-20", to: "2026-11-02" };
    expect(getActiveMode(s, "2026-10-19")).toBe("none");
    expect(getActiveMode(s, "2026-10-20")).toBe("halloween");
    expect(getActiveMode(s, "2026-11-02")).toBe("halloween");
    expect(getActiveMode(s, "2026-11-03")).toBe("none");
  });

  it("describe el estado: programado, activo y vencido", () => {
    const s = { ...base, from: "2026-10-20", to: "2026-11-02" };
    expect(getThemeStatus(s, "2026-10-01").kind).toBe("scheduled");
    expect(getThemeStatus(s, "2026-10-25").kind).toBe("active");
    expect(getThemeStatus(s, "2026-12-01").kind).toBe("expired");
    expect(getThemeStatus({ ...base, mode: "none" }).kind).toBe("off");
  });

  it("sugiere las fechas de la próxima temporada", () => {
    expect(suggestedRange("halloween", "2026-09-01")).toEqual({ from: "2026-10-20", to: "2026-11-02" });
    expect(suggestedRange("halloween", "2026-11-17")).toEqual({ from: "2027-10-20", to: "2027-11-02" });
    expect(suggestedRange("navidad", "2026-11-17")).toEqual({ from: "2026-12-01", to: "2026-12-31" });
  });

  it("limaToday usa la hora de Lima (UTC-5)", () => {
    expect(limaToday(new Date("2026-11-18T03:00:00Z"))).toBe("2026-11-17");
  });
});
