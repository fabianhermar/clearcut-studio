export type ManifestDisplayMode = "standalone" | "minimal-ui" | "fullscreen" | "browser";

export interface FaviconSettings {
  padding: number; // 0 to 40%
  backgroundColor: string; // "transparent", "#ffffff", etc.
  backgroundRadius: number; // 0 to 50%
  themeColor: string; // Android/Web manifest theme color & <meta name="theme-color">
  manifestBackgroundColor: string; // Splash screen background_color in site.webmanifest
  imageScaling: "contain" | "cover"; // How the icon fits inside the padding
  path: string; // Public path prefix where favicons will be hosted, e.g. "/", "/favicon/", "/assets/icons/"
  appName: string; // Full application name (manifest `name`, SERP title)
  shortName: string; // Short home-screen label (manifest `short_name`, iOS app title)
  siteUrl: string; // Domain preview for browser bar & Google SERP
  display: ManifestDisplayMode; // PWA display mode
  startUrl: string; // PWA start_url
  includeWindowsTile: boolean; // Include mstile-150x150.png & browserconfig.xml
}

export const DEFAULT_FAVICON_SETTINGS: FaviconSettings = {
  padding: 8,
  backgroundColor: "transparent",
  backgroundRadius: 0,
  themeColor: "#1e40ff",
  manifestBackgroundColor: "#0c0e12",
  imageScaling: "contain",
  path: "/favicon/",
  appName: "ClearCut Web App",
  shortName: "ClearCut",
  siteUrl: "studio.fabianh.me",
  display: "standalone",
  startUrl: "/",
  includeWindowsTile: true,
};

export interface GeneratedFaviconBundle {
  zipBlob: Blob;
  htmlCode: string;
  manifestJson: string;
  nextjsCode: string;
  files: Array<{
    name: string;
    path: string;
    dimensions: string;
    purpose: string;
    sizeBytes: number;
  }>;
}
