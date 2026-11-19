import { getPaletteSync } from "colorthief";
import type { GradientStop, GradientType } from "./types";

export interface ExtractedColor {
  rgb: string;
  hex: string;
  hsl: string;
  r: number;
  g: number;
  b: number;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHslString(r: number, g: number, b: number): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Relative luminance & WCAG 2.1 contrast ratio against white / obsidian black.
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(1));
}

export function buildGradientStop(
  r: number,
  g: number,
  b: number,
  position: number,
  id: string
): GradientStop {
  const lum = relativeLuminance(r, g, b);
  return {
    id,
    r,
    g,
    b,
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHslString(r, g, b),
    position: Math.max(0, Math.min(100, Math.round(position))),
    contrastWhite: getContrastRatio(lum, 1),
    contrastBlack: getContrastRatio(lum, relativeLuminance(12, 14, 18)),
  };
}

export async function extractColors(imageSrc: string, count: number): Promise<string[]> {
  const detailed = await extractDetailedColors(imageSrc, count);
  return detailed.map((c) => c.hex);
}

export async function extractDetailedColors(
  imageSrc: string,
  count: number
): Promise<GradientStop[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  const palette = getPaletteSync(img, { colorCount: Math.max(6, count) }) || [];
  const selectedColors = palette.slice(0, count);
  const total = Math.max(1, selectedColors.length - 1);

  return selectedColors.map((color, idx) => {
    const [r, g, b] = color.array();
    const pos = selectedColors.length === 1 ? 50 : Math.round((idx / total) * 100);
    return buildGradientStop(r, g, b, pos, `stop-${idx}-${Date.now()}`);
  });
}

/**
 * Generates CSS background gradient value for linear, radial, conic, or mesh modes.
 */
export function generateGradientCSS(
  stops: Array<string | { hex: string; position?: number }>,
  type: GradientType | string,
  angle: number
): string {
  if (stops.length === 0) return "none";

  const normalized = stops.map((s, idx) => {
    if (typeof s === "string") {
      const pos =
        stops.length === 1 ? 50 : Math.round((idx / Math.max(1, stops.length - 1)) * 100);
      return { hex: s, position: pos };
    }
    return {
      hex: s.hex,
      position:
        s.position !== undefined
          ? s.position
          : Math.round((idx / Math.max(1, stops.length - 1)) * 100),
    };
  });

  if (normalized.length === 1) return normalized[0].hex;

  const stopList = normalized.map((s) => `${s.hex} ${s.position}%`).join(", ");

  if (type === "radial") {
    return `radial-gradient(circle at 50% 45%, ${stopList})`;
  }

  if (type === "conic") {
    return `conic-gradient(from ${angle}deg at 50% 50%, ${stopList}, ${normalized[0].hex} 100%)`;
  }

  if (type === "mesh") {
    const anchors = [
      "18% 22%",
      "84% 18%",
      "78% 82%",
      "20% 80%",
      "52% 48%",
      "50% 12%",
    ];
    const layers = normalized.map((s, idx) => {
      const anchor = anchors[idx % anchors.length];
      return `radial-gradient(at ${anchor}, ${s.hex} 0px, transparent 58%)`;
    });
    return `${layers.join(", ")}, ${normalized[0].hex}`;
  }

  return `linear-gradient(${angle}deg, ${stopList})`;
}

/**
 * Builds clean CSS variables (:root) + gradient rule snippet.
 */
export function buildCssVariablesCode(
  stops: GradientStop[],
  cssGradient: string
): string {
  const vars = stops
    .map((s, i) => `  --chroma-${i + 1}: ${s.hex};`)
    .join("\n");

  return `:root {\n${vars}\n  --chroma-gradient: ${cssGradient};\n}\n\n.chroma-surface {\n  background-color: ${stops[0]?.hex || "#0c0e12"};\n  background-image: var(--chroma-gradient);\n}`;
}

