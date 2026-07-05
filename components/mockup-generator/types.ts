export type FrameStyle = "none" | "macos" | "glass-light" | "glass-dark" | "outline" | "border";
export type AspectRatio = "auto" | "16:9" | "4:3" | "1:1" | "9:16";
export type ShadowType = "none" | "spread" | "hug";

export interface FramedSettings {
  frameStyle: FrameStyle;
  background: string;
  padding: number;
  rounded: number;
  shadow: number;
  shadowType: ShadowType;
  aspectRatio: AspectRatio;
  zoom: number;
  tiltX: number;
  tiltY: number;
}

export const BACKGROUNDS = [
  { name: "Transparente", value: "transparent" },
  { name: "Mesh Sunset", value: "radial-gradient(at 40% 20%, #hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)", bg: "#fca5a5" },
  { name: "Mesh Ocean", value: "radial-gradient(at 40% 20%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(289,100%,70%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(189,100%,56%,1) 0px, transparent 50%)", bg: "#67e8f9" },
  { name: "Mesh Purple", value: "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)", bg: "#4c1d95" },
  { name: "Solid Gray", value: "#f3f4f6", bg: "#f3f4f6" },
  { name: "Solid Dark", value: "#1f2937", bg: "#1f2937" },
  { name: "Gradient Sunrise", value: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", bg: "#f6d365" },
  { name: "Gradient Night", value: "linear-gradient(to right, #434343 0%, black 100%)", bg: "#434343" },
  { name: "Gradient Blue", value: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)", bg: "#4facfe" },
];
