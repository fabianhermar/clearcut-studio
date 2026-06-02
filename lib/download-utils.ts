import type { ExportFormat } from "@/lib/constants";

/**
 * Download the contents of a canvas as an image file.
 */
export async function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  filename: string = "imagen-sin-fondo"
): Promise<void> {
  const mimeType =
    format === "jpg"
      ? "image/jpeg"
      : format === "avif"
      ? "image/avif"
      : `image/${format}`;
  const quality =
    format === "png" ? undefined : format === "avif" ? 0.9 : 0.95;

  return new Promise((resolve) => {
    canvas.toBlob(
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
