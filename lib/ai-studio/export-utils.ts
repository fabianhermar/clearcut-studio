import JSZip from "jszip";
import type {
  GeneratedAsset,
  ImageEditAdjustments,
  ResizeConfig,
} from "./types";

export const DEFAULT_IMAGE_ADJUSTMENTS: ImageEditAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  vignette: 0,
  grayscale: 0,
  sepia: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  cropRatio: "original",
};

export const DEFAULT_RESIZE_CONFIG: ResizeConfig = {
  mode: "dimensions",
  width: 1080,
  height: 1080,
  percentage: 100,
  lockAspect: true,
  fit: "contain",
  backgroundColor: "#f4f3ef",
  format: "png",
  quality: 92,
};

export function getExtensionForMime(mime: string): string {
  const clean = mime.toLowerCase().split(";")[0].trim();
  if (clean === "image/png") return "png";
  if (clean === "image/jpeg" || clean === "image/jpg") return "jpg";
  if (clean === "image/webp") return "webp";
  if (clean === "image/avif") return "avif";
  if (clean === "video/mp4") return "mp4";
  if (clean === "video/webm") return "webm";
  if (clean === "audio/mpeg" || clean === "audio/mp3") return "mp3";
  if (clean === "audio/wav" || clean === "audio/x-wav" || clean === "audio/pcm") return "wav";
  if (clean === "audio/ogg") return "ogg";
  return "bin";
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read blob as data URL"));
    };
    reader.onerror = () => reject(reader.error || new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "clearcut-asset"
  );
}

export async function downloadSingleAsset(asset: GeneratedAsset): Promise<void> {
  const blob = await dataUrlToBlob(asset.dataUrl);
  const ext = getExtensionForMime(asset.mimeType || blob.type);
  const base = sanitizeFilename(asset.name.replace(/\.[^.]+$/, ""));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${base}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadAssetsAsZip(
  assets: GeneratedAsset[],
  zipBaseName: string = "clearcut-ai-batch"
): Promise<{ fileCount: number; totalBytes: number }> {
  const zip = new JSZip();
  let totalBytes = 0;

  const manifest: Array<Record<string, unknown>> = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const blob = await dataUrlToBlob(asset.dataUrl);
    totalBytes += blob.size;
    const ext = getExtensionForMime(asset.mimeType || blob.type);
    const folder =
      asset.kind === "video" ? "videos" : asset.kind === "audio" ? "audio" : "images";
    const indexPrefix = String(i + 1).padStart(2, "0");
    const safeName = sanitizeFilename(asset.name.replace(/\.[^.]+$/, ""));
    const filename = `${folder}/${indexPrefix}-${safeName}.${ext}`;

    zip.file(filename, blob);
    manifest.push({
      file: filename,
      kind: asset.kind,
      provider: asset.provider,
      model: asset.model,
      prompt: asset.prompt,
      width: asset.width,
      height: asset.height,
      durationSec: asset.durationSec,
      createdAt: new Date(asset.createdAt).toISOString(),
    });
  }

  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        generator: "ClearCut AI Streaming Studio",
        exportedAt: new Date().toISOString(),
        count: assets.length,
        items: manifest,
      },
      null,
      2
    )
  );

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(zipBaseName)}-${assets.length}files.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  return { fileCount: assets.length, totalBytes };
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image into canvas"));
    img.src = src;
  });
}

export async function resizeImageDataUrl(
  dataUrl: string,
  config: ResizeConfig
): Promise<{ dataUrl: string; width: number; height: number; mimeType: string; sizeBytes: number }> {
  const img = await loadImageElement(dataUrl);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  let targetW = config.width;
  let targetH = config.height;

  if (config.mode === "percentage") {
    const factor = Math.max(0.05, Math.min(4, config.percentage / 100));
    targetW = Math.max(16, Math.round(srcW * factor));
    targetH = Math.max(16, Math.round(srcH * factor));
  } else if (config.lockAspect && config.fit === "contain") {
    const ratio = srcW / srcH;
    if (targetW / targetH > ratio) {
      targetW = Math.max(16, Math.round(targetH * ratio));
    } else {
      targetH = Math.max(16, Math.round(targetW / ratio));
    }
  }

  targetW = Math.max(16, Math.min(8192, Math.round(targetW)));
  targetH = Math.max(16, Math.min(8192, Math.round(targetH)));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (config.fit === "pad" || config.format === "jpeg") {
    ctx.fillStyle = config.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  }

  if (config.fit === "stretch") {
    ctx.drawImage(img, 0, 0, targetW, targetH);
  } else if (config.fit === "cover") {
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (targetW - drawW) / 2;
    const dy = (targetH - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
  } else {
    // contain or pad
    const scale = Math.min(targetW / srcW, targetH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (targetW - drawW) / 2;
    const dy = (targetH - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }

  const mimeType =
    config.format === "jpeg"
      ? "image/jpeg"
      : config.format === "webp"
      ? "image/webp"
      : "image/png";
  const quality = config.format === "png" ? undefined : Math.max(0.1, Math.min(1, config.quality / 100));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      mimeType,
      quality
    );
  });

  const outDataUrl = await blobToDataUrl(blob);
  return {
    dataUrl: outDataUrl,
    width: targetW,
    height: targetH,
    mimeType,
    sizeBytes: blob.size,
  };
}

