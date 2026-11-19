import { describe, it, expect } from "vitest";
import {
  rgbToHex,
  hexToRgb,
  rgbToHslString,
  buildGradientStop,
  generateGradientCSS,
  buildCssVariablesCode,
  buildTailwindSnippet,
  buildGradientSvg,
} from "@/components/gradient-extractor/extractor";

describe("gradient-extractor engine", () => {
  it("converts RGB <-> HEX and RGB -> HSL accurately", () => {
    expect(rgbToHex(30, 64, 255)).toBe("#1E40FF");
    expect(hexToRgb("#1E40FF")).toEqual({ r: 30, g: 64, b: 255 });
    expect(hexToRgb("#FFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(rgbToHslString(255, 0, 0)).toBe("hsl(0, 100%, 50%)");
  });

  it("computes WCAG contrast ratios for dark and light stops", () => {
    const obsidian = buildGradientStop(12, 14, 18, 0, "s1");
    expect(obsidian.contrastWhite).toBeGreaterThan(15);
    expect(obsidian.contrastBlack).toBe(1);

    const white = buildGradientStop(255, 255, 255, 100, "s2");
    expect(white.contrastWhite).toBe(1);
    expect(white.contrastBlack).toBeGreaterThan(15);
  });

  it("generates linear, radial, conic, and organic mesh CSS gradients", () => {
    const stops = [
      buildGradientStop(30, 64, 255, 0, "a"),
      buildGradientStop(255, 77, 0, 100, "b"),
    ];

    expect(generateGradientCSS(stops, "linear", 135)).toBe(
      "linear-gradient(135deg, #1E40FF 0%, #FF4D00 100%)"
    );
    expect(generateGradientCSS(stops, "radial", 90)).toContain("radial-gradient(circle");
    expect(generateGradientCSS(stops, "conic", 45)).toContain("conic-gradient(from 45deg");
    expect(generateGradientCSS(stops, "mesh", 90)).toContain("radial-gradient(at 18% 22%");
  });

  it("generates CSS :root variables, Tailwind v4 tokens, and standalone SVG", () => {
    const stops = [
      buildGradientStop(30, 64, 255, 0, "a"),
      buildGradientStop(12, 14, 18, 100, "b"),
    ];
    const css = generateGradientCSS(stops, "linear", 120);

    const vars = buildCssVariablesCode(stops, css);
    expect(vars).toContain("--chroma-1: #1E40FF;");
    expect(vars).toContain("--chroma-gradient: linear-gradient(120deg");

    const tw = buildTailwindSnippet(stops, css);
    expect(tw).toContain("--color-chroma-1: #1E40FF;");
    expect(tw).toContain("bg-[linear-gradient(");

    const svg = buildGradientSvg(stops, "linear", 120);
    expect(svg).toContain("<linearGradient");
    expect(svg).toContain('stop-color="#1E40FF"');
  });
});
