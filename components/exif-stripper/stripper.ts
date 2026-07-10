// @ts-nocheck
import exifr from "exifr";
import { ExifData, StripResult } from "./types";

/**
 * Strips EXIF/metadata from an image file using the browser Canvas API.
 * Canvas re-renders only pixel data, discarding all metadata automatically.
 */
export async function stripExif(file: File): Promise<StripResult> {
  // 1. Try to read EXIF data before stripping
  let exifData: ExifData | null = null;
  try {
    const parsed = await exifr.parse(file, {
      gps: true,
      icc: false,
      iptc: true,
      xmp: false,
      tiff: true,
      jfif: false,
      ihdr: false,
    });
    if (parsed && Object.keys(parsed).length > 0) {
      exifData = parsed as ExifData;
    }
  } catch {
    // File may not be parseable (e.g. PNG, WebP without EXIF) — that's fine
    exifData = null;
  }

  // 2. Load image into an HTMLImageElement
  const objectUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = objectUrl;
  });
  URL.revokeObjectURL(objectUrl);

  // 3. Draw on Canvas — this drops all metadata
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(img, 0, 0);

  // 4. Determine output format
  let outputMime = "image/jpeg";
  let quality = 0.97;
  if (file.type === "image/png") {
    outputMime = "image/png";
    quality = 1;
  } else if (file.type === "image/webp") {
    outputMime = "image/webp";
    quality = 0.97;
  }

  // 5. Export clean data URL
  const cleanDataUrl = canvas.toDataURL(outputMime, quality);

  // 6. Estimate clean size (base64 → bytes approximation)
  const base64Data = cleanDataUrl.split(",")[1] || "";
  const cleanSize = Math.round((base64Data.length * 3) / 4);

  return {
    cleanDataUrl,
    originalSize: file.size,
    cleanSize,
    fileName: file.name,
    exifData,
    outputType: outputMime,
  };
}

/** Format bytes into a human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Returns a clean output filename */
export function getCleanFileName(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const base = dot > -1 ? originalName.slice(0, dot) : originalName;
  const ext = dot > -1 ? originalName.slice(dot) : "";
  return `${base}-clean${ext}`;
}
