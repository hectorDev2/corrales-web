import { describe, expect, it } from "vitest";

import { addDaysISO, monthWeeks, parseISODate, toISODate } from "./dates";

describe("dates", () => {
  it("toISODate y parseISODate son inversas en hora local", () => {
    expect(toISODate(parseISODate("2026-03-09"))).toBe("2026-03-09");
  });

  it("addDaysISO cruza meses y años", () => {
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysISO("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("monthWeeks empieza en lunes y completa semanas", () => {
    const weeks = monthWeeks(new Date(2026, 10, 1)); // nov 2026: domingo 1
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0].slice(0, 6).every((c) => c === null)).toBe(true);
    expect(weeks[0][6]).toBe("2026-11-01");
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
  });
});
