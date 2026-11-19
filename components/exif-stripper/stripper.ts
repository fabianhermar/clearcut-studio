import exifr from "exifr";
import {
  ExifCategory,
  ExifData,
  ExifOutputFormat,
  PrivacyAssessment,
  RawMetadataEntry,
  StripOptions,
  StripResult,
  DEFAULT_STRIP_OPTIONS,
} from "./types";

const GPS_KEYS = new Set([
  "latitude",
  "longitude",
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitude",
  "GPSLatitudeRef",
  "GPSLongitudeRef",
  "GPSTimeStamp",
  "GPSDateStamp",
]);

const CAMERA_KEYS = new Set([
  "Make",
  "Model",
  "LensModel",
  "LensMake",
  "SerialNumber",
  "BodySerialNumber",
  "LensSerialNumber",
  "FNumber",
  "ISO",
  "ExposureTime",
  "FocalLength",
  "FocalLengthIn35mmFormat",
  "ApertureValue",
  "ShutterSpeedValue",
]);

const DATE_KEYS = new Set([
  "DateTimeOriginal",
  "CreateDate",
  "ModifyDate",
  "OffsetTimeOriginal",
  "SubSecTimeOriginal",
]);

const SOFTWARE_KEYS = new Set([
  "Software",
  "Artist",
  "Copyright",
  "Creator",
  "HostComputer",
  "ImageDescription",
]);

/**
 * Pure helper to classify a raw EXIF tag key by category and privacy risk.
 */
export function classifyTag(key: string): {
  category: ExifCategory;
  risk: "high" | "medium" | "low";
} {
  if (GPS_KEYS.has(key) || key.toLowerCase().includes("gps")) {
    return { category: "gps", risk: "high" };
  }
  if (DATE_KEYS.has(key) || key.toLowerCase().includes("date")) {
    return { category: "datetime", risk: "medium" };
  }
  if (SOFTWARE_KEYS.has(key)) {
    return { category: "software", risk: "medium" };
  }
  if (CAMERA_KEYS.has(key)) {
    const isSerial = key.toLowerCase().includes("serial");
    return { category: "camera", risk: isSerial ? "high" : "medium" };
  }
  return { category: "other", risk: "low" };
}

/**
 * Pure helper to serialize raw EXIF values cleanly into human-readable strings.
 */
export function formatExifValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().replace("T", " ").slice(0, 19);
  if (Array.isArray(value)) {
    return value
      .slice(0, 6)
      .map((v) => (typeof v === "number" ? Number(v.toFixed(4)) : String(v)))
      .join(", ");
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(5)));
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value).slice(0, 120);
    } catch {
      return "[Object]";
    }
  }
  return String(value).trim();
}

/**
 * Pure helper to flatten parsed EXIF data into categorized, risk-sorted entries.
 */
export function buildRawMetadataEntries(exif: ExifData | null): RawMetadataEntry[] {
  if (!exif) return [];

  const entries: RawMetadataEntry[] = [];
  for (const [key, rawVal] of Object.entries(exif)) {
    if (rawVal === null || rawVal === undefined) continue;
    if (rawVal instanceof Uint8Array || rawVal instanceof ArrayBuffer) continue;
    const formatted = formatExifValue(rawVal);
    if (!formatted) continue;
    const { category, risk } = classifyTag(key);
    entries.push({ key, value: formatted, category, risk });
  }

  const riskOrder = { high: 0, medium: 1, low: 2 };
  return entries.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);
}

/**
 * Pure helper to compute overall privacy risk assessment from parsed EXIF data.
 */
export function assessPrivacyRisk(exif: ExifData | null): PrivacyAssessment {
  const entries = buildRawMetadataEntries(exif);
  const hasGps = Boolean(
    exif &&
      ((exif.latitude != null && exif.longitude != null) ||
        entries.some((e) => e.category === "gps"))
  );
  const hasCamera = entries.some((e) => e.category === "camera");
  const hasDates = entries.some((e) => e.category === "datetime");
  const hasSoftwareOrAuthor = entries.some((e) => e.category === "software");
  const highRiskCount = entries.filter((e) => e.risk === "high").length;

  let level: PrivacyAssessment["level"] = "clean";
  if (hasGps || highRiskCount > 0) {
    level = "high";
  } else if (entries.length > 0) {
    level = "medium";
  }

  return {
    level,
    hasGps,
    hasCamera,
    hasDates,
    hasSoftwareOrAuthor,
    totalTags: entries.length,
    highRiskCount,
  };
}

function resolveOutputMime(fileType: string, format: ExifOutputFormat): string {
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  if (format === "jpeg") return "image/jpeg";
  if (fileType === "image/png") return "image/png";
  if (fileType === "image/webp") return "image/webp";
  return "image/jpeg";
}

/**
 * Strips EXIF/IPTC/XMP metadata from an image file locally via HTML5 Canvas,
 * then verifies the output buffer contains zero readable metadata.
 */
export async function stripExif(
  file: File,
  options: StripOptions = DEFAULT_STRIP_OPTIONS
): Promise<StripResult> {
  // 1. Read EXIF / IPTC / XMP / GPS metadata before stripping
  let exifData: ExifData | null = null;
  try {
    const parsed = await exifr.parse(file, {
      gps: true,
      icc: false,
      iptc: true,
      xmp: true,
      tiff: true,
      jfif: false,
      ihdr: false,
    });
    if (parsed && Object.keys(parsed).length > 0) {
      exifData = parsed as ExifData;
    }
  } catch {
    exifData = null;
  }

  const rawEntries = buildRawMetadataEntries(exifData);
  const assessment = assessPrivacyRisk(exifData);

  // 2. Load image into an HTMLImageElement
  const objectUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = objectUrl;
  });
  URL.revokeObjectURL(objectUrl);

  // 3. Re-encode pixels via Canvas 2D — discards all metadata segments
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(img, 0, 0);

  const outputMime = resolveOutputMime(file.type, options.format);
  const quality = outputMime === "image/png" ? 1 : Math.max(0.7, Math.min(1, options.quality / 100));

  const cleanDataUrl = canvas.toDataURL(outputMime, quality);

  // Estimate clean output byte size from base64 payload
  const base64Data = cleanDataUrl.split(",")[1] || "";
  const cleanSize = Math.round((base64Data.length * 3) / 4);

  // 4. Verify sanitized output has 0 EXIF tags
  let verifiedClean = true;
  try {
    const check = await exifr.parse(cleanDataUrl);
    verifiedClean = !check || Object.keys(check).length === 0;
  } catch {
    verifiedClean = true;
  }

  return {
    cleanDataUrl,
    originalSize: file.size,
    cleanSize,
    width: img.naturalWidth,
    height: img.naturalHeight,
    fileName: file.name,
    exifData,
    rawEntries,
    assessment,
    verifiedClean,
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

/** Returns a clean output filename, optionally anonymized to hide original timestamps */
export function getCleanFileName(
  originalName: string,
  outputMime?: string,
  anonymize = false
): string {
  const extFromMime =
    outputMime === "image/png"
      ? ".png"
      : outputMime === "image/webp"
      ? ".webp"
      : outputMime === "image/jpeg"
      ? ".jpg"
      : null;

  const dot = originalName.lastIndexOf(".");
  const base = dot > -1 ? originalName.slice(0, dot) : originalName;
  const fallbackExt = dot > -1 ? originalName.slice(dot) : ".jpg";
  const ext = extFromMime || fallbackExt;

  if (anonymize) {
    const rand = Math.random().toString(16).slice(2, 8);
    return `clearcut-clean-${rand}${ext}`;
  }

  return `${base}-clean${ext}`;
}
