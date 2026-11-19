export type ExifCategory = "gps" | "camera" | "datetime" | "software" | "other";

export type PrivacyRiskLevel = "high" | "medium" | "clean";

export type ExifOutputFormat = "original" | "jpeg" | "png" | "webp";

export interface ExifData {
  // Camera info
  Make?: string;
  Model?: string;
  LensModel?: string;

  // Exposure
  ExposureTime?: number;
  FNumber?: number;
  ISO?: number;
  ShutterSpeedValue?: number;
  ApertureValue?: number;
  FocalLength?: number;

  // GPS
  latitude?: number;
  longitude?: number;
  GPSAltitude?: number;

  // Dates
  DateTimeOriginal?: Date | string;
  CreateDate?: Date | string;
  ModifyDate?: Date | string;

  // Software & Author
  Software?: string;
  Artist?: string;
  Copyright?: string;

  // Other raw tags
  [key: string]: unknown;
}

export interface RawMetadataEntry {
  key: string;
  value: string;
  category: ExifCategory;
  risk: "high" | "medium" | "low";
}

export interface PrivacyAssessment {
  level: PrivacyRiskLevel;
  hasGps: boolean;
  hasCamera: boolean;
  hasDates: boolean;
  hasSoftwareOrAuthor: boolean;
  totalTags: number;
  highRiskCount: number;
}

export interface StripOptions {
  format: ExifOutputFormat;
  quality: number; // 70 to 100
}

export const DEFAULT_STRIP_OPTIONS: StripOptions = {
  format: "original",
  quality: 96,
};

export interface StripResult {
  cleanDataUrl: string;
  originalSize: number;
  cleanSize: number;
  width: number;
  height: number;
  fileName: string;
  exifData: ExifData | null;
  rawEntries: RawMetadataEntry[];
  assessment: PrivacyAssessment;
  verifiedClean: boolean;
  outputType: string;
}
