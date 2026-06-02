import type { Adjustments } from "@/lib/constants";

/**
 * Apply brightness, contrast, saturation, and exposure adjustments
 * to ImageData pixel by pixel. Skips fully transparent pixels.
 */
export function applyImageAdjustments(
  baseData: ImageData,
  adjustments: Adjustments
): ImageData {
  const adjustedData = new ImageData(
    new Uint8ClampedArray(baseData.data),
    baseData.width,
    baseData.height
  );
  const data = adjustedData.data;

  const brightness = adjustments.brightness / 100;
  const contrast = adjustments.contrast / 100;
  const saturation = adjustments.saturation / 100;
  const exposure = adjustments.exposure / 100;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    r *= exposure;
    g *= exposure;
    b *= exposure;

    // Brightness
    r *= brightness;
    g *= brightness;
    b *= brightness;

    // Contrast
    r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

    // Saturation
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  return adjustedData;
}
