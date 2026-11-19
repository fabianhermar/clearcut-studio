"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  SlidersHorizontal,
  Copy,
  Check,
  ImagePlus,
  Pipette,
  Shuffle,
  ArrowLeftRight,
  RotateCcw,
  Download,
  Code2,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  FileCode2,
  Layers,
  Palette,
} from "lucide-react";
import {
  GradientSettings,
  DEFAULT_GRADIENT_SETTINGS,
  GradientStop,
  GradientType,
} from "./types";
import {
  extractDetailedColors,
  generateGradientCSS,
  buildGradientStop,
  hexToRgb,
  buildCssVariablesCode,
  buildTailwindSnippet,
  buildGradientSvg,
  renderGradientToPng,
} from "./extractor";
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

type SidebarTab = "optics" | "stops" | "export";
type CanvasView = "stage" | "code";
type StageContext = "poster" | "ui-card" | "typography";
type CodeTab = "css" | "tailwind" | "variables" | "svg";

const ANGLE_PRESETS = [0, 45, 90, 135, 180, 270];

export function EditorSection({
  imageSrc,
  onReset,
  onClose,
  dict,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const [settings, setSettings] = useState<GradientSettings>(DEFAULT_GRADIENT_SETTINGS);
  const [stops, setStops] = useState<GradientStop[]>([]);
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isExportingPng, setIsExportingPng] = useState(false);

  // Navigation & Preview State
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("optics");
  const [canvasView, setCanvasView] = useState<CanvasView>("stage");
  const [stageContext, setStageContext] = useState<StageContext>("poster");
  const [codeTab, setCodeTab] = useState<CodeTab>("css");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Live Eyedropper on Source Image
  const [hoverSample, setHoverSample] = useState<{
    hex: string;
    x: number;
    y: number;
  } | null>(null);
  const samplerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImgBoxRef = useRef<HTMLDivElement>(null);

  const runExtraction = useCallback(
    async (count: number) => {
      setIsProcessing(true);
      try {
        const extracted = await extractDetailedColors(imageSrc, count);
        setStops(extracted);
        setSelectedStopIdx(0);
      } catch (err) {
        console.error("Failed to extract colors:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [imageSrc]
  );

  // Extract dominant stops when image or colorCount changes
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      if (!active) return;
      await runExtraction(settings.colorCount);
    }, 100);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [imageSrc, settings.colorCount, runExtraction]);

  // Prepare offscreen canvas for REAL pixel eyedropper sampling
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      // Cover-fit to match preview container
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvas.width / canvas.height;
      let sx = 0,
        sy = 0,
        sw = img.naturalWidth,
        sh = img.naturalHeight;
      if (imgAspect > canvasAspect) {
        sw = img.naturalHeight * canvasAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / canvasAspect;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      samplerCanvasRef.current = canvas;
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const sampleAtPointer = useCallback((clientX: number, clientY: number) => {
    const box = sourceImgBoxRef.current;
    const canvas = samplerCanvasRef.current;
    if (!box || !canvas) return null;
    const rect = box.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const px = Math.min(canvas.width - 1, Math.floor((xPct / 100) * canvas.width));
    const py = Math.min(canvas.height - 1, Math.floor((yPct / 100) * canvas.height));
    const d = ctx.getImageData(px, py, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], x: xPct, y: yPct };
  }, []);

  const handleSourceMouseMove = (e: React.MouseEvent) => {
    const res = sampleAtPointer(e.clientX, e.clientY);
    if (!res) return;
    const stop = buildGradientStop(res.r, res.g, res.b, 0, "hover");
    setHoverSample({ hex: stop.hex, x: res.x, y: res.y });
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    const res = sampleAtPointer(e.clientX, e.clientY);
    if (!res || stops.length === 0) return;
    const targetIdx = Math.min(selectedStopIdx, stops.length - 1);
    setStops((prev) =>
      prev.map((s, idx) =>
        idx === targetIdx ? buildGradientStop(res.r, res.g, res.b, s.position, s.id) : s
      )
    );
  };

  const cssGradient = useMemo(
    () => generateGradientCSS(stops, settings.type, settings.angle),
    [stops, settings.type, settings.angle]
  );

  const cssFullCode = useMemo(
    () =>
      `/* ClearCut Chroma Lab */\nbackground-color: ${stops[0]?.hex || "#0c0e12"};\nbackground-image: ${cssGradient};`,
    [stops, cssGradient]
  );

  const cssVarsCode = useMemo(
    () => buildCssVariablesCode(stops, cssGradient),
    [stops, cssGradient]
  );

  const tailwindCode = useMemo(
    () => buildTailwindSnippet(stops, cssGradient),
    [stops, cssGradient]
  );

  const svgCode = useMemo(
    () => buildGradientSvg(stops, settings.type, settings.angle),
    [stops, settings.type, settings.angle]
  );

  const jsonTokens = useMemo(
    () =>
      JSON.stringify(
        {
          gradient: {
            type: settings.type,
            angle: settings.angle,
            css: cssGradient,
          },
          palette: stops.map((s, i) => ({
            token: `chroma-${i + 1}`,
            hex: s.hex,
            rgb: s.rgb,
            hsl: s.hsl,
            stop: `${s.position}%`,
          })),
        },
        null,
        2
      ),
    [settings.type, settings.angle, cssGradient, stops]
  );

  const copyText = useCallback(async (text: string, tokenKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenKey);
      setTimeout(() => setCopiedToken((curr) => (curr === tokenKey ? null : curr)), 1800);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }, []);

  const handleReverseStops = () => {
    setStops((prev) => {
      const reversed = [...prev].reverse();
      const denom = Math.max(1, reversed.length - 1);
      return reversed.map((s, idx) => ({
        ...s,
        position: Math.round((idx / denom) * 100),
      }));
    });
  };

  const handleShuffleStops = () => {
    setStops((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      const denom = Math.max(1, copy.length - 1);
      return copy.map((s, idx) => ({
        ...s,
        position: Math.round((idx / denom) * 100),
      }));
    });
  };

  const handleUpdateStopColor = (idx: number, hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    setStops((prev) =>
      prev.map((s, i) => (i === idx ? buildGradientStop(r, g, b, s.position, s.id) : s))
    );
  };

  const handleUpdateStopPosition = (idx: number, position: number) => {
    setStops((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, position } : s))
    );
  };

  const handleAddStop = () => {
    if (stops.length >= 6) return;
    const base = stops[stops.length - 1] || buildGradientStop(30, 64, 255, 50, "init");
    const next = buildGradientStop(
      Math.min(255, base.r + 32),
      Math.max(0, base.g - 18),
      Math.min(255, base.b + 40),
      100,
      `stop-${Date.now()}`
    );
    setStops((prev) => {
      const updated = [...prev, next];
      const denom = Math.max(1, updated.length - 1);
      return updated.map((s, idx) => ({
        ...s,
        position: Math.round((idx / denom) * 100),
      }));
    });
    setSelectedStopIdx(stops.length);
  };

  const handleRemoveStop = (idx: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      const denom = Math.max(1, filtered.length - 1);
      return filtered.map((s, i) => ({
        ...s,
        position: Math.round((i / denom) * 100),
      }));
    });
    setSelectedStopIdx((curr) => Math.max(0, Math.min(curr, stops.length - 2)));
  };

  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      const blob = await renderGradientToPng(stops, settings.type, settings.angle, 1920, 1080);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clearcut-gradient-${settings.type}-1080p.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clearcut-gradient-${settings.type}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeCodeContent =
    codeTab === "css"
      ? cssFullCode
      : codeTab === "tailwind"
      ? tailwindCode
      : codeTab === "variables"
      ? cssVarsCode
      : svgCode;

  const avgLuminanceDark =
    stops.length > 0
      ? stops.reduce((acc, s) => acc + s.contrastWhite, 0) / stops.length >= 4.2
      : true;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="gradient-extractor"
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
              <span className="hidden sm:inline">{isEn ? "New image" : "Nueva imagen"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExportingPng || stops.length === 0}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-foreground bg-card hover:bg-muted border border-border rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>{isExportingPng ? "..." : "PNG 1080p"}</span>
            </button>
            <button
              type="button"
              onClick={() => copyText(`background: ${cssGradient};`, "header-css")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0c0e12] hover:bg-primary text-white text-xs font-bold rounded-full transition-all tactile-button cursor-pointer"
            >
              {copiedToken === "header-css" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEn ? "CSS Copied" : "CSS Copiado"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEn ? "Copy CSS" : "Copiar CSS"}</span>
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden bg-background">
        {/* LEFT SIDEBAR: 3-TAB CHROMA LAB CONSOLE */}
        <aside className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-r border-border bg-card flex flex-col shrink-0 order-2 lg:order-1 lg:overflow-y-auto">
          {/* Sidebar Tabs */}
          <div className="p-3 border-b border-border bg-background/60">
            <div
              role="tablist"
              aria-label={isEn ? "Chroma controls" : "Controles de color"}
              className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted border border-border"
            >
              {(
                [
                  { id: "optics", icon: SlidersHorizontal, label: isEn ? "Optics" : "Óptica" },
                  { id: "stops", icon: Palette, label: isEn ? "Stops" : "Paradas" },
                  { id: "export", icon: Download, label: isEn ? "Export" : "Exportar" },
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

          {/* TAB 1: OPTICS & LIVE SOURCE EYEDROPPER */}
          {sidebarTab === "optics" && (
            <div className="p-5 space-y-5">
              {/* Interactive Source Photo Live Eyedropper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Pipette className="w-3.5 h-3.5 text-[#ff4d00]" />
                    <span>
                      {isEn ? "Live Photo Eyedropper" : "Cuentagotas en vivo"}
                    </span>
                  </Label>
                  <span className="font-mono text-[10px] text-primary font-semibold">
                    {isEn
                      ? `Stop 0${Math.min(selectedStopIdx + 1, Math.max(1, stops.length))}`
                      : `Parada 0${Math.min(selectedStopIdx + 1, Math.max(1, stops.length))}`}
                  </span>
                </div>

                <div
                  ref={sourceImgBoxRef}
                  onMouseMove={handleSourceMouseMove}
                  onMouseLeave={() => setHoverSample(null)}
                  onClick={handleSourceClick}
                  className="relative aspect-[3/2] w-full rounded-xl overflow-hidden border border-[#242936] bg-[#0c0e12] cursor-crosshair select-none group"
                  title={
                    isEn
                      ? "Click anywhere on the photo to sample that pixel into the active stop"
                      : "Haz clic en cualquier punto de la foto para reemplazar la parada activa"
                  }
                >
                  <img
                    src={imageSrc}
                    alt={isEn ? "Source image eyedropper" : "Imagen fuente para muestreo"}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  {hoverSample ? (
                    <div
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20"
                      style={{ left: `${hoverSample.x}%`, top: `${hoverSample.y}%` }}
                    >
                      <div
                        className="w-9 h-9 rounded-full border-4 shadow-xl"
                        style={{
                          borderColor: hoverSample.hex,
                          boxShadow: "0 0 0 1px rgba(255,255,255,0.9)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-md bg-[#0c0e12]/80 backdrop-blur-md border border-white/15 font-mono text-[10px] text-slate-200 text-center">
                      {isEn
                        ? "Click photo to sample real pixel"
                        : "Haz clic en la foto para muestrear píxel"}
                    </div>
                  )}
                  {hoverSample && (
                    <div className="pointer-events-none absolute top-2 right-2 px-2 py-0.5 rounded bg-[#0c0e12]/90 border border-white/20 font-mono text-[10px] text-white flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-xs border border-white/30"
                        style={{ backgroundColor: hoverSample.hex }}
                      />
                      <span>{hoverSample.hex}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Gradient Types */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Gradient Mode" : "Modo de degradado"}
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "linear", es: "Lineal", en: "Linear" },
                      { id: "radial", es: "Radial", en: "Radial" },
                      { id: "conic", es: "Cónico", en: "Conic" },
                      { id: "mesh", es: "Mesh Orgánico", en: "Organic Mesh" },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, type: mode.id as GradientType }))
                      }
                      className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                        settings.type === mode.id
                          ? "bg-[#0c0e12] text-white border-[#0c0e12] shadow-xs"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {isEn ? mode.en : mode.es}
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle Control (Linear & Conic) */}
              {(settings.type === "linear" || settings.type === "conic") && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      {isEn ? "Optical Angle" : "Ángulo óptico"}
                    </Label>
                    <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border text-foreground tabular-nums">
                      {settings.angle}°
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={360}
                    step={1}
                    value={[settings.angle]}
                    onValueChange={([val]) => setSettings((s) => ({ ...s, angle: val }))}
                  />
                  <div className="grid grid-cols-6 gap-1">
                    {ANGLE_PRESETS.map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, angle: deg }))}
                        className={`py-1 rounded font-mono text-[10px] font-semibold border cursor-pointer transition-colors ${
                          settings.angle === deg
                            ? "bg-primary text-white border-primary"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Color Count */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Dominant Stops" : "Colores extraídos"}
                  </Label>
                  <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border text-foreground tabular-nums">
                    {settings.colorCount}
                  </span>
                </div>
                <Slider
                  min={2}
                  max={6}
                  step={1}
                  value={[settings.colorCount]}
                  onValueChange={([val]) => setSettings((s) => ({ ...s, colorCount: val }))}
                />
              </div>

              {/* Optical Film Grain */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Film Grain Preview" : "Grano óptico (preview)"}
                  </Label>
                  <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border text-foreground tabular-nums">
                    {settings.grain}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={35}
                  step={1}
                  value={[settings.grain]}
                  onValueChange={([val]) => setSettings((s) => ({ ...s, grain: val }))}
                />
              </div>

              {/* Quick Mutations */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleReverseStops}
                  className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-background hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                  <span>{isEn ? "Invert" : "Invertir"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShuffleStops}
                  className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-background hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-primary" />
                  <span>{isEn ? "Shuffle" : "Mezclar"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => runExtraction(settings.colorCount)}
                  className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-background hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isEn ? "Reset" : "Reset"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FINE STOP EDITOR */}
          {sidebarTab === "stops" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {stops.length} / 6 {isEn ? "COLOR STOPS" : "PARADAS ACTIVAS"}
                </span>
                <button
                  type="button"
                  onClick={handleAddStop}
                  disabled={stops.length >= 6}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0c0e12] hover:bg-primary disabled:opacity-40 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isEn ? "Add stop" : "Añadir"}</span>
                </button>
              </div>

              <div className="space-y-3">
                {stops.map((stop, idx) => {
                  const isSelected = selectedStopIdx === idx;
                  return (
                    <div
                      key={stop.id}
                      onClick={() => setSelectedStopIdx(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? "bg-muted/50 border-primary ring-1 ring-primary/25"
                          : "bg-background border-border hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            aria-label={`Color stop ${idx + 1}`}
                            value={stop.hex}
                            onChange={(e) => handleUpdateStopColor(idx, e.target.value)}
                            className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                          />
                          <div>
                            <div className="font-mono text-xs font-bold text-foreground">
                              {stop.hex}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              STOP 0{idx + 1} · {stop.position}%
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStop(idx);
                          }}
                          disabled={stops.length <= 2}
                          aria-label={isEn ? "Remove stop" : "Eliminar parada"}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[stop.position]}
                        onValueChange={([val]) => handleUpdateStopPosition(idx, val)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT WALLPAPERS & DESIGN TOKENS */}
          {sidebarTab === "export" && (
            <div className="p-5 space-y-4">
              <div className="rounded-2xl bg-[#0c0e12] text-white p-4 border border-[#242936] space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#ff4d00]">
                  EXPORT // HIGH-RES ASSETS
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isEn
                    ? "Download your gradient as a crisp 1080p PNG backdrop or scalable SVG directly from local Canvas."
                    : "Descarga tu degradado como fondo PNG 1080p nítido o vector SVG escalable generado 100% en local."}
                </p>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isExportingPng}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1e40ff] hover:bg-[#1530cc] text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{isEn ? "Download PNG Wallpaper" : "Descargar Fondo PNG"}</span>
                    <span className="font-mono text-[10px] opacity-85">1920×1080</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{isEn ? "Download Scalable SVG" : "Descargar Vector SVG"}</span>
                    <span className="font-mono text-[10px] opacity-85">1600×900</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-background border border-border p-4 space-y-2.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  DESIGN TOKENS (JSON)
                </div>
                <pre className="text-[10px] font-mono text-muted-foreground bg-card p-3 rounded-xl border border-border max-h-44 overflow-auto">
                  {jsonTokens}
                </pre>
                <button
                  type="button"
                  onClick={() => copyText(jsonTokens, "json-tokens")}
                  className="w-full py-2 px-3 rounded-lg bg-[#0c0e12] hover:bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedToken === "json-tokens" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isEn ? "JSON Copied" : "JSON Copiado"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? "Copy JSON Tokens" : "Copiar Tokens JSON"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN PANORAMIC STUDIO CANVAS */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 bg-background studio-grid order-1 lg:order-2">
          {/* Top Canvas Switcher & Live Context Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border tactile-surface">
            <div
              role="tablist"
              aria-label={isEn ? "Gradient workspace view" : "Vista del espacio de degradados"}
              className="inline-flex items-center p-1 rounded-xl bg-muted border border-border"
            >
              <button
                type="button"
                role="tab"
                aria-selected={canvasView === "stage"}
                onClick={() => setCanvasView("stage")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  canvasView === "stage"
                    ? "bg-[#0c0e12] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isEn ? "Stage & Palette" : "Lienzo y Paleta"}</span>
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
                <Code2 className="w-3.5 h-3.5" />
                <span>{isEn ? "CSS, Tailwind & SVG" : "Código CSS, Tailwind y SVG"}</span>
              </button>
            </div>

            {canvasView === "stage" && (
              <div className="inline-flex items-center p-1 rounded-xl bg-background border border-border font-mono text-[10px]">
                {(
                  [
                    { id: "poster", es: "PÓSTER", en: "POSTER" },
                    { id: "ui-card", es: "TARJETA UI", en: "UI CARD" },
                    { id: "typography", es: "TIPOGRAFÍA", en: "TYPE" },
                  ] as const
                ).map((ctx) => (
                  <button
                    key={ctx.id}
                    type="button"
                    onClick={() => setStageContext(ctx.id)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      stageContext === ctx.id
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isEn ? ctx.en : ctx.es}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW 1: PANORAMIC OPTICAL GRADIENT STAGE + SWATCH SPECIMENS */}
          {canvasView === "stage" && (
            <>
              {/* Darkroom Framed Panoramic Gradient Canvas */}
              <div className="rounded-[1.5rem] bg-[#0c0e12] p-3 border border-[#242936] darkroom-chassis">
                <div
                  className="w-full min-h-[260px] sm:min-h-[340px] rounded-2xl relative overflow-hidden flex items-center justify-center p-6 transition-all duration-300"
                  style={{
                    background: cssGradient !== "none" ? cssGradient : "#14171f",
                  }}
                >
                  {/* Optional Subtle Optical Grain Overlay */}
                  {settings.grain > 0 && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 mix-blend-overlay"
                      style={{
                        opacity: settings.grain / 100,
                        backgroundImage:
                          "radial-gradient(rgba(255,255,255,0.65) 1px, transparent 0), radial-gradient(rgba(0,0,0,0.65) 1px, transparent 0)",
                        backgroundSize: "4px 4px",
                        backgroundPosition: "0 0, 2px 2px",
                      }}
                    />
                  )}

                  {/* Optical Corner Marks */}
                  <span className="pointer-events-none absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white/45" />
                  <span className="pointer-events-none absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white/45" />
                  <span className="pointer-events-none absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white/45" />
                  <span className="pointer-events-none absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white/45" />

                  {isProcessing && (
                    <div className="absolute inset-0 bg-[#0c0e12]/60 backdrop-blur-xs flex items-center justify-center z-20">
                      <span className="text-white text-xs font-mono bg-[#0c0e12] px-4 py-2 rounded-full border border-white/20">
                        {isEn ? "QUANTIZING CHROMA..." : "CUANTIZANDO PALETA..."}
                      </span>
                    </div>
                  )}

                  {/* Live Preview Context: UI Card */}
                  {stageContext === "ui-card" && (
                    <div className="relative z-10 max-w-sm w-full rounded-2xl bg-[#0c0e12]/68 backdrop-blur-xl border border-white/20 p-5 text-white shadow-2xl space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/75">
                        <span>CLEARCUT // CHROMA UI</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/15 text-white">
                          {settings.type.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-heading font-bold tracking-tight">
                        {isEn ? "Surface Depth Preview" : "Vista previa en tarjeta UI"}
                      </h3>
                      <p className="text-xs text-white/75 leading-relaxed">
                        {isEn
                          ? "Evaluate glassmorphism contrast and readability directly over your extracted gradient."
                          : "Evalúa contraste, desenfoque de cristal y legibilidad directamente sobre tu degradado."}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {stops.slice(0, 5).map((s) => (
                          <span
                            key={s.id}
                            className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: s.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Preview Context: Monumental Typography */}
                  {stageContext === "typography" && (
                    <div
                      className={`relative z-10 text-center max-w-xl px-4 ${
                        avgLuminanceDark ? "text-white" : "text-[#0c0e12]"
                      }`}
                    >
                      <div className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-80 mb-2">
                        OPTICAL CHROMA SPECIMEN
                      </div>
                      <h3 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-[-0.04em] leading-[0.98]">
                        {isEn ? "Extracted from light." : "Extraído de la luz."}
                      </h3>
                    </div>
                  )}

                  {/* Bottom Telemetry Pill */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                    <span className="px-3 py-1.5 rounded-lg bg-[#0c0e12]/80 backdrop-blur-md border border-white/15 text-white font-mono text-[11px]">
                      {settings.type === "linear"
                        ? `linear-gradient(${settings.angle}deg)`
                        : settings.type === "conic"
                        ? `conic-gradient(${settings.angle}deg)`
                        : settings.type === "mesh"
                        ? "mesh-gradient(organic)"
                        : "radial-gradient(circle)"}{" "}
                      · {stops.length} {isEn ? "stops" : "paradas"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Swiss Optical Pantone Swatch Grid */}
              <section
                aria-label={
                  isEn ? "Extracted Color Swatches" : "Muestras de color extraídas"
                }
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {isEn
                      ? "EXTRACTED CHROMA SPECIMENS (CLICK TO TARGET EYEDROPPER OR COPY)"
                      : "MUESTRAS CROMÁTICAS (CLIC PARA COPIAR HEX / RGB / HSL)"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {stops.map((color, i) => {
                    const hexKey = `hex-${i}`;
                    const rgbKey = `rgb-${i}`;
                    const hslKey = `hsl-${i}`;
                    const isSelected = selectedStopIdx === i;
                    const bestTextWhite = color.contrastWhite >= color.contrastBlack;
                    const bestRatio = Math.max(color.contrastWhite, color.contrastBlack);
                    const wcagGrade =
                      bestRatio >= 7 ? "AAA" : bestRatio >= 4.5 ? "AA" : "LARGE";

                    return (
                      <div
                        key={color.id}
                        onClick={() => setSelectedStopIdx(i)}
                        className={`rounded-2xl bg-card border overflow-hidden transition-all tactile-surface cursor-pointer ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        {/* Swatch Header Plate */}
                        <div
                          className="h-20 p-3 flex flex-col justify-between"
                          style={{ backgroundColor: color.hex }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                bestTextWhite
                                  ? "bg-black/30 text-white"
                                  : "bg-white/45 text-[#0c0e12]"
                              }`}
                            >
                              0{i + 1} · {color.position}%
                            </span>
                            <span
                              className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                bestTextWhite
                                  ? "bg-black/30 text-white"
                                  : "bg-white/45 text-[#0c0e12]"
                              }`}
                            >
                              {bestRatio}:1 {wcagGrade}
                            </span>
                          </div>
                        </div>

                        {/* Token Copy Buttons */}
                        <div className="p-2.5 space-y-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyText(color.hex, hexKey);
                            }}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted border border-border text-xs font-mono font-bold text-foreground cursor-pointer transition-colors"
                          >
                            <span>{color.hex}</span>
                            {copiedToken === hexKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyText(color.rgb, rgbKey);
                            }}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-1 rounded-md hover:bg-muted text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            <span className="truncate">{color.rgb}</span>
                            {copiedToken === rgbKey ? (
                              <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 opacity-60 shrink-0" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyText(color.hsl, hslKey);
                            }}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-1 rounded-md hover:bg-muted text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            <span className="truncate">{color.hsl}</span>
                            {copiedToken === hslKey ? (
                              <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 opacity-60 shrink-0" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Quick Live CSS Strip */}
              <div className="bg-[#0c0e12] text-white border border-[#242936] rounded-2xl flex flex-col sm:flex-row sm:items-center overflow-hidden shadow-sm">
                <div className="flex-1 px-4 py-3.5 font-mono text-xs text-slate-200 overflow-x-auto whitespace-nowrap">
                  <span className="text-[#60a5fa] font-semibold">background</span>:{" "}
                  {cssGradient};
                </div>
                <button
                  type="button"
                  onClick={() => copyText(`background: ${cssGradient};`, "strip-css")}
                  className="px-5 py-3.5 bg-[#1e40ff] hover:bg-[#1530cc] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedToken === "strip-css" ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEn ? "Copied!" : "¡Copiado!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isEn ? "Copy CSS" : "Copiar CSS"}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* VIEW 2: DARKROOM MULTI-FORMAT CODE STUDIO */}
          {canvasView === "code" && (
            <div className="rounded-2xl bg-[#0c0e12] text-white border border-[#242936] darkroom-chassis overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[#242936] bg-[#11141c] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: "css", label: "CSS", icon: FileCode2 },
                      { id: "tailwind", label: "Tailwind v4", icon: Sparkles },
                      { id: "variables", label: "CSS :root", icon: Layers },
                      { id: "svg", label: "SVG Vector", icon: Code2 },
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
                  onClick={() => copyText(activeCodeContent, `code-${codeTab}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {copiedToken === `code-${codeTab}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">
                        {isEn ? "COPIED" : "COPIADO"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? "COPY CODE" : "COPIAR CÓDIGO"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre">
                  {activeCodeContent}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
