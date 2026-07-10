// Types for EXIF Stripper

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

  // Software
  Software?: string;
  Artist?: string;
  Copyright?: string;

  // Other
  [key: string]: any;
}

export interface StripResult {
  /** The clean image as a data URL */
  cleanDataUrl: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Clean image size estimate in bytes */
  cleanSize: number;
  /** The original file name */
  fileName: string;
  /** Parsed EXIF data (null if no EXIF found or parse failed) */
  exifData: ExifData | null;
  /** The output format */
  outputType: string;
}
