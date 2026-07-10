export interface FaviconSettings {
  padding: number; // 0 to 40%
  backgroundColor: string; // "transparent", "#ffffff", etc.
  backgroundRadius: number; // 0 to 50%
  themeColor: string; // Android/Web manifest theme color
  imageScaling: "contain" | "cover"; // How the icon fits inside the padding
  path: string; // Path where favicons will be hosted, e.g. "/" or "/assets/"
  appName: string; // The name of the app
}

export const DEFAULT_FAVICON_SETTINGS: FaviconSettings = {
  padding: 0,
  backgroundColor: "transparent",
  backgroundRadius: 0,
  themeColor: "#ffffff",
  imageScaling: "contain",
  path: "/",
  appName: "My Awesome App",
};
