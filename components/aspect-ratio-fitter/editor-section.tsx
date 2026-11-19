"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  ImagePlus,
  Frame,
  Layers,
  Maximize2,
  Grid3x3,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ArrowLeftRight,
  Upload,
  X,
  Plus,
  Trash2,
  Shuffle,
  Box,
} from "lucide-react";
import {
  AspectRatioSettings,
  DEFAULT_ASPECT_RATIO_SETTINGS,
  AspectRatioType,
  BackdropType,
  BackdropGradientMode,
  FrameStyle,
  ExportImageFormat,
} from "./types";
import { processFittedImage } from "./fitter";
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

type SidebarTab = "canvas" | "backdrop" | "frame";

const RATIO_PRESETS: Array<{
  value: AspectRatioType;
  label: string;
  subEs: string;
  subEn: string;
}> = [
  { value: "1:1", label: "1:1", subEs: "Feed / Cuadrado", subEn: "Square" },
  { value: "4:5", label: "4:5", subEs: "Instagram Post", subEn: "IG Portrait" },
  { value: "9:16", label: "9:16", subEs: "Reels / Stories", subEn: "Stories" },
  { value: "16:9", label: "16:9", subEs: "YouTube / Hero", subEn: "Widescreen" },
  { value: "3:2", label: "3:2", subEs: "Foto 35mm", subEn: "35mm Photo" },
  { value: "4:3", label: "4:3", subEs: "Presentación", subEn: "Slide" },
  { value: "21:9", label: "21:9", subEs: "Cinema / X", subEn: "Ultrawide" },
  { value: "2:3", label: "2:3", subEs: "Póster / Pin", subEn: "Poster" },
  { value: "original", label: "ORIG", subEs: "Original", subEn: "Original" },
  { value: "custom", label: "LIBRE", subEs: "Personalizado", subEn: "Custom" },
];

const SOLID_SWATCHES = [
  "#ffffff",
  "#f4f3ef",
  "#0c0e12",
  "#1e40ff",
  "#ff4d00",
  "#0f766e",
  "#e2e8f0",
  "#1f2430",
];

const GRADIENT_PRESETS: Array<{
  name: string;
  mode: BackdropGradientMode;
  colors: string[];
  angle: number;
}> = [
  { name: "Cobalt Night", mode: "linear", colors: ["#1e40ff", "#0c0e12"], angle: 135 },
  { name: "Darkroom Flame", mode: "linear", colors: ["#ff4d00", "#1e40ff", "#0c0e12"], angle: 125 },
  { name: "Aurora Mesh", mode: "mesh", colors: ["#1e40ff", "#0f766e", "#ff4d00", "#0c0e12"], angle: 135 },
  { name: "Prism Conic", mode: "conic", colors: ["#1e40ff", "#ec4899", "#ff4d00", "#0c0e12"], angle: 45 },
  { name: "Warm Studio", mode: "radial", colors: ["#f4f3ef", "#d6d1c4", "#9c9484"], angle: 160 },
  { name: "Cyber Violet", mode: "mesh", colors: ["#4f46e5", "#ec4899", "#0ea5e9", "#0c0e12"], angle: 120 },
];

const EXTRA_STOP_PALETTE = ["#ff4d00", "#0f766e", "#ec4899", "#f4f3ef"];

const FRAME_OPTIONS: Array<{
  id: FrameStyle;
  es: string;
  en: string;
  descEs: string;
  descEn: string;
}> = [
  { id: "none", es: "Sin marco", en: "No Frame", descEs: "Bordes limpios", descEn: "Clean edges" },
  { id: "gallery", es: "Galería", en: "Gallery", descEs: "Passe-partout", descEn: "Museum border" },
  { id: "museum", es: "Doble Museo", en: "Double Museum", descEs: "Bisel grabado", descEn: "Engraved bevel" },
  { id: "polaroid", es: "Polaroid", en: "Polaroid", descEs: "Instantánea", descEn: "Instant film" },
  { id: "film", es: "Película 35mm", en: "35mm Film", descEs: "Perforaciones", descEn: "Sprocket strip" },
  { id: "window", es: "Ventana macOS", en: "macOS Window", descEs: "Semáforos", descEn: "Traffic lights" },
  { id: "browser", es: "Navegador Pro", en: "Pro Browser", descEs: "Barra + URL", descEn: "Chrome + URL" },
  { id: "glass", es: "Cristal Glass", en: "Glass Bezel", descEs: "Translúcido", descEn: "Frosted rim" },
  { id: "neon", es: "Neón Glow", en: "Neon Glow", descEs: "Halo luminoso", descEn: "Luminous halo" },
  { id: "editorial", es: "Editorial Suizo", en: "Swiss Editorial", descEs: "Pie técnico", descEn: "Caption bar" },
];

