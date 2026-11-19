export type AspectRatioType =
  | "1:1"
  | "4:5"
  | "9:16"
  | "16:9"
  | "3:2"
  | "4:3"
  | "21:9"
  | "2:3"
  | "original"
  | "custom";

export type BackdropType = "blur" | "color" | "gradient" | "image" | "transparent";

export type BackdropGradientMode = "linear" | "radial" | "conic" | "mesh";

export type FrameStyle =
  | "none"
  | "gallery"
  | "museum"
  | "polaroid"
  | "film"
  | "window"
  | "browser"
  | "glass"
  | "neon"
  | "editorial";

export type ExportImageFormat = "png" | "jpg" | "webp";

export interface AspectRatioSettings {
  ratio: AspectRatioType;
  customWidth: number;
  customHeight: number;
  scale: number; // 15 to 180 (%)
  offsetX: number; // -50 to 50 (% of canvas width)
  offsetY: number; // -50 to 50 (% of canvas height)
  offsetZ: number; // -40 to 40 (3D Z-depth push/pull)
  rotateX: number; // -35 to 35 deg (3D Pitch)
  rotateY: number; // -35 to 35 deg (3D Yaw)
  rotateZ: number; // -45 to 45 deg (Z Roll)
  borderRadius: number; // 0 to 48
  shadowIntensity: number; // 0 to 100 (%)
  backgroundType: BackdropType;
  backgroundColor: string;
  gradientMode: BackdropGradientMode;
  gradientColors: string[]; // 2 to 4 colors (2 by default)
  gradientAngle: number; // 0 to 360
  backgroundImageSrc: string | null;
  blurAmount: number; // 0 to 50
  backdropDim: number; // 0 to 60 (%)
  frameStyle: FrameStyle;
  frameColor: string;
  exportFormat: ExportImageFormat;
}

export const DEFAULT_ASPECT_RATIO_SETTINGS: AspectRatioSettings = {
  ratio: "4:5",
  customWidth: 1200,
  customHeight: 630,
  scale: 82,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  borderRadius: 16,
  shadowIntensity: 48,
  backgroundType: "blur",
  backgroundColor: "#0c0e12",
  gradientMode: "linear",
  gradientColors: ["#1e40ff", "#0c0e12"],
  gradientAngle: 135,
  backgroundImageSrc: null,
  blurAmount: 24,
  backdropDim: 18,
  frameStyle: "none",
  frameColor: "#ffffff",
  exportFormat: "png",
};
