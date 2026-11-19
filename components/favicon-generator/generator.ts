import JSZip from "jszip";
import { FaviconSettings, GeneratedFaviconBundle } from "./types";

/**
 * Normalizes a user-provided public path prefix (e.g. "", "/", "/favicon", "assets/icons").
 * Supports relative paths and http(s) CDN URLs without double slashes.
 */
export function normalizePublicPath(rawPath: string): string {
  const trimmed = rawPath.trim();
  if (!trimmed || trimmed === "/") return "/";

  const isAbsoluteUrl = /^https?:\/\//i.test(trimmed);
  const withLeading = isAbsoluteUrl
    ? trimmed
    : trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  const withTrailing = withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
  return withTrailing.replace(/(?<!https?:)\/\/+/g, "/");
}

/**
 * Joins a normalized base path and asset filename cleanly.
 */
export function resolveAssetUrl(rawPath: string, filename: string): string {
  const base = normalizePublicPath(rawPath);
  const cleanFile = filename.replace(/^\/+/, "");
  if (base === "/") return `/${cleanFile}`;
  return `${base}${cleanFile}`;
}

/**
 * Escapes HTML attribute values safely to prevent injection in generated snippets.
 */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Encodes one or more PNG byte arrays (e.g. 16x16, 32x32, 48x48) into a real
 * spec-compliant multi-resolution binary .ICO container.
 */
export function encodePngsToIco(
  entries: Array<{ size: number; pngBytes: Uint8Array }>
): Uint8Array {
  const count = entries.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirTotalSize = headerSize + count * dirEntrySize;

  let totalBytes = dirTotalSize;
  for (const entry of entries) {
    totalBytes += entry.pngBytes.byteLength;
  }

  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);
  const out = new Uint8Array(buffer);

  // ICONDIR header (6 bytes)
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Type: 1 = ICO
  view.setUint16(4, count, true); // Number of images

  let dataOffset = dirTotalSize;
  entries.forEach((entry, index) => {
    const entryOffset = headerSize + index * dirEntrySize;
    const dim = entry.size >= 256 ? 0 : entry.size;

    view.setUint8(entryOffset, dim); // Width
    view.setUint8(entryOffset + 1, dim); // Height
    view.setUint8(entryOffset + 2, 0); // Color palette
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, entry.pngBytes.byteLength, true); // Image size in bytes
    view.setUint32(entryOffset + 12, dataOffset, true); // Offset to PNG bytes

    out.set(entry.pngBytes, dataOffset);
    dataOffset += entry.pngBytes.byteLength;
  });

  return out;
}

/**
 * Builds the W3C site.webmanifest JSON object.
 */