export function buildCssFilterFromAdjustments(adj: ImageEditAdjustments): string {
  const parts: string[] = [
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`,
  ];
  if (adj.blur > 0) parts.push(`blur(${adj.blur}px)`);
  if (adj.grayscale > 0) parts.push(`grayscale(${adj.grayscale}%)`);
  if (adj.sepia > 0) parts.push(`sepia(${adj.sepia}%)`);
  if (adj.warmth !== 0) {
    parts.push(`hue-rotate(${Math.round(adj.warmth * 0.45)}deg)`);
  }
  return parts.join(" ");
}

function parseCropRatio(ratio: ImageEditAdjustments["cropRatio"]): number | null {
  switch (ratio) {
    case "1:1":
      return 1;
    case "4:5":
      return 4 / 5;
    case "16:9":
      return 16 / 9;
    case "9:16":
      return 9 / 16;
    case "3:2":
      return 3 / 2;
    default:
      return null;
  }
}

export async function applyOpticalEditsToDataUrl(
  dataUrl: string,
  adj: ImageEditAdjustments,
  outputFormat: "png" | "webp" | "jpeg" = "png"
): Promise<{ dataUrl: string; width: number; height: number; mimeType: string; sizeBytes: number }> {
  const img = await loadImageElement(dataUrl);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const swapDims = adj.rotation === 90 || adj.rotation === 270;
  const rotW = swapDims ? srcH : srcW;
  const rotH = swapDims ? srcW : srcH;

  // Step 1: Rotate + Flip + Filters onto intermediate canvas
  const step1 = document.createElement("canvas");
  step1.width = rotW;
  step1.height = rotH;
  const ctx1 = step1.getContext("2d");
  if (!ctx1) throw new Error("Canvas 2D unavailable");

  ctx1.filter = buildCssFilterFromAdjustments(adj);
  ctx1.save();
  ctx1.translate(rotW / 2, rotH / 2);
  ctx1.rotate((adj.rotation * Math.PI) / 180);
  ctx1.scale(adj.flipH ? -1 : 1, adj.flipV ? -1 : 1);
  ctx1.drawImage(img, -srcW / 2, -srcH / 2, srcW, srcH);
  ctx1.restore();

  // Warmth tint overlay
  if (adj.warmth !== 0) {
    ctx1.save();
    ctx1.globalCompositeOperation = "soft-light";
    ctx1.fillStyle =
      adj.warmth > 0
        ? `rgba(255, 165, 64, ${Math.min(0.45, Math.abs(adj.warmth) / 110)})`
        : `rgba(56, 132, 255, ${Math.min(0.45, Math.abs(adj.warmth) / 110)})`;
    ctx1.fillRect(0, 0, rotW, rotH);
    ctx1.restore();
  }

  // Step 2: Aspect crop if selected
  const targetRatio = parseCropRatio(adj.cropRatio);
  let cropX = 0;
  let cropY = 0;
  let cropW = rotW;
  let cropH = rotH;

  if (targetRatio) {
    const currentRatio = rotW / rotH;
    if (currentRatio > targetRatio) {
      cropW = Math.round(rotH * targetRatio);
      cropX = Math.round((rotW - cropW) / 2);
    } else {
      cropH = Math.round(rotW / targetRatio);
      cropY = Math.round((rotH - cropH) / 2);
    }
  }

  const outCanvas = document.createElement("canvas");
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const ctx2 = outCanvas.getContext("2d");
  if (!ctx2) throw new Error("Canvas 2D unavailable");

  ctx2.drawImage(step1, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  // Vignette overlay
  if (adj.vignette > 0) {
    const rad = Math.max(cropW, cropH) * 0.72;
    const grad = ctx2.createRadialGradient(
      cropW / 2,
      cropH / 2,
      rad * 0.25,
      cropW / 2,
      cropH / 2,
      rad
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, `rgba(12,14,18,${Math.min(0.85, adj.vignette / 100)})`);
    ctx2.fillStyle = grad;
    ctx2.fillRect(0, 0, cropW, cropH);
  }

  const mimeType =
    outputFormat === "jpeg"
      ? "image/jpeg"
      : outputFormat === "webp"
      ? "image/webp"
      : "image/png";

  const blob = await new Promise<Blob>((resolve, reject) => {
    outCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      mimeType,
      outputFormat === "png" ? undefined : 0.92
    );
  });

  return {
    dataUrl: await blobToDataUrl(blob),
    width: cropW,
    height: cropH,
    mimeType,
    sizeBytes: blob.size,
  };
}

export async function exportMoodboardContactSheet(
  assets: GeneratedAsset[],
  options: {
    title: string;
    columns: 2 | 3 | 4;
    showCaptions: boolean;
    darkTheme: boolean;
  }
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
  const images = assets.filter((a) => a.kind === "image");
  if (images.length === 0) throw new Error("No images in moodboard");

  const cols = options.columns;
  const rows = Math.ceil(images.length / cols);
  const pad = 48;
  const gap = 24;
  const headerH = 96;
  const cellW = 480;
  const cellImgH = 380;
  const captionH = options.showCaptions ? 64 : 16;
  const cellH = cellImgH + captionH;

  const canvasW = pad * 2 + cols * cellW + (cols - 1) * gap;
  const canvasH = pad * 2 + headerH + rows * cellH + (rows - 1) * gap;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  const bg = options.darkTheme ? "#0c0e12" : "#f4f3ef";
  const cardBg = options.darkTheme ? "#14171f" : "#ffffff";
  const border = options.darkTheme ? "#242936" : "#dcdad0";
  const ink = options.darkTheme ? "#f8fafc" : "#0c0e12";
  const muted = options.darkTheme ? "#94a3b8" : "#4e525e";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Header
  ctx.fillStyle = "#1e40ff";
  ctx.font = "bold 14px ui-monospace, SFMono-Regular, monospace";
  ctx.fillText("CLEARCUT STUDIO // AI CONTACT SHEET", pad, pad + 20);

  ctx.fillStyle = ink;
  ctx.font = "bold 34px system-ui, -apple-system, sans-serif";
  ctx.fillText(options.title || "AI Visual Board", pad, pad + 62);

  ctx.fillStyle = muted;
  ctx.font = "14px ui-monospace, SFMono-Regular, monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    `${images.length} FRAMES · ${new Date().toISOString().slice(0, 10)}`,
    canvasW - pad,
    pad + 60
  );
  ctx.textAlign = "left";

  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad + headerH - 12);
  ctx.lineTo(canvasW - pad, pad + headerH - 12);
  ctx.stroke();

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (cellW + gap);
    const y = pad + headerH + row * (cellH + gap);

    ctx.fillStyle = cardBg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, cellW, cellH);
    ctx.strokeRect(x, y, cellW, cellH);

    try {
      const img = await loadImageElement(item.dataUrl);
      const scale = Math.max(cellW / img.width, cellImgH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cellW, cellImgH);
      ctx.clip();
      ctx.drawImage(img, x + (cellW - dw) / 2, y + (cellImgH - dh) / 2, dw, dh);
      ctx.restore();
    } catch {
      ctx.fillStyle = muted;
      ctx.fillText("Image error", x + 16, y + 40);
    }

    // Optical frame index badge
    ctx.fillStyle = "rgba(12, 14, 18, 0.8)";
    ctx.fillRect(x + 12, y + 12, 46, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText(String(i + 1).padStart(2, "0"), x + 26, y + 28);

    if (options.showCaptions) {
      ctx.fillStyle = ink;
      ctx.font = "600 13px system-ui, -apple-system, sans-serif";
      const promptSnippet =
        item.prompt.length > 54 ? `${item.prompt.slice(0, 54)}…` : item.prompt || item.name;
      ctx.fillText(promptSnippet, x + 14, y + cellImgH + 26);

      ctx.fillStyle = muted;
      ctx.font = "11px ui-monospace, SFMono-Regular, monospace";
      ctx.fillText(
        `${item.provider.toUpperCase()} · ${item.model}`,
        x + 14,
        y + cellImgH + 46
      );
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png");
  });

  return {
    dataUrl: await blobToDataUrl(blob),
    width: canvasW,
    height: canvasH,
    sizeBytes: blob.size,
  };
}
