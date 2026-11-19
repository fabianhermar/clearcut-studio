import { describe, it, expect } from "vitest";
import {
  resolveTargetRatio,
  calculateCanvasDimensions,
  normalizeGradientColors,
} from "@/components/aspect-ratio-fitter/fitter";

describe("aspect-ratio-fitter engine", () => {
  it("normalizes gradient color stops between 2 and 4 colors", () => {
    expect(normalizeGradientColors([])).toHaveLength(2);
    expect(normalizeGradientColors(["#1e40ff"])).toHaveLength(2);
    expect(normalizeGradientColors(["#1e40ff", "#ff4d00", "#0c0e12"])).toEqual([
      "#1e40ff",
      "#ff4d00",
      "#0c0e12",
    ]);
    expect(
      normalizeGradientColors(["#111", "#222", "#333", "#444", "#555", "#666"])
    ).toHaveLength(4);
  });
  it("resolves preset, original, and custom free ratios accurately", () => {
    expect(resolveTargetRatio("1:1", 1200, 630)).toBe(1);
    expect(resolveTargetRatio("4:5", 1200, 630)).toBeCloseTo(0.8);
    expect(resolveTargetRatio("16:9", 1200, 630)).toBeCloseTo(16 / 9);
    expect(resolveTargetRatio("21:9", 1200, 630)).toBeCloseTo(21 / 9);
    expect(resolveTargetRatio("original", 1200, 630)).toBeNull();
    expect(resolveTargetRatio("custom", 1200, 630)).toBeCloseTo(1200 / 630);
    expect(resolveTargetRatio("custom", 0, 500)).toBeCloseTo(1 / 500);
  });

  it("calculates target canvas dimensions preserving ratio and bounding maxDim", () => {
    const sq = calculateCanvasDimensions(1000, 500, "1:1", 100, 100, 2400);
    expect(sq).toEqual({ width: 1000, height: 1000 });

    const og = calculateCanvasDimensions(1000, 1000, "custom", 1200, 630, 2400);
    expect(og.width / og.height).toBeCloseTo(1200 / 630, 2);

    const bounded = calculateCanvasDimensions(4000, 3000, "16:9", 100, 100, 2000);
    expect(bounded.width).toBeLessThanOrEqual(2000);
    expect(bounded.height).toBeLessThanOrEqual(2000);
    expect(bounded.width / bounded.height).toBeCloseTo(16 / 9, 2);
  });
});