export function buildWebManifest(settings: FaviconSettings) {
  const appName = settings.appName.trim() || "My Web App";
  const shortName = settings.shortName.trim() || appName.slice(0, 12);
  const startUrl = settings.startUrl.trim() || "/";

  return {
    name: appName,
    short_name: shortName,
    start_url: startUrl,
    display: settings.display,
    theme_color: settings.themeColor,
    background_color: settings.manifestBackgroundColor,
    icons: [
      {
        src: resolveAssetUrl(settings.path, "web-app-manifest-192x192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: resolveAssetUrl(settings.path, "web-app-manifest-512x512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: resolveAssetUrl(settings.path, "web-app-manifest-maskable-512x512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

/**
 * Builds Windows browserconfig.xml for pinned Start tiles.
 */
export function buildBrowserConfigXml(settings: FaviconSettings): string {
  const tileUrl = escapeAttr(resolveAssetUrl(settings.path, "mstile-150x150.png"));
  const tileColor = escapeAttr(settings.themeColor);
  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="${tileUrl}"/>
      <TileColor>${tileColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
}

/**
 * Builds production-ready HTML <head> metadata tags.
 */
export function buildHtmlHeadCode(
  settings: FaviconSettings,
  hasDarkIcon: boolean
): string {
  const url = (file: string) => escapeAttr(resolveAssetUrl(settings.path, file));
  const shortName = escapeAttr(settings.shortName.trim() || settings.appName.trim() || "My Web App");
  const themeColor = escapeAttr(settings.themeColor);

  const lines: string[] = [
    `<!-- ClearCut Studio — Favicon & PWA Metadata -->`,
    `<link rel="icon" href="${url("favicon.ico")}" sizes="48x48">`,
  ];

  if (hasDarkIcon) {
    lines.push(
      `<link rel="icon" type="image/png" sizes="96x96" href="${url("favicon-96x96.png")}" media="(prefers-color-scheme: light)">`,
      `<link rel="icon" type="image/png" sizes="32x32" href="${url("favicon-32x32.png")}" media="(prefers-color-scheme: light)">`,
      `<link rel="icon" type="image/png" sizes="16x16" href="${url("favicon-16x16.png")}" media="(prefers-color-scheme: light)">`,
      `<link rel="icon" type="image/png" sizes="96x96" href="${url("favicon-dark-96x96.png")}" media="(prefers-color-scheme: dark)">`,
      `<link rel="icon" type="image/png" sizes="32x32" href="${url("favicon-dark-32x32.png")}" media="(prefers-color-scheme: dark)">`,
      `<link rel="icon" type="image/png" sizes="16x16" href="${url("favicon-dark-16x16.png")}" media="(prefers-color-scheme: dark)">`
    );
  } else {
    lines.push(
      `<link rel="icon" type="image/png" sizes="96x96" href="${url("favicon-96x96.png")}">`,
      `<link rel="icon" type="image/png" sizes="32x32" href="${url("favicon-32x32.png")}">`,
      `<link rel="icon" type="image/png" sizes="16x16" href="${url("favicon-16x16.png")}">`
    );
  }

  lines.push(
    `<link rel="apple-touch-icon" sizes="180x180" href="${url("apple-touch-icon.png")}">`,
    `<meta name="apple-mobile-web-app-title" content="${shortName}">`,
    `<link rel="manifest" href="${url("site.webmanifest")}">`,
    `<meta name="theme-color" content="${themeColor}">`
  );

  if (settings.includeWindowsTile) {
    lines.push(
      `<meta name="msapplication-TileColor" content="${themeColor}">`,
      `<meta name="msapplication-config" content="${url("browserconfig.xml")}">`
    );
  }

  return lines.join("\n");
}

/**
 * Builds Next.js App Router Metadata API snippet (layout.tsx).
 */
export function buildNextjsMetadataCode(
  settings: FaviconSettings,
  hasDarkIcon: boolean
): string {
  const url = (file: string) => resolveAssetUrl(settings.path, file);
  const shortName = settings.shortName.trim() || settings.appName.trim() || "My Web App";

  const iconEntries = hasDarkIcon
    ? `      { url: "${url("favicon-32x32.png")}", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "${url("favicon-dark-32x32.png")}", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "${url("favicon-96x96.png")}", sizes: "96x96", type: "image/png" },`
    : `      { url: "${url("favicon.ico")}", sizes: "48x48" },
      { url: "${url("favicon-32x32.png")}", sizes: "32x32", type: "image/png" },
      { url: "${url("favicon-96x96.png")}", sizes: "96x96", type: "image/png" },`;

  return `// app/layout.tsx — Next.js App Router Metadata
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "${settings.themeColor}",
};

export const metadata: Metadata = {
  applicationName: "${settings.appName.trim() || "My Web App"}",
  appleWebApp: {
    capable: true,
    title: "${shortName}",
    statusBarStyle: "default",
  },
  manifest: "${url("site.webmanifest")}",
  icons: {
    icon: [
${iconEntries}
    ],
    apple: [
      { url: "${url("apple-touch-icon.png")}", sizes: "180x180", type: "image/png" },
    ],
  },
};`;
}

/**
 * Renders the image onto an offscreen canvas with the given settings.
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

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
        ctx.clip();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    // 2. Draw Image with Padding
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Generates all multi-platform favicon & PWA assets, encodes a real multi-res .ico,
 * and bundles everything into a downloadable ZIP with HTML, Manifest, and Next.js snippets.
 */
export async function generateFavicons(
  imageSrc: string,
  darkImageSrc: string | null,
  settings: FaviconSettings
): Promise<GeneratedFaviconBundle> {
  const img = await loadImage(imageSrc);
  const darkImg = darkImageSrc ? await loadImage(darkImageSrc) : null;

  const zip = new JSZip();
  const files: GeneratedFaviconBundle["files"] = [];

  const addFile = (
    name: string,
    data: Blob | Uint8Array | string,
    dimensions: string,
    purpose: string
  ) => {
    zip.file(name, data);
    const sizeBytes =
      typeof data === "string"
        ? new TextEncoder().encode(data).byteLength
        : data instanceof Uint8Array
        ? data.byteLength
        : data.size;
    files.push({
      name,
      path: resolveAssetUrl(settings.path, name),
      dimensions,
      purpose,
      sizeBytes,
    });
  };

  // 1. Standard browser PNG favicons (16, 32, 48, 96)
  const webSizes = [16, 32, 48, 96] as const;
  const icoEntries: Array<{ size: number; pngBytes: Uint8Array }> = [];

  for (const size of webSizes) {
    const blob = await renderToCanvas(img, size, settings);
    if (size !== 48) {
      addFile(
        `favicon-${size}x${size}.png`,
        blob,
        `${size}×${size}`,
        size === 96 ? "Google SERP & High-DPI" : "Browser Tab"
      );
    }
    if (size === 16 || size === 32 || size === 48) {
      const ab = await blob.arrayBuffer();
      icoEntries.push({ size, pngBytes: new Uint8Array(ab) });
    }
    if (darkImg && size !== 48) {
      const darkBlob = await renderToCanvas(darkImg, size, settings);
      addFile(
        `favicon-dark-${size}x${size}.png`,
        darkBlob,
        `${size}×${size}`,
        "Dark Mode Tab"
      );
    }
  }

  // 2. Real Multi-Resolution Binary favicon.ico (16 + 32 + 48)
  const icoBytes = encodePngsToIco(icoEntries);
  addFile("favicon.ico", icoBytes, "16·32·48", "Legacy & Multi-Res ICO");

  // 3. Apple Touch Icon (180x180 — solid background, no corner mask)
  const iosSettings: FaviconSettings = {
    ...settings,
    backgroundColor:
      settings.backgroundColor === "transparent" ? "#ffffff" : settings.backgroundColor,
    backgroundRadius: 0,
  };
  const appleBlob = await renderToCanvas(img, 180, iosSettings);
  addFile("apple-touch-icon.png", appleBlob, "180×180", "iOS / iPadOS Home Screen");

  // 4. Android & PWA Manifest Icons (192x192, 512x512, and Maskable 512x512)
  for (const size of [192, 512] as const) {
    const blob = await renderToCanvas(img, size, settings);
    addFile(
      `web-app-manifest-${size}x${size}.png`,
      blob,
      `${size}×${size}`,
      "Android / PWA Launcher"
    );
  }

  const maskableSettings: FaviconSettings = {
    ...settings,
    padding: Math.max(settings.padding, 16),
    backgroundColor:
      settings.backgroundColor === "transparent"
        ? settings.manifestBackgroundColor
        : settings.backgroundColor,
    backgroundRadius: 0,
  };
  const maskableBlob = await renderToCanvas(img, 512, maskableSettings);
  addFile(
    "web-app-manifest-maskable-512x512.png",
    maskableBlob,
    "512×512",
    "Android Adaptive Maskable"
  );

  // 5. Optional Windows Pinned Tile (150x150 + browserconfig.xml)
  if (settings.includeWindowsTile) {
    const msTileBlob = await renderToCanvas(img, 150, {
      ...settings,
      backgroundColor:
        settings.backgroundColor === "transparent"
          ? settings.themeColor
          : settings.backgroundColor,
      backgroundRadius: 0,
    });
    addFile("mstile-150x150.png", msTileBlob, "150×150", "Windows Start Tile");
    addFile(
      "browserconfig.xml",
      buildBrowserConfigXml(settings),
      "XML",
      "Windows Tile Config"
    );
  }

  // 6. site.webmanifest
  const manifestObj = buildWebManifest(settings);
  const manifestJson = JSON.stringify(manifestObj, null, 2);
  addFile("site.webmanifest", manifestJson, "JSON", "W3C Web App Manifest");

  // 7. HTML & Next.js snippets
  const htmlCode = buildHtmlHeadCode(settings, Boolean(darkImg));
  const nextjsCode = buildNextjsMetadataCode(settings, Boolean(darkImg));
  zip.file("head-tags.html", htmlCode);

  const zipBlob = await zip.generateAsync({ type: "blob" });

  return {
    zipBlob,
    htmlCode,
    manifestJson,
    nextjsCode,
    files,
  };
}
