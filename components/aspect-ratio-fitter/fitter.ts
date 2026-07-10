import { AspectRatioSettings, AspectRatioType } from "./types";

const RATIOS: Record<AspectRatioType, number | null> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "9:16": 9 / 16,
  "16:9": 16 / 9,
  "original": null,
};

export async function processFittedImage(
  imageSrc: string,
  settings: AspectRatioSettings
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");

  // Determine target dimensions
  let targetWidth = img.width;
  let targetHeight = img.height;

  const targetRatio = RATIOS[settings.ratio];

  if (targetRatio !== null) {
    const imgRatio = img.width / img.height;
    if (imgRatio > targetRatio) {
      // Image is wider than target ratio
      targetWidth = img.width;
      targetHeight = img.width / targetRatio;
    } else {
      // Image is taller than target ratio
      targetHeight = img.height;
      targetWidth = img.height * targetRatio;
    }
  }

  // To avoid massive canvases, limit max dimension to 2560
  const MAX_DIM = 2560;
  if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
    const scale = Math.min(MAX_DIM / targetWidth, MAX_DIM / targetHeight);
    targetWidth *= scale;
    targetHeight *= scale;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Background
  if (settings.backgroundType === "color") {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (settings.backgroundType === "blur") {
    // Draw scaled-up image for blur background
    ctx.filter = `blur(${settings.blurAmount}px)`;
    // Scale image to cover the canvas
    const imgRatio = img.width / img.height;
    const canvasRatio = targetWidth / targetHeight;
    let bgWidth = targetWidth;
    let bgHeight = targetHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      bgHeight = targetWidth / imgRatio;
      offsetY = (targetHeight - bgHeight) / 2;
    } else {
      bgWidth = targetHeight * imgRatio;
      offsetX = (targetWidth - bgWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, bgWidth, bgHeight);
    
    // Dim the background slightly for better contrast
    ctx.filter = "none";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    // transparent
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  // Draw Foreground Image
  ctx.filter = "none";
  // The scale is 10 to 100, so we convert it to 0.1 to 1.0
  const scaleMultiplier = settings.scale / 100;

  // Calculate the maximum dimensions the image can take without cropping inside the target
  const fitRatio = Math.min(targetWidth / img.width, targetHeight / img.height);
  const fgWidth = img.width * fitRatio * scaleMultiplier;
  const fgHeight = img.height * fitRatio * scaleMultiplier;

  const fgX = (targetWidth - fgWidth) / 2;
  const fgY = (targetHeight - fgHeight) / 2;

  ctx.drawImage(img, fgX, fgY, fgWidth, fgHeight);

  // If transparent, export as PNG. If not, JPEG is smaller.
  const format = settings.backgroundType === "transparent" ? "image/png" : "image/jpeg";
  const quality = 0.9;
  
  return canvas.toDataURL(format, quality);
}