const THREE_D_PRESETS = [
  { id: "flat", es: "Plano", en: "Flat", rx: 0, ry: 0, rz: 0, oz: 0 },
  { id: "iso-l", es: "3D Izq", en: "3D Left", rx: 10, ry: 18, rz: -3, oz: 12 },
  { id: "iso-r", es: "3D Der", en: "3D Right", rx: 10, ry: -18, rz: 3, oz: 12 },
  { id: "float", es: "Flotante", en: "Floating", rx: 16, ry: -10, rz: -4, oz: 20 },
] as const;

export function EditorSection({
  imageSrc,
  onReset,
  onClose,
  dict,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const [settings, setSettings] = useState<AspectRatioSettings>(
    DEFAULT_ASPECT_RATIO_SETTINGS
  );
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("canvas");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [outputDims, setOutputDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [showThirdsGrid, setShowThirdsGrid] = useState(false);

  // Interactive drag-to-reposition on the live canvas
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const stageBoxRef = useRef<HTMLDivElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Render live fast preview (max 1080px for snappy real-time feel)
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const res = await processFittedImage(imageSrc, settings, 1080);
        if (!active) return;
        setPreviewSrc(res.dataUrl);
        setOutputDims({ w: res.width, h: res.height });
      } catch (err) {
        console.error("Failed to render fitted preview:", err);
      }
    }, 55);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [imageSrc, settings]);

  const handleUploadBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setSettings((s) => ({
          ...s,
          backgroundType: "image",
          backgroundImageSrc: result,
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const { dataUrl } = await processFittedImage(imageSrc, settings, 2400);
      const a = document.createElement("a");
      a.href = dataUrl;
      const ext =
        settings.backgroundType === "transparent" ? "png" : settings.exportFormat;
      const ratioTag =
        settings.ratio === "custom"
          ? `${settings.customWidth}x${settings.customHeight}`
          : settings.ratio.replace(":", "x");
      a.download = `clearcut-frame-${ratioTag}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!stageBoxRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingStage(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: settings.offsetX,
      oy: settings.offsetY,
    };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current || !stageBoxRef.current) return;
    const rect = stageBoxRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const dyPct = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    setSettings((s) => ({
      ...s,
      offsetX: Math.max(-50, Math.min(50, Math.round(dragStartRef.current!.ox + dxPct))),
      offsetY: Math.max(-50, Math.min(50, Math.round(dragStartRef.current!.oy + dyPct))),
    }));
  }, []);

  const handlePointerUp = () => {
    setIsDraggingStage(false);
    dragStartRef.current = null;
  };

  const flipCustomRatio = () => {
    setSettings((s) => ({
      ...s,
      customWidth: s.customHeight,
      customHeight: s.customWidth,
    }));
  };

  // Multi-color Gradient helpers (2 to 4 colors)
  const handleAddGradientColor = () => {
    setSettings((s) => {
      if (s.gradientColors.length >= 4) return s;
      const nextColor =
        EXTRA_STOP_PALETTE.find((c) => !s.gradientColors.includes(c)) || "#ff4d00";
      return { ...s, gradientColors: [...s.gradientColors, nextColor] };
    });
  };

  const handleUpdateGradientColor = (idx: number, hex: string) => {
    setSettings((s) => ({
      ...s,
      gradientColors: s.gradientColors.map((c, i) => (i === idx ? hex : c)),
    }));
  };

  const handleRemoveGradientColor = (idx: number) => {
    setSettings((s) => {
      if (s.gradientColors.length <= 2) return s;
      return {
        ...s,
        gradientColors: s.gradientColors.filter((_, i) => i !== idx),
      };
    });
  };

  const handleReverseGradientColors = () => {
    setSettings((s) => ({
      ...s,
      gradientColors: [...s.gradientColors].reverse(),
    }));
  };

  const handleShuffleGradientColors = () => {
    setSettings((s) => {
      const copy = [...s.gradientColors];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return { ...s, gradientColors: copy };
    });
  };

  const resetTransform3D = () => {
    setSettings((s) => ({
      ...s,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 82,
    }));
  };

  const hasCustomTransform =
    settings.offsetX !== 0 ||
    settings.offsetY !== 0 ||
    settings.offsetZ !== 0 ||
    settings.rotateX !== 0 ||
    settings.rotateY !== 0 ||
    settings.rotateZ !== 0 ||
    settings.scale !== 82;

  const ratioLabel =
    settings.ratio === "custom"
      ? `${settings.customWidth}:${settings.customHeight}`
      : settings.ratio.toUpperCase();

  const frameSupportsColor =
    settings.frameStyle === "gallery" ||
    settings.frameStyle === "museum" ||
    settings.frameStyle === "polaroid" ||
    settings.frameStyle === "editorial" ||
    settings.frameStyle === "neon";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="aspect-ratio-fitter"
        lang={lang}
        onClose={onClose || onReset}
        centerSlot={
          outputDims.w > 0 ? (
            <span className="font-mono text-xs font-semibold text-foreground px-2.5 py-1 rounded-full bg-muted border border-border tabular-nums">
              {outputDims.w} × {outputDims.h} px · {ratioLabel}
            </span>
          ) : null
        }
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
              onClick={handleDownload}
              disabled={isExporting || !previewSrc}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0c0e12] hover:bg-primary disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all tactile-button cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {isExporting
                  ? isEn
                    ? "Exporting..."
                    : "Exportando..."
                  : isEn
                  ? `Download ${
                      settings.backgroundType === "transparent"
                        ? "PNG"
                        : settings.exportFormat.toUpperCase()
                    }`
                  : `Descargar ${
                      settings.backgroundType === "transparent"
                        ? "PNG"
                        : settings.exportFormat.toUpperCase()
                    }`}
              </span>
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden bg-background">
        {/* LEFT SIDEBAR: 3-TAB OPTICAL FRAMING CONSOLE */}
        <aside className="w-full lg:w-[375px] border-t lg:border-t-0 lg:border-r border-border bg-card flex flex-col shrink-0 order-2 lg:order-1 lg:overflow-y-auto">
          {/* Sidebar Tabs */}
          <div className="p-3 border-b border-border bg-background/60">
            <div
              role="tablist"
              aria-label={isEn ? "Framing controls" : "Controles de encuadre"}
              className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted border border-border"
            >
              {(
                [
                  { id: "canvas", icon: Maximize2, label: isEn ? "Canvas 3D" : "Lienzo 3D" },
                  { id: "backdrop", icon: Layers, label: isEn ? "Backdrop" : "Fondo" },
                  { id: "frame", icon: Frame, label: isEn ? "Frames" : "Marcos" },
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

          {/* TAB 1: CANVAS RATIO, SCALE & 3D POSITION (X, Y, Z + TILT) */}
          {sidebarTab === "canvas" && (
            <div className="p-5 space-y-5">
              {/* Aspect Ratio Visual Selector */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Aspect Ratio & Custom" : "Proporción y Formato Libre"}
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {RATIO_PRESETS.map((opt) => {
                    const active = settings.ratio === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, ratio: opt.value }))}
                        className={`px-3 py-1.5 rounded-xl text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                          active
                            ? "bg-[#0c0e12] text-white border-[#0c0e12] shadow-xs"
                            : "bg-background text-foreground border-border hover:border-foreground/35"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold">{opt.label}</span>
                        <span
                          className={`text-[10px] truncate ${
                            active ? "text-slate-300" : "text-muted-foreground"
                          }`}
                        >
                          {isEn ? opt.subEn : opt.subEs}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Free Ratio W × H Inputs */}
                {settings.ratio === "custom" && (
                  <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-2.5 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase text-primary">
                        {isEn ? "FREE CUSTOM RATIO" : "PROPORCIÓN LIBRE (W : H)"}
                      </span>
                      <button
                        type="button"
                        onClick={flipCustomRatio}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-card border border-border font-mono text-[10px] text-foreground hover:border-primary cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>W ⇄ H</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label
                          htmlFor="custom-ratio-w"
                          className="text-[10px] font-mono text-muted-foreground block mb-1"
                        >
                          {isEn ? "Width" : "Ancho"}
                        </label>
                        <input
                          id="custom-ratio-w"
                          type="number"
                          min={1}
                          max={4000}
                          value={settings.customWidth}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              customWidth: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border font-mono text-xs text-foreground"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="custom-ratio-h"
                          className="text-[10px] font-mono text-muted-foreground block mb-1"
                        >
                          {isEn ? "Height" : "Alto"}
                        </label>
                        <input
                          id="custom-ratio-h"
                          type="number"
                          min={1}
                          max={4000}
                          value={settings.customHeight}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              customHeight: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border font-mono text-xs text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Foreground Scale (15% to 180%) */}
              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Image Scale (15%–180%)" : "Tamaño de imagen (15%–180%)"}
                  </Label>
                  <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border text-foreground tabular-nums">
                    {settings.scale}%
                  </span>
                </div>
                <Slider
                  min={15}
                  max={180}
                  step={1}
                  value={[settings.scale]}
                  onValueChange={([val]) => setSettings((s) => ({ ...s, scale: val }))}
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {[55, 80, 100, 135].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, scale: sc }))}
                      className={`py-1 rounded-md font-mono text-[10px] font-semibold border cursor-pointer transition-colors ${
                        settings.scale === sc
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {sc}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D POSITION (X, Y, Z) & PERSPECTIVE */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-[#ff4d00]" />
                    <span>{isEn ? "3D Position & Perspective" : "Posición 3D (X · Y · Z)"}</span>
                  </Label>
                  {hasCustomTransform && (
                    <button
                      type="button"
                      onClick={resetTransform3D}
                      className="text-[10px] font-mono font-bold text-primary hover:underline cursor-pointer"
                    >
                      {isEn ? "Reset 3D" : "Reset 3D"}
                    </button>
                  )}
                </div>

                {/* Quick 3D Perspective Presets */}
                <div className="grid grid-cols-4 gap-1">
                  {THREE_D_PRESETS.map((p) => {
                    const active =
                      settings.rotateX === p.rx &&
                      settings.rotateY === p.ry &&
                      settings.rotateZ === p.rz &&
                      settings.offsetZ === p.oz;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            rotateX: p.rx,
                            rotateY: p.ry,
                            rotateZ: p.rz,
                            offsetZ: p.oz,
                          }))
                        }
                        className={`py-1.5 rounded-lg font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                          active
                            ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {isEn ? p.en : p.es}
                      </button>
                    );
                  })}
                </div>

                {/* X, Y, Z Position Sliders */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">X</span>
                      <span>{settings.offsetX}%</span>
                    </div>
                    <Slider
                      min={-50}
                      max={50}
                      step={1}
                      value={[settings.offsetX]}
                      onValueChange={([val]) => setSettings((s) => ({ ...s, offsetX: val }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">Y</span>
                      <span>{settings.offsetY}%</span>
                    </div>
                    <Slider
                      min={-50}
                      max={50}
                      step={1}
                      value={[settings.offsetY]}
                      onValueChange={([val]) => setSettings((s) => ({ ...s, offsetY: val }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span className="font-bold text-[#ff4d00]">Z</span>
                      <span>{settings.offsetZ}</span>
                    </div>
                    <Slider
                      min={-40}
                      max={40}
                      step={1}
                      value={[settings.offsetZ]}
                      onValueChange={([val]) => setSettings((s) => ({ ...s, offsetZ: val }))}
                    />
                  </div>
                </div>

                {/* 3D Rotation Sliders (Tilt X, Tilt Y, Roll Z) */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>Tilt X</span>
                      <span>{settings.rotateX}°</span>
                    </div>
                    <Slider
                      min={-35}
                      max={35}
                      step={1}
                      value={[settings.rotateX]}
                      onValueChange={([val]) => setSettings((s) => ({ ...s, rotateX: val }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>Tilt Y</span>
                      <span>{settings.rotateY}°</span>
                    </div>
                    <Slider
                      min={-35}
                      max={35}
                      step={1}
                      value={[settings.rotateY]}
                      onValueChange={([val]) => setSettings((s) => ({ ...s, rotateY: val }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>Rot Z</span>
                      <span>{settings.rotateZ}°</span>
                    </div>
                    <Slider
                      min={-45}
                      max={45}
                      step={1}
                      value={[settings.rotateZ]}
                      onValueChange={([val]) => setSettings((s) => ({ ...s, rotateZ: val }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKDROP STUDIO (BLUR, SOLID, MULTI-MODE 2-4 COLOR GRADIENT, IMAGE, TRANSPARENT) */}
          {sidebarTab === "backdrop" && (
            <div className="p-5 space-y-5">
              {/* 5 Backdrop Modes */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Backdrop Mode" : "Tipo de fondo"}
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "blur", es: "Desenfoque", en: "Smart Blur" },
                      { id: "color", es: "Color sólido", en: "Solid Color" },
                      { id: "gradient", es: "Degradado", en: "Gradient" },
                      { id: "image", es: "Imagen propia", en: "Custom Image" },
                      { id: "transparent", es: "Transparente (PNG)", en: "Transparent (PNG)" },
                    ] as Array<{ id: BackdropType; es: string; en: string }>
                  ).map((mode, idx) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, backgroundType: mode.id }))
                      }
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        idx === 4 ? "col-span-2" : ""
                      } ${
                        settings.backgroundType === mode.id
                          ? "bg-[#0c0e12] text-white border-[#0c0e12] shadow-xs"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {isEn ? mode.en : mode.es}
                    </button>
                  ))}
                </div>
              </div>

              {/* BLUR CONTROLS */}
              {settings.backgroundType === "blur" && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground uppercase font-bold">
                        {isEn ? "Blur Radius" : "Desenfoque"}
                      </span>
                      <span className="text-foreground font-bold">{settings.blurAmount}px</span>
                    </div>
                    <Slider
                      min={0}
                      max={50}
                      step={1}
                      value={[settings.blurAmount]}
                      onValueChange={([val]) =>
                        setSettings((s) => ({ ...s, blurAmount: val }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground uppercase font-bold">
                        {isEn ? "Backdrop Dim" : "Oscurecer fondo"}
                      </span>
                      <span className="text-foreground font-bold">{settings.backdropDim}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={60}
                      step={1}
                      value={[settings.backdropDim]}
                      onValueChange={([val]) =>
                        setSettings((s) => ({ ...s, backdropDim: val }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* SOLID COLOR CONTROLS */}
              {settings.backgroundType === "color" && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Solid Swatches" : "Colores de estudio"}
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {SOLID_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        aria-label={`Color ${hex}`}
                        onClick={() =>
                          setSettings((s) => ({ ...s, backgroundColor: hex }))
                        }
                        className={`h-9 rounded-lg border transition-transform cursor-pointer hover:scale-105 ${
                          settings.backgroundColor.toLowerCase() === hex
                            ? "ring-2 ring-primary ring-offset-1 border-primary"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="color"
                      aria-label={isEn ? "Custom backdrop color" : "Color personalizado"}
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, backgroundColor: e.target.value }))
                      }
                      className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                    />
                    <span className="font-mono text-xs font-bold uppercase text-foreground">
                      {settings.backgroundColor}
                    </span>
                  </div>
                </div>
              )}

              {/* ADVANCED MULTI-MODE 2-TO-4 COLOR GRADIENT CONTROLS */}
              {settings.backgroundType === "gradient" && (
                <div className="space-y-4 pt-2 border-t border-border">
                  {/* 4 Gradient Styles (Linear, Radial, Conic, Mesh) */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      {isEn ? "Gradient Style" : "Estilo de degradado"}
                    </Label>
                    <div className="grid grid-cols-4 gap-1">
                      {(
                        [
                          { id: "linear", es: "Lineal", en: "Linear" },
                          { id: "radial", es: "Radial", en: "Radial" },
                          { id: "conic", es: "Cónico", en: "Conic" },
                          { id: "mesh", es: "Mesh", en: "Mesh" },
                        ] as Array<{ id: BackdropGradientMode; es: string; en: string }>
                      ).map((gm) => (
                        <button
                          key={gm.id}
                          type="button"
                          onClick={() =>
                            setSettings((s) => ({ ...s, gradientMode: gm.id }))
                          }
                          className={`py-1.5 rounded-lg font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                            settings.gradientMode === gm.id
                              ? "bg-primary text-white border-primary"
                              : "bg-background text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {isEn ? gm.en : gm.es}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic 2-to-4 Color Stops */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {isEn
                          ? `COLORS (${settings.gradientColors.length}/4)`
                          : `COLORES (${settings.gradientColors.length}/4)`}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddGradientColor}
                        disabled={settings.gradientColors.length >= 4}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0c0e12] hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isEn ? "Add color" : "Añadir color"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {settings.gradientColors.map((hex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-1.5 p-1.5 rounded-xl border border-border bg-background"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="color"
                              aria-label={`Gradient color ${idx + 1}`}
                              value={hex}
                              onChange={(e) =>
                                handleUpdateGradientColor(idx, e.target.value)
                              }
                              className="w-7 h-7 rounded-md cursor-pointer border-0 bg-transparent shrink-0"
                            />
                            <span className="font-mono text-[10px] font-bold uppercase text-foreground truncate">
                              {hex}
                            </span>
                          </div>
                          {settings.gradientColors.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGradientColor(idx)}
                              aria-label={isEn ? "Remove color" : "Quitar color"}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={handleReverseGradientColors}
                        className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-background hover:bg-muted border border-border text-[10px] font-semibold text-foreground cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3 h-3 text-primary" />
                        <span>{isEn ? "Invert" : "Invertir"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleShuffleGradientColors}
                        className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-background hover:bg-muted border border-border text-[10px] font-semibold text-foreground cursor-pointer"
                      >
                        <Shuffle className="w-3 h-3 text-primary" />
                        <span>{isEn ? "Shuffle" : "Mezclar"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Angle Control (Linear & Conic) */}
                  {(settings.gradientMode === "linear" ||
                    settings.gradientMode === "conic") && (
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-muted-foreground uppercase font-bold">
                          {isEn ? "Angle" : "Ángulo"}
                        </span>
                        <span className="text-foreground font-bold">
                          {settings.gradientAngle}°
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={360}
                        step={1}
                        value={[settings.gradientAngle]}
                        onValueChange={([val]) =>
                          setSettings((s) => ({ ...s, gradientAngle: val }))
                        }
                      />
                    </div>
                  )}

                  {/* Curated Multi-Color Presets */}
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <Label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      {isEn ? "Curated Presets" : "Degradados curados"}
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {GRADIENT_PRESETS.map((g) => (
                        <button
                          key={g.name}
                          type="button"
                          title={g.name}
                          onClick={() =>
                            setSettings((s) => ({
                              ...s,
                              gradientMode: g.mode,
                              gradientColors: [...g.colors],
                              gradientAngle: g.angle,
                            }))
                          }
                          className="h-10 rounded-xl border border-black/15 hover:scale-105 transition-transform cursor-pointer shadow-xs relative overflow-hidden"
                          style={{
                            background: `linear-gradient(${g.angle}deg, ${g.colors.join(", ")})`,
                          }}
                        >
                          <span className="absolute bottom-0.5 right-1 text-[8px] font-mono uppercase text-white/90 drop-shadow">
                            {g.mode}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOM BACKGROUND IMAGE UPLOADER */}
              {settings.backgroundType === "image" && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBgImage}
                    className="hidden"
                  />

                  {settings.backgroundImageSrc ? (
                    <div className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-[16/9]">
                      <img
                        src={settings.backgroundImageSrc}
                        alt="Custom backdrop"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => bgFileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-md bg-[#0c0e12]/85 text-white text-[10px] font-mono font-semibold cursor-pointer hover:bg-primary"
                        >
                          {isEn ? "Change" : "Cambiar"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSettings((s) => ({ ...s, backgroundImageSrc: null }))
                          }
                          aria-label={isEn ? "Remove background image" : "Quitar imagen de fondo"}
                          className="p-1 rounded-md bg-[#0c0e12]/85 text-white hover:bg-destructive cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-border hover:border-primary bg-background hover:bg-muted/40 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        {isEn ? "Upload background image" : "Subir imagen de fondo"}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        PNG · JPG · WebP · 100% Local
                      </span>
                    </button>
                  )}

                  {/* Quick Studio Demo Backdrops */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                      {isEn ? "Or pick a studio backdrop:" : "O prueba un fondo de estudio:"}
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { src: "/demos/coffee.jpg", name: "Warm" },
                        { src: "/demos/shoes.jpg", name: "Concrete" },
                        { src: "/demos/car.jpg", name: "Forest" },
                      ].map((item) => (
                        <button
                          key={item.src}
                          type="button"
                          onClick={() =>
                            setSettings((s) => ({
                              ...s,
                              backgroundType: "image",
                              backgroundImageSrc: item.src,
                            }))
                          }
                          className={`relative aspect-[4/3] rounded-lg overflow-hidden border cursor-pointer transition-all ${
                            settings.backgroundImageSrc === item.src
                              ? "ring-2 ring-primary border-primary"
                              : "border-border hover:border-foreground/40"
                          }`}
                        >
                          <img
                            src={item.src}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Blur & Dim on Custom Background Image */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-muted-foreground uppercase font-bold">
                          {isEn ? "Backdrop Blur" : "Desenfoque de fondo"}
                        </span>
                        <span className="font-bold">{settings.blurAmount}px</span>
                      </div>
                      <Slider
                        min={0}
                        max={40}
                        step={1}
                        value={[settings.blurAmount]}
                        onValueChange={([val]) =>
                          setSettings((s) => ({ ...s, blurAmount: val }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-muted-foreground uppercase font-bold">
                          {isEn ? "Backdrop Dim" : "Oscurecer fondo"}
                        </span>
                        <span className="font-bold">{settings.backdropDim}%</span>
                      </div>
                      <Slider
                        min={0}
                        max={60}
                        step={1}
                        value={[settings.backdropDim]}
                        onValueChange={([val]) =>
                          setSettings((s) => ({ ...s, backdropDim: val }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TRANSPARENT INFO */}
              {settings.backgroundType === "transparent" && (
                <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed">
                  {isEn
                    ? "Exports a crisp transparent PNG preserving alpha channel around your fitted image."
                    : "Exporta un archivo PNG transparente conservando el canal alpha alrededor de tu imagen."}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 10 ARTISTIC & HARDWARE FRAMES, RADIUS, SHADOW & EXPORT */}
          {sidebarTab === "frame" && (
            <div className="p-5 space-y-5">
              {/* 10 Frame Styles in crisp 2-col grid */}
              <div className="space-y-2">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Frame Styles (10)" : "Estilos de marco (10)"}
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FRAME_OPTIONS.map((f) => {
                    const active = settings.frameStyle === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, frameStyle: f.id }))}
                        className={`px-3 py-2 rounded-xl text-left border transition-all flex flex-col gap-0.5 cursor-pointer ${
                          active
                            ? "bg-[#0c0e12] text-white border-[#0c0e12] shadow-xs"
                            : "bg-background text-foreground border-border hover:border-foreground/35"
                        }`}
                      >
                        <span className="text-xs font-bold truncate">
                          {isEn ? f.en : f.es}
                        </span>
                        <span
                          className={`font-mono text-[9px] truncate ${
                            active ? "text-slate-300" : "text-muted-foreground"
                          }`}
                        >
                          {isEn ? f.descEn : f.descEs}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frame / Neon Color */}
              {frameSupportsColor && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {settings.frameStyle === "neon"
                      ? isEn
                        ? "Neon Glow Color"
                        : "Color del neón"
                      : isEn
                      ? "Frame Color"
                      : "Color del marco"}
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {(settings.frameStyle === "neon"
                      ? ["#1e40ff", "#ff4d00", "#10b981", "#ec4899", "#38bdf8"]
                      : ["#ffffff", "#f4f3ef", "#0c0e12", "#1e2330", "#1e40ff"]
                    ).map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, frameColor: col }))}
                        className={`w-7 h-7 rounded-lg border cursor-pointer ${
                          settings.frameColor.toLowerCase() === col
                            ? "ring-2 ring-primary ring-offset-1 border-primary"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                    <input
                      type="color"
                      aria-label="Custom frame color"
                      value={settings.frameColor}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, frameColor: e.target.value }))
                      }
                      className="w-7 h-7 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                    />
                  </div>
                </div>
              )}

              {/* Border Radius */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground uppercase font-bold">
                    {isEn ? "Corner Radius" : "Redondeo de esquinas"}
                  </span>
                  <span className="font-bold text-foreground">{settings.borderRadius}px</span>
                </div>
                <Slider
                  min={0}
                  max={48}
                  step={1}
                  value={[settings.borderRadius]}
                  onValueChange={([val]) =>
                    setSettings((s) => ({ ...s, borderRadius: val }))
                  }
                />
              </div>

              {/* Drop Shadow */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground uppercase font-bold">
                    {isEn ? "Elevation Shadow" : "Sombra física"}
                  </span>
                  <span className="font-bold text-foreground">
                    {settings.shadowIntensity}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[settings.shadowIntensity]}
                  onValueChange={([val]) =>
                    setSettings((s) => ({ ...s, shadowIntensity: val }))
                  }
                />
              </div>

              {/* Export Format Selector */}
              <div className="space-y-2 pt-3 border-t border-border">
                <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Export Format" : "Formato de descarga"}
                </Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["png", "jpg", "webp"] as ExportImageFormat[]).map((fmt) => {
                    const forcedPng =
                      settings.backgroundType === "transparent" && fmt !== "png";
                    const active =
                      (settings.backgroundType === "transparent"
                        ? "png"
                        : settings.exportFormat) === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        disabled={forcedPng}
                        onClick={() =>
                          setSettings((s) => ({ ...s, exportFormat: fmt }))
                        }
                        className={`py-2 rounded-lg font-mono text-xs font-bold uppercase border transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                          active
                            ? "bg-primary text-white border-primary"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN INTERACTIVE DARKROOM STAGE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5 bg-background studio-grid order-1 lg:order-2">
          {/* Top Stage Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border tactile-surface">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-xl bg-muted border border-border p-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setSettings((s) => ({ ...s, scale: Math.max(15, s.scale - 10) }))
                  }
                  aria-label={isEn ? "Shrink image" : "Reducir imagen"}
                  className="p-1.5 rounded-lg hover:bg-card text-foreground cursor-pointer transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 font-mono text-xs font-bold tabular-nums text-foreground">
                  {settings.scale}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((s) => ({ ...s, scale: Math.min(180, s.scale + 10) }))
                  }
                  aria-label={isEn ? "Enlarge image" : "Agrandar imagen"}
                  className="p-1.5 rounded-lg hover:bg-card text-foreground cursor-pointer transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowThirdsGrid((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold border transition-colors cursor-pointer ${
                  showThirdsGrid
                    ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                <span>3×3</span>
              </button>

              {hasCustomTransform && (
                <button
                  type="button"
                  onClick={resetTransform3D}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-background hover:bg-muted border border-border font-mono text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isEn ? "Reset 3D" : "Centrar 3D"}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <Move className="w-3 h-3" />
                <span>
                  {isEn ? "Drag canvas to move X/Y" : "Arrastra el visor para mover X/Y"}
                </span>
              </span>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting || !previewSrc}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-accent font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isEn ? "Export" : "Exportar"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Darkroom Framing Viewport */}
          <div className="flex-1 min-h-[420px] rounded-[1.5rem] bg-[#0c0e12] border border-[#242936] darkroom-chassis p-4 sm:p-6 flex items-center justify-center relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 darkroom-grid opacity-60" />

            <div
              ref={stageBoxRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative z-10 flex items-center justify-center max-w-full max-h-[68vh] select-none touch-none ${
                isDraggingStage ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {previewSrc ? (
                <div
                  className={`relative rounded-xl overflow-hidden shadow-2xl border border-white/15 ${
                    settings.backgroundType === "transparent" ? "checkerboard-dark" : ""
                  }`}
                >
                  <img
                    src={previewSrc}
                    alt={isEn ? "Fitted aspect ratio preview" : "Vista previa ajustada"}
                    className="max-w-full max-h-[66vh] w-auto h-auto object-contain block pointer-events-none"
                    draggable={false}
                  />

                  {showThirdsGrid && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
                    >
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <div key={idx} className="border border-white/25" />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 font-mono text-xs px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  {isEn ? "RENDERING OPTICAL FRAME..." : "RENDERIZANDO LIENZO..."}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
