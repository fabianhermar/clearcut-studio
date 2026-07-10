import JSZip from "jszip";
import { FaviconSettings } from "./types";

export interface FaviconAsset {
  name: string;
  blob: Blob;
  size: number;
}

/**
 * Renders the image onto a canvas with the given settings.
 */
function renderToCanvas(
  img: HTMLImageElement,
  size: number,
  settings: FaviconSettings
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("No 2d context"));

    // 1. Draw Background
    if (settings.backgroundColor !== "transparent") {
      ctx.fillStyle = settings.backgroundColor;
      if (settings.backgroundRadius > 0) {
        const radius = (size * settings.backgroundRadius) / 100;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.clip(); // Clip future drawing to this rounded rect
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    // 2. Draw Image with Padding
    // Padding is a percentage of the total size
    const paddingPx = (size * settings.padding) / 100;
    const drawAreaSize = size - paddingPx * 2;

    let drawWidth = drawAreaSize;
    let drawHeight = drawAreaSize;
    let drawX = paddingPx;
    let drawY = paddingPx;

    const imgAspect = img.width / img.height;

    if (settings.imageScaling === "contain") {
      if (imgAspect > 1) {
        drawHeight = drawWidth / imgAspect;
        drawY += (drawAreaSize - drawHeight) / 2;
      } else {
        drawWidth = drawHeight * imgAspect;
        drawX += (drawAreaSize - drawWidth) / 2;
      }
    } else {
      // cover
      if (imgAspect > 1) {
        drawWidth = drawHeight * imgAspect;
        drawX += (drawAreaSize - drawWidth) / 2;
      } else {
        drawHeight = drawWidth / imgAspect;
        drawY += (drawAreaSize - drawHeight) / 2;
      }
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Blob generation failed"));
    }, "image/png");
  });
}

/**
 * Generates all favicon assets and zips them.
 */
export async function generateFavicons(
  imageSrc: string,
  darkImageSrc: string | null,
  settings: FaviconSettings
): Promise<{ zipBlob: Blob; htmlCode: string }> {
  // Load main image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  // Load dark image (if provided)
  let darkImg: HTMLImageElement | null = null;
  if (darkImageSrc) {
    darkImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = darkImageSrc;
    });
  }

  const zip = new JSZip();

  // Standard web favicons (transparent background usually preferred, but we use user settings)
  const sizes = [16, 32];
  for (const size of sizes) {
    const blob = await renderToCanvas(img, size, settings);
    zip.file(`favicon-${size}x${size}.png`, blob);
    if (darkImg) {
      const darkBlob = await renderToCanvas(darkImg, size, settings);
      zip.file(`favicon-dark-${size}x${size}.png`, darkBlob);
    }
  }

  // Generate favicon.ico (We'll just rename a 32x32 PNG to .ico for simplicity, modern browsers accept this)
  const icoBlob = await renderToCanvas(img, 32, settings);
  zip.file("favicon.ico", icoBlob);

  // Apple Touch Icon (180x180, iOS prefers solid background, no transparency)
  const iosSettings = { ...settings };
  if (iosSettings.backgroundColor === "transparent") {
    iosSettings.backgroundColor = "#ffffff"; // Default to white if transparent
  }
  iosSettings.backgroundRadius = 0; // iOS applies its own mask
  const appleBlob = await renderToCanvas(img, 180, iosSettings);
  zip.file("apple-touch-icon.png", appleBlob);

  // Android Chrome icons
  const androidSizes = [192, 512];
  for (const size of androidSizes) {
    const blob = await renderToCanvas(img, size, settings);
    zip.file(`android-chrome-${size}x${size}.png`, blob);
    if (darkImg) {
      const darkBlob = await renderToCanvas(darkImg, size, settings);
      zip.file(`android-chrome-dark-${size}x${size}.png`, darkBlob);
    }
  }

  // Ensure path ends with / and doesn't have duplicate slashes
  const basePath = settings.path.trim() ? (settings.path.endsWith("/") ? settings.path : `${settings.path}/`) : "/";
  // If user typed just "/", ensure we don't end up with "//"
  const getUrl = (filename: string) => {
    if (basePath === "/") return `/${filename}`;
    return `${basePath}${filename}`.replace(/(?<!https?:)\/\//g, "/");
  };

  // Web Manifest
  const manifest = {
    name: settings.appName,
    short_name: settings.appName,
    icons: [
      {
        src: getUrl("android-chrome-192x192.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: getUrl("android-chrome-512x512.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: settings.themeColor,
    background_color: settings.backgroundColor === "transparent" ? "#ffffff" : settings.backgroundColor,
    display: "standalone",
  };
  zip.file("site.webmanifest", JSON.stringify(manifest, null, 2));

  // HTML Code Snippet
  let htmlCode = `<!-- Copy and paste these tags into the <head> of your HTML -->
<link rel="apple-touch-icon" sizes="180x180" href="${getUrl("apple-touch-icon.png")}">`;

  if (darkImg) {
    htmlCode += `
<link rel="icon" type="image/png" sizes="32x32" href="${getUrl("favicon-32x32.png")}" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/png" sizes="16x16" href="${getUrl("favicon-16x16.png")}" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/png" sizes="32x32" href="${getUrl("favicon-dark-32x32.png")}" media="(prefers-color-scheme: dark)">
<link rel="icon" type="image/png" sizes="16x16" href="${getUrl("favicon-dark-16x16.png")}" media="(prefers-color-scheme: dark)">`;
  } else {
    htmlCode += `
<link rel="icon" type="image/png" sizes="32x32" href="${getUrl("favicon-32x32.png")}">
<link rel="icon" type="image/png" sizes="16x16" href="${getUrl("favicon-16x16.png")}">`;
  }

  htmlCode += `
<link rel="manifest" href="${getUrl("site.webmanifest")}">
<link rel="shortcut icon" href="${getUrl("favicon.ico")}">
<meta name="theme-color" content="${settings.themeColor}">`;

  const zipBlob = await zip.generateAsync({ type: "blob" });

  return { zipBlob, htmlCode };
}
