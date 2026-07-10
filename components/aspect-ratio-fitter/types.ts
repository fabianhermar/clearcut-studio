export type AspectRatioType = "1:1" | "4:5" | "9:16" | "16:9" | "original";

export interface AspectRatioSettings {
  ratio: AspectRatioType;
  scale: number; // 10 to 100
  backgroundType: "blur" | "color" | "transparent";
  backgroundColor: string;
  blurAmount: number; // 0 to 50
}

export const DEFAULT_ASPECT_RATIO_SETTINGS: AspectRatioSettings = {
  ratio: "1:1",
  scale: 100,
  backgroundType: "blur",
  backgroundColor: "#ffffff",
  blurAmount: 20,
};
