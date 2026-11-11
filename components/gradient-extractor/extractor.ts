import { getPaletteSync } from "colorthief";

export interface ExtractedColor {
  rgb: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export async function extractColors(imageSrc: string, count: number): Promise<string[]> {
  const detailed = await extractDetailedColors(imageSrc, count);
  return detailed.map((c) => c.hex);
}

export async function extractDetailedColors(
  imageSrc: string,
  count: number
): Promise<ExtractedColor[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  const palette = getPaletteSync(img, { colorCount: Math.max(5, count) }) || [];
  const selectedColors = palette.slice(0, count);

  return selectedColors.map((color) => {
    const [r, g, b] = color.array();
    return {
      r,
      g,
      b,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hex: rgbToHex(r, g, b),
    };
  });
}

export function generateGradientCSS(colors: string[], type: string, angle: number): string {
  if (colors.length === 0) return "none";
  if (colors.length === 1) return colors[0];

  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
  } else {
    return `radial-gradient(circle, ${colors.join(", ")})`;
  }
}
