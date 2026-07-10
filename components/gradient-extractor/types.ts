export type GradientType = "linear" | "radial";

export interface GradientSettings {
  type: GradientType;
  angle: number; // For linear gradients (0 to 360)
  colorCount: number; // How many colors to extract (2 to 5)
}

export const DEFAULT_GRADIENT_SETTINGS: GradientSettings = {
  type: "linear",
  angle: 90,
  colorCount: 3,
};
