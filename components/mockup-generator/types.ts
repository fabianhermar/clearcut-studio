export type FrameStyle =
  | "none"
  | "macos"
  | "browser"
  | "glass-light"
  | "glass-dark"
  | "outline"
  | "border"
  | "iphone-14"
  | "iphone-15-pro"
  | "iphone-se"
  | "ipad"
  | "android"
  | "android-tab"
  | "hd";

export type AspectRatio =
  | "auto"
  | "16:9"
  | "4:3"
  | "1:1"
  | "9:16"
  | "4:5"
  | "2:1"
  | "3:2";

export type ShadowType = "none" | "spread" | "hug" | "bottom";
export type FilterEffect = "none" | "noise" | "vignette" | "grain";
export type DeviceColor = "black" | "white";

export interface FramedSettings {
  frameStyle: FrameStyle;
  background: string;
  padding: number;
  rounded: number;
  shadow: number;
  shadowType: ShadowType;
  shadowColor: string;
  aspectRatio: AspectRatio;
  zoom: number;
  tiltX: number;
  tiltY: number;
  offsetX: number;
  offsetY: number;
  filterEffect: FilterEffect;
  deviceColor: DeviceColor;
  browserUrl: string;
  hdMockupId?: string;
}

export interface MagicPreset {
  name: string;
  emoji: string;
  settings: Partial<FramedSettings>;
}

export const MAGIC_PRESETS: MagicPreset[] = [
  {
    name: "Cosmic",
    emoji: "🌌",
    settings: {
      frameStyle: "iphone-15-pro",
      background: "radial-gradient(at 40% 30%, hsla(240,100%,20%,1) 0px, transparent 60%), radial-gradient(at 80% 80%, hsla(270,100%,15%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(210,100%,25%,1) 0px, transparent 50%), #060616",
      padding: 60,
      shadow: 80,
      shadowType: "spread",
      shadowColor: "#6366f1",
      filterEffect: "none",
    },
  },
  {
    name: "Sunset",
    emoji: "🌅",
    settings: {
      frameStyle: "macos",
      background: "radial-gradient(at 0% 0%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 50% 100%, hsla(189,100%,56%,1) 0px, transparent 50%), #fca5a5",
      padding: 72,
      rounded: 20,
      shadow: 60,
      shadowType: "spread",
      shadowColor: "#f5576c",
      filterEffect: "none",
    },
  },
  {
    name: "Mint",
    emoji: "🌿",
    settings: {
      frameStyle: "browser",
      background: "radial-gradient(at 0% 0%, hsla(148,100%,76%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(168,100%,56%,1) 0px, transparent 50%), #86efac",
      padding: 64,
      rounded: 16,
      shadow: 50,
      shadowType: "hug",
      shadowColor: "#22c55e",
      filterEffect: "none",
    },
  },
  {
    name: "Midnight",
    emoji: "🌙",
    settings: {
      frameStyle: "iphone-14",
      background: "radial-gradient(at 50% 0%, hsla(270,100%,20%,1) 0px, transparent 60%), #050510",
      padding: 56,
      shadow: 90,
      shadowType: "spread",
      shadowColor: "#8b5cf6",
      filterEffect: "noise",
    },
  },
  {
    name: "Pastel",
    emoji: "🍬",
    settings: {
      frameStyle: "ipad",
      background: "radial-gradient(at 30% 30%, hsla(330,100%,85%,1) 0px, transparent 60%), radial-gradient(at 70% 70%, hsla(280,100%,85%,1) 0px, transparent 60%), #fce7f3",
      padding: 80,
      rounded: 24,
      shadow: 40,
      shadowType: "spread",
      shadowColor: "#fb923c",
      filterEffect: "none",
    },
  },
  {
    name: "Ocean",
    emoji: "🌊",
    settings: {
      frameStyle: "none",
      background: "radial-gradient(at 40% 20%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(289,100%,70%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), #67e8f9",
      padding: 64,
      rounded: 20,
      shadow: 55,
      shadowType: "spread",
      shadowColor: "#0ea5e9",
      filterEffect: "none",
    },
  },
  {
    name: "Studio",
    emoji: "📸",
    settings: {
      frameStyle: "macos",
      background: "#f8fafc",
      padding: 80,
      rounded: 12,
      shadow: 40,
      shadowType: "bottom",
      shadowColor: "#94a3b8",
      filterEffect: "none",
    },
  },
  {
    name: "Neon",
    emoji: "⚡",
    settings: {
      frameStyle: "browser",
      background: "radial-gradient(at 50% 0%, hsla(280,100%,30%,1) 0px, transparent 60%), radial-gradient(at 100% 100%, hsla(240,100%,20%,1) 0px, transparent 50%), #0a0a1a",
      padding: 64,
      rounded: 16,
      shadow: 90,
      shadowType: "spread",
      shadowColor: "#a855f7",
      deviceColor: "black",
      browserUrl: "https://yourapp.com",
    },
  },
];

