import type { ToolId } from "@/lib/constants";

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Convert mouse event coordinates to canvas pixel coordinates */
export function getCanvasCoords(
  canvas: HTMLCanvasElement,
  e: React.MouseEvent
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

/** Apply brush tool (recover or erase) at a given position */
export function applyBrush(
  currentImageData: ImageData,
  originalImageData: ImageData,
  tool: ToolId,
  x: number,
  y: number,
  brushSize: number,
  canvasWidth: number,
  canvasHeight: number
): ImageData {
  const newImageData = new ImageData(
    new Uint8ClampedArray(currentImageData.data),
    currentImageData.width,
    currentImageData.height
  );
  const radius = brushSize / 2;

  for (
    let py = Math.max(0, Math.floor(y - radius));
    py < Math.min(canvasHeight, Math.ceil(y + radius));
    py++
  ) {
    for (
      let px = Math.max(0, Math.floor(x - radius));
      px < Math.min(canvasWidth, Math.ceil(x + radius));
      px++
    ) {
      const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
      if (dist > radius) continue;

      const strength = 1 - dist / radius;
      const idx = (py * canvasWidth + px) * 4;

      if (tool === "recover") {
        const origR = originalImageData.data[idx];
        const origG = originalImageData.data[idx + 1];
        const origB = originalImageData.data[idx + 2];
        const origA = originalImageData.data[idx + 3];

        newImageData.data[idx] = lerp(newImageData.data[idx], origR, strength);
        newImageData.data[idx + 1] = lerp(newImageData.data[idx + 1], origG, strength);
        newImageData.data[idx + 2] = lerp(newImageData.data[idx + 2], origB, strength);
        newImageData.data[idx + 3] = lerp(newImageData.data[idx + 3], origA, strength);
      } else if (tool === "erase") {
        newImageData.data[idx + 3] = lerp(newImageData.data[idx + 3], 0, strength);
      }
    }
  }

  return newImageData;
}

/** Crop ImageData to a specific rectangle */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function cropImageData(
  sourceImageData: ImageData,
  cropRect: CropRect
): ImageData {
  const { x, y, width, height } = cropRect;
  const newData = new ImageData(width, height);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const srcIdx = ((y + py) * sourceImageData.width + (x + px)) * 4;
      const dstIdx = (py * width + px) * 4;
      newData.data[dstIdx] = sourceImageData.data[srcIdx];
      newData.data[dstIdx + 1] = sourceImageData.data[srcIdx + 1];
      newData.data[dstIdx + 2] = sourceImageData.data[srcIdx + 2];
      newData.data[dstIdx + 3] = sourceImageData.data[srcIdx + 3];
    }
  }

  return newData;
}
