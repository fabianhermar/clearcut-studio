// Types for Batch Watermarker

export type WatermarkType = "text" | "logo";

export type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type FontFamily =
  | "Urbanist Variable, sans-serif"
  | "Albert Sans Variable, sans-serif"
  | "monospace"
  | "serif";

export interface WatermarkSettings {
  type: WatermarkType;
  // Text watermark
  text: string;
  fontFamily: FontFamily;
  color: string;
  // Logo watermark
  logoSrc: string | null;
  // Shared
  opacity: number;       // 0.1 – 1.0
  sizePercent: number;   // 5 – 40, relative to image width
  marginPx: number;      // distance from edge in pixels
  position: Position;
}

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  type: "text",
  text: "© Mi Marca",
  fontFamily: "Urbanist Variable, sans-serif",
  color: "#ffffff",
  logoSrc: null,
  opacity: 0.7,
  sizePercent: 8,
  marginPx: 24,
  position: "bottom-right",
};

export interface BatchProgress {
  current: number;
  total: number;
  done: boolean;
  zipUrl: string | null;
}