export const BACKGROUNDS: {
  name: string;
  value: string;
  bg: string;
  category: "mesh" | "gradient" | "solid" | "special";
}[] = [
  // ── Special ──────────────────────────────────────────────────────────────
  { name: "Transparent", value: "transparent", bg: "transparent", category: "special" },

  // ── Mesh (25) ─────────────────────────────────────────────────────────────
  {
    name: "Sunset Mesh",
    value: "radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)",
    bg: "#fca5a5", category: "mesh",
  },
  {
    name: "Ocean Mesh",
    value: "radial-gradient(at 40% 20%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(289,100%,70%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(189,100%,56%,1) 0px, transparent 50%)",
    bg: "#67e8f9", category: "mesh",
  },
  {
    name: "Deep Purple",
    value: "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(260,60%,15%,1) 0, transparent 50%)",
    bg: "#4c1d95", category: "mesh",
  },
  {
    name: "Mint Mesh",
    value: "radial-gradient(at 0% 50%, hsla(148,100%,76%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(168,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(113,100%,80%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(180,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(120,100%,90%,1) 0px, transparent 50%)",
    bg: "#86efac", category: "mesh",
  },
  {
    name: "Fire Mesh",
    value: "radial-gradient(at 40% 20%, hsla(20,100%,70%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(40,100%,60%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(0,100%,70%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(15,100%,65%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(30,100%,75%,1) 0px, transparent 50%)",
    bg: "#fb923c", category: "mesh",
  },
  {
    name: "Rose Mesh",
    value: "radial-gradient(at 40% 20%, hsla(330,100%,85%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(315,100%,75%,1) 0px, transparent 50%), radial-gradient(at 0% 80%, hsla(340,100%,80%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(0,100%,90%,1) 0px, transparent 50%)",
    bg: "#f9a8d4", category: "mesh",
  },
  {
    name: "Indigo Mesh",
    value: "radial-gradient(at 0% 30%, hsla(240,100%,70%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(270,100%,60%,1) 0px, transparent 50%), radial-gradient(at 50% 100%, hsla(220,100%,75%,1) 0px, transparent 50%), #3730a3",
    bg: "#818cf8", category: "mesh",
  },
  {
    name: "Forest Mesh",
    value: "radial-gradient(at 0% 0%, hsla(130,80%,50%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(160,100%,35%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(145,60%,60%,1) 0px, transparent 50%), #15803d",
    bg: "#4ade80", category: "mesh",
  },
  {
    name: "Gold Mesh",
    value: "radial-gradient(at 0% 0%, hsla(45,100%,75%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(30,100%,60%,1) 0px, transparent 50%), radial-gradient(at 50% 0%, hsla(50,100%,80%,1) 0px, transparent 50%), #d97706",
    bg: "#fbbf24", category: "mesh",
  },
  {
    name: "Lavender Mesh",
    value: "radial-gradient(at 20% 30%, hsla(280,100%,80%,1) 0px, transparent 50%), radial-gradient(at 80% 70%, hsla(260,100%,75%,1) 0px, transparent 50%), radial-gradient(at 50% 0%, hsla(300,100%,85%,1) 0px, transparent 50%), #ede9fe",
    bg: "#c4b5fd", category: "mesh",
  },
  {
    name: "Arctic Mesh",
    value: "radial-gradient(at 0% 0%, hsla(200,100%,85%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(210,100%,75%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(190,100%,90%,1) 0px, transparent 50%), #e0f2fe",
    bg: "#bae6fd", category: "mesh",
  },
  {
    name: "Dusk Mesh",
    value: "radial-gradient(at 0% 0%, hsla(260,80%,40%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(330,100%,50%,1) 0px, transparent 50%), radial-gradient(at 50% 100%, hsla(200,100%,30%,1) 0px, transparent 50%), #1e1b4b",
    bg: "#7c3aed", category: "mesh",
  },
  {
    name: "Aurora Mesh",
    value: "radial-gradient(at 0% 50%, hsla(150,100%,50%,1) 0px, transparent 40%), radial-gradient(at 100% 0%, hsla(190,100%,60%,1) 0px, transparent 40%), radial-gradient(at 50% 100%, hsla(280,100%,70%,1) 0px, transparent 40%), radial-gradient(at 0% 0%, hsla(160,100%,30%,1) 0px, transparent 50%), #064e3b",
    bg: "#10b981", category: "mesh",
  },
  {
    name: "Crimson Mesh",
    value: "radial-gradient(at 0% 0%, hsla(0,100%,60%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(340,100%,50%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(15,100%,55%,1) 0px, transparent 50%), #9f1239",
    bg: "#fb7185", category: "mesh",
  },
  {
    name: "Teal Mesh",
    value: "radial-gradient(at 0% 100%, hsla(174,100%,60%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(190,100%,50%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(180,100%,65%,1) 0px, transparent 50%), #0d9488",
    bg: "#2dd4bf", category: "mesh",
  },
  {
    name: "Peach Mesh",
    value: "radial-gradient(at 0% 0%, hsla(30,100%,85%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(10,100%,75%,1) 0px, transparent 50%), radial-gradient(at 50% 0%, hsla(45,100%,80%,1) 0px, transparent 50%), #fef3c7",
    bg: "#fdba74", category: "mesh",
  },
  {
    name: "Sky Mesh",
    value: "radial-gradient(at 30% 0%, hsla(200,100%,75%,1) 0px, transparent 50%), radial-gradient(at 70% 100%, hsla(220,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 60%, hsla(190,100%,80%,1) 0px, transparent 50%), #bfdbfe",
    bg: "#93c5fd", category: "mesh",
  },
  {
    name: "Midnight Mesh",
    value: "radial-gradient(at 20% 20%, hsla(240,80%,20%,1) 0px, transparent 50%), radial-gradient(at 80% 80%, hsla(260,100%,15%,1) 0px, transparent 50%), radial-gradient(at 50% 0%, hsla(220,80%,15%,1) 0px, transparent 50%), #020617",
    bg: "#1e293b", category: "mesh",
  },
  {
    name: "Cherry Mesh",
    value: "radial-gradient(at 0% 0%, hsla(350,100%,70%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(320,100%,60%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(340,100%,75%,1) 0px, transparent 50%), #be185d",
    bg: "#f43f5e", category: "mesh",
  },
  {
    name: "Citrus Mesh",
    value: "radial-gradient(at 0% 100%, hsla(80,100%,60%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(50,100%,65%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(65,100%,70%,1) 0px, transparent 50%), #65a30d",
    bg: "#a3e635", category: "mesh",
  },

  // ── Linear Gradients (22) ─────────────────────────────────────────────────
  { name: "Sunrise", value: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", bg: "#f6d365", category: "gradient" },
  { name: "Night", value: "linear-gradient(to right, #434343 0%, #000000 100%)", bg: "#434343", category: "gradient" },
  { name: "Blue Sky", value: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)", bg: "#4facfe", category: "gradient" },
  { name: "Candy", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", bg: "#f093fb", category: "gradient" },
  { name: "Space", value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)", bg: "#1a1a2e", category: "gradient" },
  { name: "Violet", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", bg: "#667eea", category: "gradient" },
  { name: "Forest", value: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)", bg: "#134e5e", category: "gradient" },
  { name: "Peach", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", bg: "#ffecd2", category: "gradient" },
  { name: "Neon Night", value: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 100%)", bg: "#0f0f0f", category: "gradient" },
  { name: "Nordic", value: "linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #52b788 100%)", bg: "#2d6a4f", category: "gradient" },
  { name: "Flamingo", value: "linear-gradient(135deg, #f72585 0%, #b5179e 50%, #7209b7 100%)", bg: "#f72585", category: "gradient" },
  { name: "Steel", value: "linear-gradient(135deg, #e2ebf0 0%, #cfd9df 100%)", bg: "#e2ebf0", category: "gradient" },
  { name: "Ember", value: "linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)", bg: "#ff4e50", category: "gradient" },
  { name: "Aqua", value: "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)", bg: "#13547a", category: "gradient" },
  { name: "Cotton Candy", value: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", bg: "#fbc2eb", category: "gradient" },
  { name: "Lime", value: "linear-gradient(135deg, #b8e994 0%, #78e08f 100%)", bg: "#b8e994", category: "gradient" },
  { name: "Amber", value: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", bg: "#f7971e", category: "gradient" },
  { name: "Deep Sea", value: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)", bg: "#2c3e50", category: "gradient" },
  { name: "Raven", value: "linear-gradient(135deg, #16213e 0%, #0f3460 50%, #533483 100%)", bg: "#16213e", category: "gradient" },
  { name: "Golden Hour", value: "linear-gradient(180deg, #ffeaa7 0%, #fdcb6e 50%, #e17055 100%)", bg: "#ffeaa7", category: "gradient" },
  { name: "Toxic", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", bg: "#11998e", category: "gradient" },
  { name: "Berry", value: "linear-gradient(135deg, #614385 0%, #516395 100%)", bg: "#614385", category: "gradient" },

  // ── Solid Colors (20) ─────────────────────────────────────────────────────
  { name: "Pure White", value: "#ffffff", bg: "#ffffff", category: "solid" },
  { name: "Off White", value: "#fafaf9", bg: "#fafaf9", category: "solid" },
  { name: "Pearl", value: "#f8fafc", bg: "#f8fafc", category: "solid" },
  { name: "Smoke", value: "#f1f5f9", bg: "#f1f5f9", category: "solid" },
  { name: "Silver", value: "#e2e8f0", bg: "#e2e8f0", category: "solid" },
  { name: "Graphite", value: "#64748b", bg: "#64748b", category: "solid" },
  { name: "Slate", value: "#334155", bg: "#334155", category: "solid" },
  { name: "Charcoal", value: "#1e293b", bg: "#1e293b", category: "solid" },
  { name: "Obsidian", value: "#0f172a", bg: "#0f172a", category: "solid" },
  { name: "Jet Black", value: "#050505", bg: "#050505", category: "solid" },
  { name: "Indigo", value: "#4f46e5", bg: "#4f46e5", category: "solid" },
  { name: "Solid Violet", value: "#7c3aed", bg: "#7c3aed", category: "solid" },
  { name: "Rose", value: "#e11d48", bg: "#e11d48", category: "solid" },
  { name: "Emerald", value: "#059669", bg: "#059669", category: "solid" },
  { name: "Solid Amber", value: "#d97706", bg: "#d97706", category: "solid" },
  { name: "Sky", value: "#0284c7", bg: "#0284c7", category: "solid" },
  { name: "Pink", value: "#db2777", bg: "#db2777", category: "solid" },
  { name: "Teal", value: "#0d9488", bg: "#0d9488", category: "solid" },
  { name: "Sand", value: "#f5f0e8", bg: "#f5f0e8", category: "solid" },
  { name: "Cream", value: "#fffbf0", bg: "#fffbf0", category: "solid" },
];
