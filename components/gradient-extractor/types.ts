export type GradientType = "linear" | "radial" | "conic" | "mesh";

export interface GradientStop {
  id: string;
  hex: string;
  rgb: string;
  hsl: string;
  r: number;
  g: number;
  b: number;
  position: number; // 0 to 100%
  contrastWhite: number;
  contrastBlack: number;
}

export interface GradientSettings {
  type: GradientType;
  angle: number; // 0 to 360 deg (linear & conic)
  colorCount: number; // 2 to 6 extracted stops
  grain: number; // 0 to 35% optical film grain preview
}

export const DEFAULT_GRADIENT_SETTINGS: GradientSettings = {
  type: "linear",
  angle: 135,
  colorCount: 4,
  grain: 0,
};
