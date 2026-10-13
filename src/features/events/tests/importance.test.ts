import { describe, expect, it } from "vitest";
import { uk } from "@/shared/i18n/uk";
import { IMPORTANCES } from "../lib/schemas";
import { presentationOf } from "../ui/importance";

function luminance(hex: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe("presentationOf", () => {
  it("labels each level with its Ukrainian name", () => {
    for (const level of IMPORTANCES) {
      expect(presentationOf(level).label).toBe(uk.importance[level]);
    }
  });

  it("gives each level its own colour", () => {
    const colors = IMPORTANCES.map((level) => presentationOf(level).color);
    expect(new Set(colors).size).toBe(IMPORTANCES.length);
  });

  it("keeps text readable (WCAG AA) on every level's colour", () => {
    for (const level of IMPORTANCES) {
      const { color, textColor } = presentationOf(level);
      expect(contrast(color, textColor)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
