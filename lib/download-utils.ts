import type { ExportFormat } from "@/lib/constants";

/**
 * Download the contents of a canvas as an image file, optionally compositing a matte backdrop.
 */
export async function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  filename: string = "imagen-sin-fondo",
  backgroundColor?: string | null
): Promise<void> {
  const mimeType =
    format === "jpg"
      ? "image/jpeg"
      : format === "avif"
      ? "image/avif"
      : `image/${format}`;
  const quality =
    format === "png" ? undefined : format === "avif" ? 0.9 : 0.95;

  let targetCanvas = canvas;
  const resolvedBg = backgroundColor || (format === "jpg" ? "#ffffff" : null);

  if (resolvedBg) {
    const composite = document.createElement("canvas");
    composite.width = canvas.width;
    composite.height = canvas.height;
    const ctx = composite.getContext("2d");
    if (ctx) {
      ctx.fillStyle = resolvedBg;
      ctx.fillRect(0, 0, composite.width, composite.height);
      ctx.drawImage(canvas, 0, 0);
      targetCanvas = composite;
    }
  }

  return new Promise((resolve) => {
    targetCanvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve();
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      },
      mimeType,
      quality
    );
  });
}