/**
 * Builds Tailwind CSS v4 utility & @theme snippet.
 */
export function buildTailwindSnippet(
  stops: GradientStop[],
  cssGradient: string
): string {
  const arbitrary = cssGradient.replace(/\s+/g, "_");
  const tokens = stops
    .map((s, i) => `  --color-chroma-${i + 1}: ${s.hex};`)
    .join("\n");

  return `/* Tailwind CSS v4 @theme tokens */\n@theme {\n${tokens}\n}\n\n<!-- Utility class -->\n<div class="bg-[${arbitrary}]"></div>`;
}

/**
 * Builds a scalable standalone SVG gradient asset.
 */
export function buildGradientSvg(
  stops: GradientStop[],
  type: GradientType,
  angle: number,
  width = 1600,
  height = 900
): string {
  const safeStops =
    stops.length > 0
      ? stops
      : [
          buildGradientStop(30, 64, 255, 0, "fallback-1"),
          buildGradientStop(12, 14, 18, 100, "fallback-2"),
        ];

  const stopTags = safeStops
    .map((s) => `      <stop offset="${s.position}%" stop-color="${s.hex}" />`)
    .join("\n");

  if (type === "radial") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="clearcut-grad" cx="50%" cy="45%" r="70%">
${stopTags}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#clearcut-grad)" />
</svg>`;
  }

  const rad = ((angle - 90) * Math.PI) / 180;
  const x1 = Math.round(50 - Math.cos(rad) * 50);
  const y1 = Math.round(50 - Math.sin(rad) * 50);
  const x2 = Math.round(50 + Math.cos(rad) * 50);
  const y2 = Math.round(50 + Math.sin(rad) * 50);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="clearcut-grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
${stopTags}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#clearcut-grad)" />
</svg>`;
}

/**
 * Renders the gradient to a crisp 1920x1080 PNG Blob for instant wallpaper/asset download.
 */
export function renderGradientToPng(
  stops: GradientStop[],
  type: GradientType,
  angle: number,
  width = 1920,
  height = 1080
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("No 2D context available"));

    const safeStops =
      stops.length > 0
        ? stops
        : [buildGradientStop(30, 64, 255, 0, "1"), buildGradientStop(12, 14, 18, 100, "2")];

    if (type === "mesh") {
      ctx.fillStyle = safeStops[0].hex;
      ctx.fillRect(0, 0, width, height);
      const anchors = [
        [0.18, 0.22],
        [0.84, 0.18],
        [0.78, 0.82],
        [0.2, 0.8],
        [0.52, 0.48],
        [0.5, 0.12],
      ];
      safeStops.forEach((s, idx) => {
        const [ax, ay] = anchors[idx % anchors.length];
        const cx = width * ax;
        const cy = height * ay;
        const radius = Math.max(width, height) * 0.62;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, s.hex);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });
    } else if (type === "radial") {
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        0,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.72
      );
      safeStops.forEach((s) => grad.addColorStop(s.position / 100, s.hex));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (type === "conic" && typeof ctx.createConicGradient === "function") {
      const grad = ctx.createConicGradient(((angle - 90) * Math.PI) / 180, width / 2, height / 2);
      safeStops.forEach((s) => grad.addColorStop(s.position / 100, s.hex));
      grad.addColorStop(1, safeStops[0].hex);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      const rad = ((angle - 90) * Math.PI) / 180;
      const diag = Math.sqrt(width * width + height * height) / 2;
      const cx = width / 2;
      const cy = height / 2;
      const grad = ctx.createLinearGradient(
        cx - Math.cos(rad) * diag,
        cy - Math.sin(rad) * diag,
        cx + Math.cos(rad) * diag,
        cy + Math.sin(rad) * diag
      );
      safeStops.forEach((s) => grad.addColorStop(s.position / 100, s.hex));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to render gradient PNG"));
    }, "image/png");
  });
}
