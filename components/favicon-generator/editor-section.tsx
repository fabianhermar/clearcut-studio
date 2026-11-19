"use client";

import { useState, useRef, useMemo } from "react";
import {
  Download,
  SlidersHorizontal,
  Eye,
  ImagePlus,
  X,
  Copy,
  Check,
  PackageCheck,
  Code2,
  FolderCog,
  Smartphone,
  Globe,
  Search,
  Sun,
  Moon,
  Sparkles,
  FileCode2,
  FileJson,
  Layers,
  Shield,
} from "lucide-react";
import {
  FaviconSettings,
  DEFAULT_FAVICON_SETTINGS,
  GeneratedFaviconBundle,
  ManifestDisplayMode,
} from "./types";
import {
  generateFavicons,
  buildHtmlHeadCode,
  buildWebManifest,
  buildNextjsMetadataCode,
  buildBrowserConfigXml,
  normalizePublicPath,
  resolveAssetUrl,
} from "./generator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { WorkspaceHeader } from "@/components/studio/workspace-header";

interface EditorSectionProps {
  imageSrc: string;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

type SidebarTab = "design" | "pwa" | "paths";
type CanvasView = "previews" | "code";
type CodeTab = "html" | "manifest" | "nextjs" | "windows";
type AndroidShape = "circle" | "squircle" | "rounded" | "teardrop";

const PATH_PRESETS = ["/", "/favicon/", "/icons/", "/assets/favicon/"];
const BG_SWATCHES = ["#ffffff", "#0c0e12", "#1e40ff", "#ff4d00", "#f4f3ef"];
const DISPLAY_MODES: ManifestDisplayMode[] = [
  "standalone",
  "minimal-ui",
  "fullscreen",
  "browser",
];

const ANDROID_SHAPE_STYLES: Record<AndroidShape, { labelEs: string; labelEn: string; radius: string }> = {
  circle: { labelEs: "Círculo", labelEn: "Circle", radius: "50%" },
  squircle: { labelEs: "Squircle", labelEn: "Squircle", radius: "28%" },
  rounded: { labelEs: "Redondeado", labelEn: "Rounded", radius: "18%" },
  teardrop: { labelEs: "Gota", labelEn: "Teardrop", radius: "50% 50% 50% 14%" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function EditorSection({
  imageSrc,
  onReset,
  onClose,
  dict,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const [settings, setSettings] = useState<FaviconSettings>(DEFAULT_FAVICON_SETTINGS);
  const [darkImageSrc, setDarkImageSrc] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("design");
  const [canvasView, setCanvasView] = useState<CanvasView>("previews");
  const [codeTab, setCodeTab] = useState<CodeTab>("html");

  // Interactive Preview Controls
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [iosDarkWallpaper, setIosDarkWallpaper] = useState(true);
  const [androidShape, setAndroidShape] = useState<AndroidShape>("circle");
  const [serpMobile, setSerpMobile] = useState(false);

  // Export & Copy State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<GeneratedFaviconBundle | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const darkFileInputRef = useRef<HTMLInputElement>(null);

  // Live generated snippets (always up to date in real time!)
  const liveHtmlCode = useMemo(
    () => buildHtmlHeadCode(settings, Boolean(darkImageSrc)),
    [settings, darkImageSrc]
  );

  const liveManifestJson = useMemo(
    () => JSON.stringify(buildWebManifest(settings), null, 2),
    [settings]
  );

  const liveNextjsCode = useMemo(
    () => buildNextjsMetadataCode(settings, Boolean(darkImageSrc)),
    [settings, darkImageSrc]
  );

  const liveBrowserConfig = useMemo(() => buildBrowserConfigXml(settings), [settings]);

  const normalizedPath = useMemo(() => normalizePublicPath(settings.path), [settings.path]);

  // Planned output file inventory for Paths tab
  const plannedFiles = useMemo(() => {
    const items = [
      { name: "favicon.ico", size: "16·32·48", tag: "ICO" },
      { name: "favicon-16x16.png", size: "16×16", tag: "PNG" },
      { name: "favicon-32x32.png", size: "32×32", tag: "PNG" },
      { name: "favicon-96x96.png", size: "96×96", tag: "SERP" },
      ...(darkImageSrc
        ? [
            { name: "favicon-dark-16x16.png", size: "16×16", tag: "DARK" },
            { name: "favicon-dark-32x32.png", size: "32×32", tag: "DARK" },
            { name: "favicon-dark-96x96.png", size: "96×96", tag: "DARK" },
          ]
        : []),
      { name: "apple-touch-icon.png", size: "180×180", tag: "iOS" },
      { name: "web-app-manifest-192x192.png", size: "192×192", tag: "PWA" },
      { name: "web-app-manifest-512x512.png", size: "512×512", tag: "PWA" },
      { name: "web-app-manifest-maskable-512x512.png", size: "512×512", tag: "MASK" },
      ...(settings.includeWindowsTile
        ? [
            { name: "mstile-150x150.png", size: "150×150", tag: "WIN" },
            { name: "browserconfig.xml", size: "XML", tag: "WIN" },
          ]
        : []),
      { name: "site.webmanifest", size: "JSON", tag: "PWA" },
      { name: "head-tags.html", size: "HTML", tag: "CODE" },
    ];
    return items;
  }, [darkImageSrc, settings.includeWindowsTile]);

  const handleDarkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDarkImageSrc(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generateFavicons(imageSrc, darkImageSrc, settings);
      setExportData(data);
      setShowExportModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerDownloadZip = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clearcut-favicons-bundle.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (content: string, key: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((curr) => (curr === key ? null : curr)), 1800);
    } catch (err) {
      console.error(err);
    }
  };

  const cleanDomain =
    settings.siteUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "") || "example.com";
  const displayAppName = settings.appName.trim() || "ClearCut Web App";
  const displayShortName = settings.shortName.trim() || displayAppName.slice(0, 12);

  const activeCodeContent =
    codeTab === "html"
      ? liveHtmlCode
      : codeTab === "manifest"
      ? liveManifestJson
      : codeTab === "nextjs"
      ? liveNextjsCode
      : liveBrowserConfig;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="favicon-generator"
        lang={lang}
        onClose={onClose || onReset}
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-full transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isEn ? "New icon" : "Nuevo icono"}</span>
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0c0e12] hover:bg-primary disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all tactile-button cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {isGenerating
                  ? isEn
                    ? "Packaging..."
                    : "Empaquetando..."
                  : isEn
                  ? `Download .ZIP (${plannedFiles.length})`
                  : `Descargar .ZIP (${plannedFiles.length})`}
              </span>
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden bg-background">
        {/* LEFT SIDEBAR: TACTILE 3-TAB CONFIGURATION CONSOLE */}
        <aside className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-r border-border bg-card flex flex-col shrink-0 order-2 lg:order-1 lg:overflow-y-auto">
          {/* Sidebar Tab Rail */}
          <div className="p-3 border-b border-border bg-background/60">
            <div
              role="tablist"
              aria-label={isEn ? "Configuration sections" : "Secciones de configuración"}
              className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted border border-border"
            >
              {(
                [
                  {
                    id: "design",
                    icon: SlidersHorizontal,
                    label: isEn ? "Design" : "Diseño",
                  },
                  {
                    id: "pwa",
                    icon: Smartphone,
                    label: "PWA",
                  },
                  {
                    id: "paths",
                    icon: FolderCog,
                    label: isEn ? "Paths" : "Rutas",
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = sidebarTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSidebarTab(tab.id)}
                    className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-[#0c0e12] text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: DESIGN & OPTICS */}
          {sidebarTab === "design" && (
            <div className="p-5 space-y-6">
              {/* Live Optical Specimen Box */}
              <div className="rounded-2xl bg-[#0c0e12] border border-[#242936] p-4 flex items-center justify-between gap-4 text-white">
                <div className="relative w-16 h-16 rounded-xl checkerboard-dark border border-white/15 flex items-center justify-center overflow-hidden shrink-0">
                  <PreviewIcon size={56} settings={settings} imageSrc={imageSrc} />
                  {showSafeZone && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[10%] rounded-full border border-dashed border-[#ff4d00]"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    MASTER // 512×512 PNG
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {displayShortName}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSafeZone((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] border transition-colors cursor-pointer ${
                      showSafeZone
                        ? "bg-[#ff4d00]/20 border-[#ff4d00] text-[#ff834d]"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>
                      {isEn ? "80% Safe-Zone Guide" : "Guía Safe-Zone 80%"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Padding Slider + Presets */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Internal Margin" : "Margen interno"}
                  </Label>
                  <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border text-foreground tabular-nums">
                    {settings.padding}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={40}
                  step={1}
                  value={[settings.padding]}
                  onValueChange={([val]) => setSettings((s) => ({ ...s, padding: val }))}
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 8, 16, 24].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, padding: p }))}
                      className={`py-1 rounded-md font-mono text-[10px] font-semibold border transition-colors cursor-pointer ${
                        settings.padding === p
                          ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius Slider + Presets */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Corner Radius" : "Radio de esquinas"}
                  </Label>
                  <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border text-foreground tabular-nums">
                    {settings.backgroundRadius}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[settings.backgroundRadius]}
                  onValueChange={([val]) =>
                    setSettings((s) => ({ ...s, backgroundRadius: val }))
                  }
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 0, label: isEn ? "Square" : "Recto" },
                    { val: 18, label: "18%" },
                    { val: 28, label: "Squircle" },
                    { val: 50, label: isEn ? "Circle" : "Círculo" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, backgroundRadius: opt.val }))
                      }
                      className={`py-1 rounded-md font-mono text-[10px] font-semibold border transition-colors cursor-pointer ${
                        settings.backgroundRadius === opt.val
                          ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Scaling */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Image Fit" : "Ajuste de imagen"}
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["contain", "cover"] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, imageScaling: fit }))}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        settings.imageScaling === fit
                          ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {fit === "contain"
                        ? isEn
                          ? "Contain (Full)"
                          : "Contener (Completo)"
                        : isEn
                        ? "Cover (Fill)"
                        : "Cubrir (Rellenar)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Fill + Quick Swatches */}
              <div className="space-y-2.5">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Background Fill" : "Fondo del icono"}
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({ ...s, backgroundColor: "transparent" }))
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      settings.backgroundColor === "transparent"
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {isEn ? "Transparent" : "Transparente"}
                  </button>
                  <input
                    type="color"
                    aria-label={isEn ? "Select background color" : "Seleccionar color de fondo"}
                    value={
                      settings.backgroundColor === "transparent"
                        ? "#ffffff"
                        : settings.backgroundColor
                    }
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, backgroundColor: e.target.value }))
                    }
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                  />
                  <div className="flex items-center gap-1.5">
                    {BG_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, backgroundColor: hex }))}
                        aria-label={`Color ${hex}`}
                        className={`w-6 h-6 rounded-md border transition-transform cursor-pointer hover:scale-110 ${
                          settings.backgroundColor.toLowerCase() === hex
                            ? "ring-2 ring-primary ring-offset-1 border-primary"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dark Mode Variant */}
              <div className="space-y-2.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Dark Mode Variant" : "Variante modo oscuro"}
                  </Label>
                  <span className="font-mono text-[10px] text-primary">
                    prefers-color-scheme
                  </span>
                </div>
                {darkImageSrc ? (
                  <div className="flex items-center justify-between p-2.5 border border-border rounded-xl bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#0c0e12] flex items-center justify-center overflow-hidden p-1 border border-white/10">
                        <img
                          src={darkImageSrc}
                          alt="Dark Icon"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {isEn ? "Custom dark icon active" : "Icono oscuro activo"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          favicon-dark-*.png
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDarkImageSrc(null)}
                      aria-label={isEn ? "Remove dark icon" : "Quitar icono oscuro"}
                      className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => darkFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold border border-dashed border-border rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Moon className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {isEn ? "Upload dark-tab icon" : "Subir icono para pestañas oscuras"}
                      </span>
                    </button>
                    <input
                      type="file"
                      ref={darkFileInputRef}
                      onChange={handleDarkFile}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PWA & MANIFEST SETTINGS */}
          {sidebarTab === "pwa" && (
            <div className="p-5 space-y-5">
              {/* App Full Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="favicon-app-name"
                  className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {isEn ? "App Name (manifest name)" : "Nombre de la app (name)"}
                </Label>
                <input
                  id="favicon-app-name"
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings((s) => ({ ...s, appName: e.target.value }))}
                  placeholder="ClearCut Studio"
                  className="w-full text-xs font-medium bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Short Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="favicon-short-name"
                    className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {isEn ? "Short Name (home screen)" : "Nombre corto (short_name)"}
                  </Label>
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      settings.shortName.length > 12
                        ? "text-[#ff4d00] font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {settings.shortName.length}/12
                  </span>
                </div>
                <input
                  id="favicon-short-name"
                  type="text"
                  value={settings.shortName}
                  onChange={(e) => setSettings((s) => ({ ...s, shortName: e.target.value }))}
                  placeholder="ClearCut"
                  className="w-full text-xs font-medium bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Domain for Browser / SERP preview */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="favicon-site-url"
                  className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {isEn ? "Preview Domain (SERP / Tab)" : "Dominio (vista previa SERP)"}
                </Label>
                <input
                  id="favicon-site-url"
                  type="text"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings((s) => ({ ...s, siteUrl: e.target.value }))}
                  placeholder="studio.fabianh.me"
                  className="w-full text-xs font-mono bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Theme Color & Splash Background Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    theme_color
                  </Label>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-background">
                    <input
                      type="color"
                      aria-label="Theme color"
                      value={settings.themeColor}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, themeColor: e.target.value }))
                      }
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono font-semibold text-foreground uppercase">
                      {settings.themeColor}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    background_color
                  </Label>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-background">
                    <input
                      type="color"
                      aria-label="Manifest background color"
                      value={settings.manifestBackgroundColor}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          manifestBackgroundColor: e.target.value,
                        }))
                      }
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono font-semibold text-foreground uppercase">
                      {settings.manifestBackgroundColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* PWA Display Mode */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "PWA Display Mode" : "Modo de pantalla (display)"}
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DISPLAY_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, display: mode }))}
                      className={`py-1.5 px-2.5 rounded-lg font-mono text-[11px] font-semibold border transition-colors cursor-pointer ${
                        settings.display === mode
                          ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* start_url */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="favicon-start-url"
                  className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider"
                >
                  start_url
                </Label>
                <input
                  id="favicon-start-url"
                  type="text"
                  value={settings.startUrl}
                  onChange={(e) => setSettings((s) => ({ ...s, startUrl: e.target.value }))}
                  placeholder="/"
                  className="w-full text-xs font-mono bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Windows Tile Toggle */}
              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {isEn ? "Include Windows Start Tile" : "Incluir Windows Start Tile"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    mstile-150x150.png + browserconfig.xml
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeWindowsTile}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, includeWindowsTile: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#1e40ff] cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* TAB 3: PUBLIC PATH PREFIX & FILE MANIFEST */}
          {sidebarTab === "paths" && (
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="favicon-path-input"
                  className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {isEn ? "Public Path Prefix" : "Ruta pública de los favicons"}
                </Label>
                <input
                  id="favicon-path-input"
                  type="text"
                  value={settings.path}
                  onChange={(e) => setSettings((s) => ({ ...s, path: e.target.value }))}
                  placeholder="/favicon/"
                  className="w-full text-xs font-mono bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PATH_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, path: preset }))}
                      className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold border transition-colors cursor-pointer ${
                        normalizedPath === preset
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  {isEn
                    ? "All links in <head>, site.webmanifest, and Next.js metadata automatically resolve to:"
                    : "Todos los enlaces en <head>, site.webmanifest y Next.js se resolverán automáticamente en:"}
                </p>
                <div className="px-3 py-2 rounded-lg bg-[#0c0e12] text-emerald-400 font-mono text-[11px] truncate border border-[#242936]">
                  {resolveAssetUrl(settings.path, "favicon.ico")}
                </div>
              </div>

              {/* Generated File Checklist */}
              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isEn ? "FILES IN ZIP BUNDLE" : "ARCHIVOS EN EL PAQUETE ZIP"}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-primary">
                    {plannedFiles.length} {isEn ? "files" : "archivos"}
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-background divide-y divide-border/70 max-h-[320px] overflow-y-auto">
                  {plannedFiles.map((f) => (
                    <div
                      key={f.name}
                      className="px-3 py-2 flex items-center justify-between gap-2 text-[11px] font-mono"
                    >
                      <span className="text-foreground truncate">
                        {resolveAssetUrl(settings.path, f.name)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[9px] shrink-0">
                        {f.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN STUDIO CANVAS: DEVICE PREVIEWS + LIVE CODE INSPECTOR */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 bg-background studio-grid order-1 lg:order-2">
          {/* Top Studio Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-3.5 sm:p-4 rounded-2xl border border-border tactile-surface">
            <div
              role="tablist"
              aria-label={isEn ? "Studio canvas view" : "Vista del estudio"}
              className="inline-flex items-center p-1 rounded-xl bg-muted border border-border"
            >
              <button
                type="button"
                role="tab"
                aria-selected={canvasView === "previews"}
                onClick={() => setCanvasView("previews")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  canvasView === "previews"
                    ? "bg-[#0c0e12] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isEn ? "Device Previews" : "Previsualización en dispositivos"}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={canvasView === "code"}
                onClick={() => setCanvasView("code")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  canvasView === "code"
                    ? "bg-[#0c0e12] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isEn ? "HTML, Manifest & Next.js" : "Código <head> y Manifiesto"}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(liveHtmlCode, "quick-html")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                {copiedKey === "quick-html" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isEn ? "Copied <head>" : "<head> copiado"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-primary" />
                    <span>{isEn ? "Copy <head>" : "Copiar <head>"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isGenerating
                    ? isEn
                      ? "Generating..."
                      : "Generando..."
                    : isEn
                    ? "Generate .ZIP"
                    : "Generar .ZIP"}
                </span>
              </button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* VIEW 1: HYPER-REALISTIC MULTI-PLATFORM PREVIEWS                 */}
          {/* =============================================================== */}
          {canvasView === "previews" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* 1. DESKTOP BROWSERS (CHROME LIGHT + DARK + URL BAR) */}
              <div className="bg-card border border-border rounded-2xl tactile-surface flex flex-col overflow-hidden">
                <div className="px-4 py-3.5 border-b border-border bg-muted/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        {isEn ? "Desktop Browser Tabs" : "Pestañas de navegador (Escritorio)"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {isEn
                          ? "Light & dark chrome with active/inactive contrast"
                          : "Tema claro y oscuro con contraste de pestaña"}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 bg-background rounded border border-border">
                    favicon.ico · 16/32px
                  </span>
                </div>

                <div className="p-5 space-y-5 bg-background/40 flex-1 flex flex-col justify-center">
                  {/* Light Browser Window */}
                  <div className="rounded-xl border border-border overflow-hidden shadow-xs bg-white">
                    <div className="bg-[#dee1e6] pt-2 px-2.5 flex items-end gap-1.5">
                      <div className="flex items-center gap-1 pb-2 pr-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      </div>
                      <div className="bg-white rounded-t-lg px-3 py-1.5 flex items-center gap-2 max-w-[200px] min-w-[130px] shadow-2xs">
                        <PreviewIcon size={16} settings={settings} imageSrc={imageSrc} />
                        <span className="text-[11px] text-[#202124] font-medium truncate">
                          {displayAppName}
                        </span>
                      </div>
                      <div className="px-2.5 py-1.5 text-[11px] text-[#5f6368] truncate hidden sm:block">
                        {isEn ? "New Tab" : "Nueva pestaña"}
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-white border-t border-black/5 flex items-center gap-2">
                      <div className="flex-1 bg-[#f1f3f4] rounded-full px-3 py-1 text-[11px] font-mono text-[#5f6368] truncate">
                        https://{cleanDomain}
                      </div>
                    </div>
                  </div>

                  {/* Dark Browser Window */}
                  <div className="rounded-xl border border-[#242936] overflow-hidden shadow-sm bg-[#202124]">
                    <div className="bg-[#111318] pt-2 px-2.5 flex items-end gap-1.5">
                      <div className="flex items-center gap-1 pb-2 pr-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
                      </div>
                      <div className="bg-[#292c34] rounded-t-lg px-3 py-1.5 flex items-center gap-2 max-w-[200px] min-w-[130px]">
                        <PreviewIcon
                          size={16}
                          settings={settings}
                          imageSrc={darkImageSrc || imageSrc}
                        />
                        <span className="text-[11px] text-[#e8eaed] font-medium truncate">
                          {displayAppName}
                        </span>
                      </div>
                      <div className="px-2.5 py-1.5 text-[11px] text-slate-500 truncate hidden sm:block">
                        {isEn ? "New Tab" : "Nueva pestaña"}
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-[#292c34] border-t border-white/5 flex items-center gap-2">
                      <div className="flex-1 bg-[#17191f] rounded-full px-3 py-1 text-[11px] font-mono text-slate-400 truncate">
                        https://{cleanDomain}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. GOOGLE SEARCH RESULT (SERP DESKTOP / MOBILE) */}
              <div className="bg-card border border-border rounded-2xl tactile-surface flex flex-col overflow-hidden">
                <div className="px-4 py-3.5 border-b border-border bg-muted/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        {isEn ? "Google Search (SERP)" : "Resultado en Google (SERP)"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {isEn ? "96×96 / 48×48 search badge" : "Insignia de 96×96 / 48×48 en buscadores"}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex p-0.5 rounded-lg bg-background border border-border font-mono text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSerpMobile(false)}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        !serpMobile
                          ? "bg-[#0c0e12] text-white font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      WEB
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpMobile(true)}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        serpMobile
                          ? "bg-[#0c0e12] text-white font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      DARK
                    </button>
                  </div>
                </div>

                <div
                  className={`p-5 flex-1 flex flex-col justify-center transition-colors ${
                    serpMobile ? "bg-[#1f1f1f] text-[#e8eaed]" : "bg-white text-[#202124]"
                  }`}
                >
                  <div
                    className={`rounded-xl p-4 border ${
                      serpMobile
                        ? "bg-[#28292a] border-white/10"
                        : "bg-[#f8f9fa] border-black/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center p-1 border shrink-0 ${
                          serpMobile
                            ? "bg-[#303134] border-white/10"
                            : "bg-white border-black/10"
                        }`}
                      >
                        <PreviewIcon
                          size={20}
                          settings={settings}
                          imageSrc={serpMobile && darkImageSrc ? darkImageSrc : imageSrc}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium truncate">
                          {displayAppName}
                        </span>
                        <span
                          className={`text-[11px] truncate ${
                            serpMobile ? "text-[#bdc1c6]" : "text-[#4d5156]"
                          }`}
                        >
                          https://{cleanDomain} › {lang}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-[17px] font-medium mt-2 truncate ${
                        serpMobile ? "text-[#8ab4f8]" : "text-[#1a0dab]"
                      }`}
                    >
                      {displayAppName} — {isEn ? "Official Web App" : "Aplicación Web Oficial"}
                    </p>
                    <p
                      className={`text-xs leading-relaxed mt-1 line-clamp-2 ${
                        serpMobile ? "text-[#bdc1c6]" : "text-[#4d5156]"
                      }`}
                    >
                      {isEn
                        ? "Verify legibility at 18–24px inside Google's circular search result badge on both light and dark themes."
                        : "Verifica la legibilidad a 18–24 px dentro de la insignia circular de Google en modo claro y oscuro."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. iPHONE / iOS HOME SCREEN (REALISTIC WALLPAPER + NEIGHBOR APPS) */}
              <div className="bg-card border border-border rounded-2xl tactile-surface flex flex-col overflow-hidden">
                <div className="px-4 py-3.5 border-b border-border bg-muted/40 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold font-heading text-foreground">
                      iPhone · iOS Home Screen
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      apple-touch-icon.png · 180×180 (Squircle 22.5%)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIosDarkWallpaper((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-[10px] font-mono font-semibold text-foreground cursor-pointer"
                  >
                    {iosDarkWallpaper ? (
                      <>
                        <Moon className="w-3 h-3 text-primary" />
                        <span>DARK WALLPAPER</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3 h-3 text-amber-600" />
                        <span>LIGHT WALLPAPER</span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  className={`p-6 flex flex-col items-center justify-between min-h-[255px] relative overflow-hidden transition-colors ${
                    iosDarkWallpaper
                      ? "bg-gradient-to-br from-[#0c1020] via-[#17213a] to-[#0f172a] text-white"
                      : "bg-gradient-to-br from-[#e2e8f0] via-[#f1f5f9] to-[#cbd5e1] text-[#0c0e12]"
                  }`}
                >
                  {/* Simulated iPhone Status Bar */}
                  <div className="w-full max-w-[290px] flex items-center justify-between text-[10px] font-mono opacity-80 mb-5">
                    <span className="font-bold">9:41</span>
                    <span className="w-16 h-4 rounded-full bg-black/85" aria-hidden="true" />
                    <span>5G · 100%</span>
                  </div>

                  {/* App Icon Row with Real Neighboring Context */}
                  <div className="grid grid-cols-4 gap-4 w-full max-w-[290px] items-start">
                    {/* Your App Icon (Highlighted!) */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative shadow-[0_10px_24px_rgba(0,0,0,0.35)] rounded-[22.5%] ring-2 ring-[#ff4d00]/80 ring-offset-2 ring-offset-transparent">
                        <PreviewIcon
                          size={58}
                          settings={{
                            ...settings,
                            backgroundColor:
                              settings.backgroundColor === "transparent"
                                ? "#ffffff"
                                : settings.backgroundColor,
                            backgroundRadius: 22.5,
                          }}
                          imageSrc={imageSrc}
                          forceSolidBg
                        />
                      </div>
                      <span className="text-[10px] font-semibold truncate max-w-[66px]">
                        {displayShortName}
                      </span>
                    </div>

                    {/* Simulated System Neighbor Icons for Scale/Contrast Comparison */}
                    {[
                      { name: "Safari", bg: "bg-gradient-to-b from-sky-400 to-blue-600" },
                      { name: "Notes", bg: "bg-gradient-to-b from-amber-300 to-amber-500" },
                      { name: "Photos", bg: "bg-gradient-to-br from-rose-400 via-amber-300 to-indigo-500" },
                    ].map((app) => (
                      <div
                        key={app.name}
                        className="flex flex-col items-center gap-1.5 opacity-60"
                      >
                        <div
                          className={`w-[58px] h-[58px] rounded-[22.5%] ${app.bg} shadow-md`}
                        />
                        <span className="text-[10px] font-medium">{app.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Simulated iOS Dock */}
                  <div
                    className={`mt-6 w-full max-w-[290px] h-11 rounded-2xl border backdrop-blur-md flex items-center justify-around px-4 ${
                      iosDarkWallpaper
                        ? "bg-white/10 border-white/15"
                        : "bg-white/60 border-black/10"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/80" />
                    <span className="w-7 h-7 rounded-lg bg-blue-500/80" />
                    <span className="w-7 h-7 rounded-lg bg-rose-500/80" />
                    <span className="w-7 h-7 rounded-lg bg-slate-500/80" />
                  </div>
                </div>
              </div>

              {/* 4. ANDROID ADAPTIVE LAUNCHER & PWA SPLASH */}
              <div className="bg-card border border-border rounded-2xl tactile-surface flex flex-col overflow-hidden">
                <div className="px-4 py-3.5 border-b border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold font-heading text-foreground">
                      Android Adaptive &amp; PWA
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      192 / 512 PNG · Maskable + Splash Screen
                    </p>
                  </div>
                  {/* Interactive Adaptive Shape Switcher */}
                  <div className="inline-flex p-0.5 rounded-lg bg-background border border-border font-mono text-[10px]">
                    {(Object.keys(ANDROID_SHAPE_STYLES) as AndroidShape[]).map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => setAndroidShape(shape)}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          androidShape === shape
                            ? "bg-[#0c0e12] text-white font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isEn
                          ? ANDROID_SHAPE_STYLES[shape].labelEn
                          : ANDROID_SHAPE_STYLES[shape].labelEs}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-[#0c0e12] text-white flex-1 grid grid-cols-2 gap-4 items-center min-h-[255px]">
                  {/* Left: Android Adaptive Icon with Live Mask Shape */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#141822] border border-white/10 h-full">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-3">
                      ADAPTIVE ICON
                    </span>
                    <div
                      className="relative w-[72px] h-[72px] shadow-xl overflow-hidden flex items-center justify-center transition-all duration-200 border border-white/15"
                      style={{
                        borderRadius: ANDROID_SHAPE_STYLES[androidShape].radius,
                        backgroundColor:
                          settings.backgroundColor === "transparent"
                            ? settings.manifestBackgroundColor
                            : settings.backgroundColor,
                      }}
                    >
                      <PreviewIcon
                        size={72}
                        settings={{
                          ...settings,
                          padding: Math.max(settings.padding, 14),
                          backgroundColor: "transparent",
                          backgroundRadius: 0,
                        }}
                        imageSrc={imageSrc}
                      />
                      {showSafeZone && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-[10%] rounded-full border border-dashed border-[#ff4d00]"
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-200 mt-2.5 truncate max-w-[110px]">
                      {displayShortName}
                    </span>
                  </div>

                  {/* Right: PWA Splash Screen using manifest background_color & theme_color */}
                  <div
                    className="rounded-xl border border-white/15 overflow-hidden flex flex-col h-full min-h-[190px] shadow-lg"
                    style={{ backgroundColor: settings.manifestBackgroundColor }}
                  >
                    {/* Android Status Bar tinted with theme_color */}
                    <div
                      className="h-5 px-2.5 flex items-center justify-between text-[9px] font-mono text-white/90"
                      style={{ backgroundColor: settings.themeColor }}
                    >
                      <span>PWA</span>
                      <span>{settings.display}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2.5">
                      <PreviewIcon size={48} settings={settings} imageSrc={imageSrc} />
                      <span
                        className="text-[11px] font-heading font-bold truncate max-w-[120px] px-2 py-0.5 rounded bg-black/30 text-white"
                      >
                        {displayAppName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 2: LIVE CODE & MANIFEST STUDIO (<head>, JSON, Next.js)     */}
          {/* =============================================================== */}
          {canvasView === "code" && (
            <div className="rounded-2xl bg-[#0c0e12] text-white border border-[#242936] darkroom-chassis overflow-hidden flex flex-col">
              {/* Code Tabs Header */}
              <div className="px-4 py-3 border-b border-[#242936] bg-[#11141c] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: "html", label: "HTML <head>", icon: FileCode2 },
                      { id: "manifest", label: "site.webmanifest", icon: FileJson },
                      { id: "nextjs", label: "Next.js App Router", icon: Sparkles },
                      ...(settings.includeWindowsTile
                        ? [{ id: "windows" as const, label: "browserconfig.xml", icon: Layers }]
                        : []),
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    const active = codeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCodeTab(t.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                          active
                            ? "bg-[#1e40ff] text-white"
                            : "bg-[#181c27] text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(activeCodeContent, `code-${codeTab}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {copiedKey === `code-${codeTab}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">
                        {isEn ? "COPIED" : "COPIADO"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? "COPY SNIPPET" : "COPIAR CÓDIGO"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Body */}
              <div className="p-5 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre">
                  {activeCodeContent}
                </pre>
              </div>

              {/* Footer Path Reminder */}
              <div className="px-5 py-3 border-t border-[#242936] bg-[#0a0c10] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span>
                  {isEn ? "HOSTING PATH PREFIX:" : "RUTA PÚBLICA CONFIGURADA:"}{" "}
                  <strong className="text-emerald-400">{normalizedPath}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarTab("paths")}
                  className="text-[#60a5fa] hover:underline cursor-pointer"
                >
                  {isEn ? "Customize path →" : "Personalizar ruta →"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EXPORT BUNDLE MODAL */}
      {showExportModal && exportData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="favicon-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0e12]/75 backdrop-blur-sm"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-600/25 text-emerald-700 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="favicon-modal-title"
                    className="text-lg font-bold font-heading text-foreground"
                  >
                    {isEn
                      ? "Favicon & PWA Bundle Ready"
                      : "Paquete de Favicons y PWA listo"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? `Extract into public${normalizedPath} and paste the metadata inside <head>.`
                      : `Extrae los archivos en public${normalizedPath} y pega las etiquetas en <head>.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                aria-label={isEn ? "Close dialog" : "Cerrar ventana"}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated File Inventory with Exact Real Sizes */}
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <div className="px-3.5 py-2 border-b border-border bg-muted/40 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>
                  {exportData.files.length} {isEn ? "GENERATED ASSETS" : "ACTIVOS GENERADOS"}
                </span>
                <span>
                  ZIP: {formatBytes(exportData.zipBlob.size)}
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-border/70">
                {exportData.files.map((file) => (
                  <div
                    key={file.name}
                    className="px-3.5 py-1.5 flex items-center justify-between gap-3 text-[11px] font-mono"
                  >
                    <span className="text-foreground truncate">{file.path}</span>
                    <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                      <span>{file.dimensions}</span>
                      <span className="text-emerald-700 font-semibold">
                        {formatBytes(file.sizeBytes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HTML <head> Snippet */}
            <div className="bg-[#0c0e12] text-slate-200 p-4 rounded-xl border border-[#242936] relative">
              <pre className="text-[11px] overflow-x-auto font-mono leading-relaxed pr-24">
                {exportData.htmlCode}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(exportData.htmlCode, "modal-html")}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-[11px] font-mono font-semibold text-white cursor-pointer"
              >
                {copiedKey === "modal-html" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isEn ? "Copied" : "Copiado"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isEn ? "Copy HTML" : "Copiar HTML"}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                {isEn ? "Close" : "Cerrar"}
              </button>
              <button
                type="button"
                onClick={() => triggerDownloadZip(exportData.zipBlob)}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isEn ? "Download favicons.zip" : "Descargar favicons.zip"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewIcon({
  size,
  settings,
  imageSrc,
  forceSolidBg,
}: {
  size: number;
  settings: FaviconSettings;
  imageSrc: string;
  forceSolidBg?: boolean;
}) {
  const paddingPx = (size * settings.padding) / 100;
  const drawAreaSize = size - paddingPx * 2;
  const radiusPx = (size * settings.backgroundRadius) / 100;

  let bg = settings.backgroundColor;
  if (forceSolidBg && bg === "transparent") bg = "#ffffff";

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg === "transparent" ? undefined : bg,
        borderRadius: radiusPx,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: paddingPx,
          left: paddingPx,
          width: drawAreaSize,
          height: drawAreaSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imageSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: settings.imageScaling,
            display: "block",
          }}
          alt=""
        />
      </div>
    </div>
  );
}
