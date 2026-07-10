import JSZip from "jszip";
import { WatermarkSettings, Position } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getOutputMime(file: File): string {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

function calcPosition(
  position: Position,
  canvasW: number,
  canvasH: number,
  wmW: number,
  wmH: number,
  margin: number
): { x: number; y: number } {
  const positions: Record<Position, { x: number; y: number }> = {
    "top-left":       { x: margin,                   y: margin },
    "top-center":     { x: (canvasW - wmW) / 2,      y: margin },
    "top-right":      { x: canvasW - wmW - margin,   y: margin },
    "middle-left":    { x: margin,                   y: (canvasH - wmH) / 2 },
    "center":         { x: (canvasW - wmW) / 2,      y: (canvasH - wmH) / 2 },
    "middle-right":   { x: canvasW - wmW - margin,   y: (canvasH - wmH) / 2 },
    "bottom-left":    { x: margin,                   y: canvasH - wmH - margin },
    "bottom-center":  { x: (canvasW - wmW) / 2,      y: canvasH - wmH - margin },
    "bottom-right":   { x: canvasW - wmW - margin,   y: canvasH - wmH - margin },
  };
  return positions[position];
}

// ─── Core painting — works for both full-res and preview canvas ────────────────

export async function paintWatermark(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  settings: WatermarkSettings
): Promise<void> {
  ctx.save();
  ctx.globalAlpha = settings.opacity;

  if (settings.type === "text") {
    const fontSize = Math.round((canvasW * settings.sizePercent) / 100);
    ctx.font = `bold ${fontSize}px ${settings.fontFamily}`;
    ctx.fillStyle = settings.color;
    // Add text shadow for readability on any background
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = Math.round(fontSize * 0.2);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(fontSize * 0.05);
    ctx.textBaseline = "top";

    const metrics = ctx.measureText(settings.text);
    const wmW = metrics.width;
    const wmH = fontSize * 1.2;
    const { x, y } = calcPosition(
      settings.position,
      canvasW,
      canvasH,
      wmW,
      wmH,
      settings.marginPx
    );
    ctx.fillText(settings.text, x, y);
  } else if (settings.type === "logo" && settings.logoSrc) {
    const logo = await loadImage(settings.logoSrc);
    const wmW = Math.round((canvasW * settings.sizePercent) / 100);
    const wmH = Math.round((wmW / logo.naturalWidth) * logo.naturalHeight);
    const { x, y } = calcPosition(
      settings.position,
      canvasW,
      canvasH,
      wmW,
      wmH,
      settings.marginPx
    );
    ctx.drawImage(logo, x, y, wmW, wmH);
  }

  ctx.restore();
}

// ─── Apply watermark to a single File → Blob ──────────────────────────────────

export async function applyWatermark(
  file: File,
  settings: WatermarkSettings
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    await paintWatermark(ctx, canvas.width, canvas.height, settings);

    const mime = getOutputMime(file);
    const quality = mime === "image/png" ? undefined : 0.95;

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        mime,
        quality
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ─── Batch: process N files → ZIP Blob ────────────────────────────────────────

export async function processAndZip(
  files: File[],
  settings: WatermarkSettings,
  onProgress: (current: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const blob = await applyWatermark(file, settings);
    const ext = file.name.split(".").pop() ?? "jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    zip.file(`${baseName}-watermarked.${ext}`, blob);
    onProgress(i + 1);
  }

  return await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 1 } });
}

// ─── Build a scaled-down preview DataURL for the canvas ───────────────────────

export async function buildPreviewDataUrl(file: File, maxWidth = 800): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
