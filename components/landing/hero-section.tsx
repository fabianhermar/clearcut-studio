"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { STUDIO_TOOLS, type ToolSlug } from "@/lib/tools-catalog";
import { ToolIcon } from "@/components/studio/tool-icon";
import {
  ArrowUpRight,
  Crosshair,
  MoveHorizontal,
  Upload,
  Check,
  Copy,
  Eye,
  Scan,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  Pipette,
} from "lucide-react";

interface HeroSectionProps {
  onStartApp: () => void;
  onStartOptimizer: () => void;
  onStartMockupGenerator?: () => void;
  onSelectTool?: (slug: ToolSlug) => void;
  onLaunchToolWithFile?: (slug: ToolSlug, file: File) => void;
  onSelectDemo: (src: string) => void;
  comparisonPos: number;
  setComparisonPos: (pos: number) => void;
  dict?: any;
  lang?: string;
}

type ActiveLensSlug =
  | "background-remover"
  | "image-optimizer"
  | "exif-stripper"
  | "aspect-ratio-fitter"
  | "gradient-extractor"
  | "favicon-generator";

type RatioId = "1:1" | "4:5" | "9:16" | "16:9";
type FillMode = "blur" | "obsidian" | "paper";

interface LensMeta {
  slug: ActiveLensSlug;
  code: string;
  opticLabel: string;
  specEs: string;
  specEn: string;
  hintEs: string;
  hintEn: string;
  supportsSplit: boolean;
}

const LENSES: LensMeta[] = [
  {
    slug: "background-remover",
    code: "01",
    opticLabel: "ALPHA // NEURAL CUTOUT",
    specEs: "ONNX · Recorte + Pincel",
    specEn: "ONNX · Cutout + Brush",
    hintEs: "Mueve el cursor (o ← →) para revelar el canal alpha con la lupa óptica.",
    hintEn: "Move cursor (or ← →) to reveal the alpha channel with the optical loupe.",
    supportsSplit: true,
  },
  {
    slug: "image-optimizer",
    code: "02",
    opticLabel: "WASM // LIBAVIF 2× LOUPE",
    specEs: "AVIF · WebP · -90% peso",
    specEn: "AVIF · WebP · -90% size",
    hintEs: "Inspecciona nitidez 2× y alterna calidad AVIF en tiempo real.",
    hintEn: "Inspect 2× edge fidelity and toggle AVIF quality presets live.",
    supportsSplit: true,
  },
  {
    slug: "exif-stripper",
    code: "03",
    opticLabel: "EXIF // PRIVACY X-RAY",
    specEs: "GPS · Cámara · 0 metadatos",
    specEn: "GPS · Camera · 0 metadata",
    hintEs: "Pasa el visor sobre la foto para detectar y purgar GPS y datos de cámara.",
    hintEn: "Sweep the lens across the photo to scrub leaked GPS and camera data.",
    supportsSplit: true,
  },
  {
    slug: "aspect-ratio-fitter",
    code: "04",
    opticLabel: "FRAME // NO-CROP FITTER",
    specEs: "1:1 · 4:5 · 9:16 · 16:9",
    specEn: "1:1 · 4:5 · 9:16 · 16:9",
    hintEs: "Cambia la relación de aspecto y el relleno sin mutilar el encuadre.",
    hintEn: "Switch social ratios and backdrop fill without cropping your frame.",
    supportsSplit: false,
  },
  {
    slug: "gradient-extractor",
    code: "05",
    opticLabel: "CHROMA // LIVE COLORIMETER",
    specEs: "Muestreo real HEX + CSS",
    specEn: "Live HEX sampler + CSS",
    hintEs: "Mueve el cuentagotas sobre la imagen para leer píxeles reales y haz clic para fijar color.",
    hintEn: "Move the eyedropper over the image to sample real pixels; click to pin a swatch.",
    supportsSplit: false,
  },
  {
    slug: "favicon-generator",
    code: "06",
    opticLabel: "PWA // MULTI-SURFACE ICONS",
    specEs: "ICO · Apple · Manifest ZIP",
    specEn: "ICO · Apple · Manifest ZIP",
    hintEs: "Previsualiza pestañas claro/oscuro, Google e iconos móviles al instante.",
    hintEn: "Preview light/dark browser tabs, Google SERP, and mobile icons instantly.",
    supportsSplit: false,
  },
];

const QUALITY_PRESETS = [
  { q: 55, kb: 198, savings: 92, label: "Q55 · ULTRA" },
  { q: 75, kb: 245, savings: 90, label: "Q75 · BALANCED" },
  { q: 90, kb: 412, savings: 83, label: "Q90 · MASTER" },
] as const;

const RATIO_PRESETS: Record<
  RatioId,
  { label: string; dims: string; boxClass: string }
> = {
  "1:1": { label: "1:1", dims: "1080 × 1080", boxClass: "aspect-square w-[58%] max-w-[235px]" },
  "4:5": { label: "4:5", dims: "1080 × 1350", boxClass: "aspect-[4/5] w-[49%] max-w-[205px]" },
  "9:16": { label: "9:16", dims: "1080 × 1920", boxClass: "aspect-[9/16] h-[86%] w-auto" },
  "16:9": { label: "16:9", dims: "1920 × 1080", boxClass: "aspect-[16/9] w-[86%] max-w-[390px]" },
};

const EXIF_LEAKS = [
  { id: "gps", x: 27, y: 28, tag: "GPS", val: "47.6062° N, 122.33° W" },
  { id: "cam", x: 73, y: 27, tag: "BODY", val: "SONY ILCE-7M4" },
  { id: "lens", x: 26, y: 72, tag: "OPTIC", val: "FE 35mm · ISO 200" },
  { id: "time", x: 74, y: 72, tag: "DATE", val: "2026:10:14 18:42" },
];

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function HeroSection({
  onStartApp,
  onStartOptimizer,
  onSelectTool,
  onLaunchToolWithFile,
  onSelectDemo,
  comparisonPos,
  setComparisonPos,
  lang = "es",
}: HeroSectionProps) {
  const isEs = lang === "es";

  // Active optical instrument state
  const [activeLens, setActiveLens] = useState<ActiveLensSlug>("background-remover");
  const [viewMode, setViewMode] = useState<"loupe" | "split">("loupe");
  const [peeledAlpha, setPeeledAlpha] = useState(false);
  const [shutterTick, setShutterTick] = useState(0);

  // Interactive pointer / loupe position in percentages (0..100)
  const [lensPos, setLensPos] = useState({ x: 52, y: 46 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsCompactViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const loupeRadius = isCompactViewport ? 64 : 96;
  const loupeDiameter = loupeRadius * 2;

  // Lens-specific interactive controls
  const [qualityIdx, setQualityIdx] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<RatioId>("4:5");
  const [fillMode, setFillMode] = useState<FillMode>("blur");
  const [faviconDark, setFaviconDark] = useState(true);

  // Real Canvas Colorimeter state (Lens 05)
  const [liveColor, setLiveColor] = useState({ hex: "#163B66", rgb: "22, 59, 102" });
  const [pinnedSwatches, setPinnedSwatches] = useState<string[]>([
    "#163B66",
    "#3B4E5C",
    "#C8924A",
    "#0C0E12",
  ]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Global Hero Drag & Drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const samplerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const samplerReadyRef = useRef(false);
  const dragDepthRef = useRef(0);

  const currentLensMeta = useMemo(
    () => LENSES.find((l) => l.slug === activeLens) || LENSES[0],
    [activeLens]
  );

  const currentToolInfo = useMemo(
    () => STUDIO_TOOLS.find((t) => t.slug === activeLens) || STUDIO_TOOLS[0],
    [activeLens]
  );

  const launchActiveTool = useCallback(
    (slug: ActiveLensSlug = activeLens) => {
      if (onSelectTool) {
        onSelectTool(slug);
        return;
      }
      if (slug === "image-optimizer") {
        onStartOptimizer();
      } else {
        onStartApp();
      }
    },
    [activeLens, onSelectTool, onStartApp, onStartOptimizer]
  );

  const handleIncomingFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || !file.type.startsWith("image/")) return;
      if (onLaunchToolWithFile) {
        onLaunchToolWithFile(activeLens, file);
      } else {
        const url = URL.createObjectURL(file);
        onSelectDemo(url);
      }
    },
    [activeLens, onLaunchToolWithFile, onSelectDemo]
  );

  const switchLens = useCallback((slug: ActiveLensSlug) => {
    setActiveLens(slug);
    setPeeledAlpha(false);
    setShutterTick((t) => t + 1);
  }, []);

  // Autonomous subtle optical sweep until user interacts (respects prefers-reduced-motion)
  useEffect(() => {
    if (hasInteracted || peeledAlpha) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const x = 50 + Math.sin(elapsed * 0.72) * 24;
      const y = 46 + Math.cos(elapsed * 0.96) * 14;
      setLensPos({ x, y });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasInteracted, peeledAlpha]);

  // Load local image into offscreen canvas for REAL pixel sampling in Lens 05
  useEffect(() => {
    if (activeLens !== "gradient-extractor" || samplerReadyRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 220;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      // Draw cover-fitted to match object-cover
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
      samplerReadyRef.current = true;
    };
    img.src = "/demos/car.jpg";
  }, [activeLens]);

  const sampleColorAtPercent = useCallback((pxPct: number, pyPct: number) => {
    const canvas = samplerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const x = Math.max(0, Math.min(canvas.width - 1, Math.round((pxPct / 100) * canvas.width)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.round((pyPct / 100) * canvas.height)));
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setLiveColor({ hex, rgb: `${pixel[0]}, ${pixel[1]}, ${pixel[2]}` });
  }, []);

  // Keyboard shortcuts: 1-6 switch lenses, Ctrl/Cmd+V pastes clipboard image
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < LENSES.length) {
        switchLens(LENSES[idx].slug);
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleIncomingFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("paste", onPaste);
    };
  }, [switchLens, handleIncomingFile]);

  const updatePointerFromClient = useCallback(
    (clientX: number, clientY: number) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(8, Math.min(92, ((clientY - rect.top) / rect.height) * 100));
      setHasInteracted(true);
      setLensPos({ x, y });
      setComparisonPos(Math.round(x));
      if (activeLens === "gradient-extractor") {
        sampleColorAtPercent(x, y);
      }
    },
    [activeLens, sampleColorAtPercent, setComparisonPos]
  );

  const handleStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const next = Math.max(5, comparisonPos - 5);
      setHasInteracted(true);
      setComparisonPos(next);
      setLensPos((p) => {
        if (activeLens === "gradient-extractor") sampleColorAtPercent(next, p.y);
        return { ...p, x: next };
      });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(95, comparisonPos + 5);
      setHasInteracted(true);
      setComparisonPos(next);
      setLensPos((p) => {
        if (activeLens === "gradient-extractor") sampleColorAtPercent(next, p.y);
        return { ...p, x: next };
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      setHasInteracted(true);
      setComparisonPos(5);
      setLensPos((p) => ({ ...p, x: 5 }));
    } else if (e.key === "End") {
      e.preventDefault();
      setHasInteracted(true);
      setComparisonPos(95);
      setLensPos((p) => ({ ...p, x: 95 }));
    }
  };

  const handleCopyText = useCallback(async (text: string, tokenId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenId);
      setTimeout(() => setCopiedToken((curr) => (curr === tokenId ? null : curr)), 1600);
    } catch {
      // Clipboard fallback ignored safely
    }
  }, []);

  const handlePinCurrentColor = useCallback(() => {
    setPinnedSwatches((prev) => {
      if (prev[0] === liveColor.hex) return prev;
      return [liveColor.hex, ...prev.filter((c) => c !== liveColor.hex)].slice(0, 4);
    });
    handleCopyText(liveColor.hex, liveColor.hex);
  }, [liveColor.hex, handleCopyText]);

  // Drag & Drop handlers on the entire Hero section
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    handleIncomingFile(file);
  };

  const activeQuality = QUALITY_PRESETS[qualityIdx];
  const liveGradientCss = `linear-gradient(125deg, ${pinnedSwatches.join(", ")})`;
  const activeX = hasInteracted || viewMode === "split" ? comparisonPos : Math.round(lensPos.x);
  const effectiveLoupeX = hasInteracted ? lensPos.x : lensPos.x;
  const effectiveLoupeY = lensPos.y;

  // Determine which EXIF tags are currently scrubbed by the loupe/split
  const isPointScrubbed = (px: number, py: number) => {
    if (viewMode === "split") return px <= comparisonPos;
    const dx = px - effectiveLoupeX;
    const dy = (py - effectiveLoupeY) * 0.72;
    return Math.sqrt(dx * dx + dy * dy) < 22;
  };

  return (
    <section
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="studio-grid relative border-b border-border bg-background overflow-hidden"
    >
      {/* Hidden native file input for 1-click upload straight into active lens */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleIncomingFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* Full-Hero Magnetic Drag-and-Drop Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-[#0c0e12]/88 backdrop-blur-md flex items-center justify-center p-6 pointer-events-none">
          <div className="max-w-xl w-full rounded-3xl border-2 border-dashed border-[#1e40ff] bg-[#11141c]/95 p-10 text-center text-white shadow-2xl relative">
            <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#ff4d00]" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#ff4d00]" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#ff4d00]" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#ff4d00]" />
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#ff4d00] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
              <span>0 B UPLOADED · LOCAL WASM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-2">
              {isEs
                ? `Suelta para abrir en ${currentToolInfo.es.shortName}`
                : `Drop to launch ${currentToolInfo.en.shortName}`}
            </h2>
            <p className="text-sm text-slate-400 font-accent">
              {isEs
                ? "Tu imagen entra directo a memoria RAM local sin pasar por servidores."
                : "Your image loads straight into local browser RAM with zero cloud upload."}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12 sm:pt-7 sm:pb-16">
        {/* 1. SWISS ARCHITECTURAL TELEMETRY RAIL */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-5 sm:mb-6 border-b border-border text-[11px] font-mono">
          <div className="flex items-center gap-2.5 text-foreground font-semibold tracking-[0.14em] uppercase">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4d00] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4d00]" />
            </span>
            <span>
              {isEs
                ? "CLEARCUT // MESA ÓPTICA LOCAL"
                : "CLEARCUT // LOCAL OPTICAL BENCH"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <span className="hidden sm:inline">06 {isEs ? "MOTORES ACTIVOS" : "ACTIVE ENGINES"}</span>
            <span className="hidden md:inline text-border">·</span>
            <span className="hidden md:inline">ONNX + LIBAVIF WASM</span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              <span>NET_OUT: 0 B</span>
            </span>
          </div>
        </div>

        {/* 2. ASYMMETRIC EDITORIAL MASTHEAD (Breaks the 50/50 SaaS cliché) */}
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-8 items-end mb-5 sm:mb-7">
          <div className="lg:col-span-8">
            <h1 className="text-[2.25rem] sm:text-5xl lg:text-[3.75rem] leading-[0.96] tracking-[-0.04em] font-heading font-bold text-foreground">
              {isEs ? (
                <>
                  Recorta, comprime y calibra píxeles{" "}
                  <span className="text-primary">directo en tu pestaña.</span>
                </>
              ) : (
                <>
                  Cut, compress &amp; calibrate pixels{" "}
                  <span className="text-primary">right in your tab.</span>
                </>
              )}
            </h1>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3.5 lg:pb-1">
            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed font-accent">
              {isEs
                ? "Seis instrumentos de precisión visual en WebAssembly. Explora cada lente abajo o arrastra una imagen directamente aquí."
                : "Six visual precision instruments powered by WebAssembly. Explore each lens below or drop any image right here."}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => launchActiveTool(activeLens)}
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#0c0e12] hover:bg-primary active:translate-y-px text-white text-xs sm:text-sm font-bold rounded-full transition-all tactile-button font-accent cursor-pointer"
              >
                <span>
                  {isEs
                    ? `Abrir ${currentToolInfo.es.shortName}`
                    : `Open ${currentToolInfo.en.shortName}`}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-muted active:translate-y-px border border-border text-foreground text-xs sm:text-sm font-semibold rounded-full transition-all tactile-surface font-accent cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>{isEs ? "Cargar o ⌘V" : "Drop or ⌘V"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. PANORAMIC DARKROOM OPTICAL BENCH (THE CENTERPIECE) */}
        <div className="bg-[#0c0e12] text-white rounded-[1.5rem] sm:rounded-[1.75rem] border border-[#242936] darkroom-chassis overflow-hidden">
          {/* Top Hardware Bezel */}
          <div className="px-4 sm:px-5 py-3 border-b border-[#242936] bg-[#11141c] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2.5 min-w-0">
              <Crosshair
                className="w-3.5 h-3.5 text-[#ff4d00] shrink-0"
                aria-hidden="true"
              />
              <span className="text-slate-200 font-semibold truncate">
                LENS {currentLensMeta.code} // {currentLensMeta.opticLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Optical Mode Toggle (Loupe vs Split Blade) on inspection lenses */}
              {currentLensMeta.supportsSplit && (
                <div
                  role="group"
                  aria-label={isEs ? "Modo de visor óptico" : "Optical viewport mode"}
                  className="inline-flex items-center p-0.5 rounded-lg bg-[#0c0e12] border border-[#242936]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("loupe");
                      setPeeledAlpha(false);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                      viewMode === "loupe" && !peeledAlpha
                        ? "bg-[#1e40ff] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Scan className="w-3 h-3" />
                    <span>{isEs ? "LUPA" : "LOUPE"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("split");
                      setPeeledAlpha(false);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                      viewMode === "split" && !peeledAlpha
                        ? "bg-[#1e40ff] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <MoveHorizontal className="w-3 h-3" />
                    <span>SPLIT</span>
                  </button>
                </div>
              )}

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181c27] border border-[#283044] text-slate-300 tabular-nums">
                {activeLens === "gradient-extractor" ? (
                  <>
                    <span
                      className="w-2.5 h-2.5 rounded-xs border border-white/30"
                      style={{ backgroundColor: liveColor.hex }}
                    />
                    <span>{liveColor.hex}</span>
                  </>
                ) : (
                  <span>
                    {viewMode === "loupe" && currentLensMeta.supportsSplit
                      ? `X:${String(Math.round(effectiveLoupeX)).padStart(2, "0")} Y:${String(
                          Math.round(effectiveLoupeY)
                        ).padStart(2, "0")}`
                      : `SCAN ${activeX}%`}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Main Workbench Interior: Interactive Optical Stage (8 cols) + 6-Tool Cartridge Console (4 cols) */}
          <div className="grid lg:grid-cols-12">
            {/* LEFT / CENTER: INTERACTIVE OPTICAL STAGE */}
            <div className="lg:col-span-8 p-3 sm:p-4 lg:p-5 lg:border-r border-[#242936] flex flex-col gap-3">
              {/* Interactive Stage Canvas (Accessible role="slider" preserved!) */}
              <div
                ref={stageRef}
                role="slider"
                tabIndex={0}
                aria-label={
                  isEs
                    ? "Visor óptico interactivo de ClearCut Studio. Usa las flechas izquierda y derecha para inspeccionar."
                    : "ClearCut Studio interactive optical viewport. Use left and right arrow keys to inspect."
                }
                aria-valuemin={5}
                aria-valuemax={95}
                aria-valuenow={comparisonPos}
                onKeyDown={handleStageKeyDown}
                onMouseEnter={() => setIsPointerInside(true)}
                onMouseLeave={() => setIsPointerInside(false)}
                onMouseMove={(e) => {
                  if (
                    activeLens === "aspect-ratio-fitter" ||
                    activeLens === "favicon-generator"
                  ) {
                    return;
                  }
                  if (viewMode === "split" && activeLens !== "gradient-extractor") {
                    if (e.buttons !== 1) return;
                  }
                  updatePointerFromClient(e.clientX, e.clientY);
                }}
                onMouseDown={(e) => {
                  if (
                    activeLens === "aspect-ratio-fitter" ||
                    activeLens === "favicon-generator"
                  ) {
                    return;
                  }
                  updatePointerFromClient(e.clientX, e.clientY);
                  if (activeLens === "gradient-extractor") {
                    handlePinCurrentColor();
                  }
                }}
                onTouchStart={(e) => {
                  if (
                    activeLens === "aspect-ratio-fitter" ||
                    activeLens === "favicon-generator"
                  ) {
                    return;
                  }
                  if (e.touches[0]) {
                    updatePointerFromClient(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (
                    activeLens === "aspect-ratio-fitter" ||
                    activeLens === "favicon-generator"
                  ) {
                    return;
                  }
                  if (e.touches[0]) {
                    updatePointerFromClient(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                className={`relative aspect-[16/11] sm:aspect-[16/9.6] rounded-2xl overflow-hidden border border-[#242936] bg-[#090b0f] select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e40ff] ${
                  activeLens === "gradient-extractor"
                    ? "cursor-crosshair"
                    : currentLensMeta.supportsSplit
                    ? viewMode === "split"
                      ? "cursor-ew-resize"
                      : "cursor-none"
                    : "cursor-default"
                }`}
              >
                {/* Shutter Flash on Lens Switch */}
                <div
                  key={shutterTick}
                  className="pointer-events-none absolute inset-0 bg-white z-40 opacity-0 animate-shutter-flash"
                  aria-hidden="true"
                />

                {/* Viewfinder Precision Corner Brackets */}
                <span className="pointer-events-none absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-white/35 z-30" />
                <span className="pointer-events-none absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-white/35 z-30" />
                <span className="pointer-events-none absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-white/35 z-30" />
                <span className="pointer-events-none absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-white/35 z-30" />

                {/* ========================================================= */}
                {/* LENS 01: AI BACKGROUND REMOVER (X-RAY ALPHA LOUPE / SPLIT) */}
                {/* ========================================================= */}
                {activeLens === "background-remover" && (
                  <>
                    {/* Base Original Image */}
                    <img
                      src="/demos/demo-original.png"
                      alt={
                        isEs
                          ? "Imagen original con fondo antes del recorte IA"
                          : "Original image with background before AI cutout"
                      }
                      className="absolute inset-0 w-full h-full object-cover object-[50%_20%]"
                      fetchPriority="high"
                      decoding="async"
                      draggable={false}
                    />

                    {/* Alpha Cutout Layer (Clipped by Optical Loupe, Split Blade, or Full Peel) */}
                    <div
                      className="absolute inset-0 checkerboard-dark transition-[clip-path] duration-75 ease-out"
                      style={{
                        clipPath: peeledAlpha
                          ? "inset(0 0 0 0)"
                          : viewMode === "split"
                          ? `inset(0 ${100 - comparisonPos}% 0 0)`
                          : `circle(${loupeRadius}px at ${effectiveLoupeX}% ${effectiveLoupeY}%)`,
                      }}
                    >
                      <img
                        src="/demos/demo-processed.avif"
                        alt={
                          isEs
                            ? "Imagen con fondo eliminado mediante IA local"
                            : "Image with background removed via local AI"
                        }
                        className="w-full h-full object-cover object-[50%_20%]"
                        decoding="async"
                        draggable={false}
                      />
                    </div>

                    {/* Optical Tag Top Left */}
                    <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#0c0e12]/82 backdrop-blur-md border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white">
                        {peeledAlpha
                          ? isEs
                            ? "ALPHA 100% // TRANSPARENTE"
                            : "ALPHA 100% // TRANSPARENT"
                          : viewMode === "loupe"
                          ? isEs
                            ? "LUPA ÓPTICA // CANAL ALPHA"
                            : "OPTICAL LOUPE // ALPHA CHANNEL"
                          : isEs
                          ? "ALPHA // SIN FONDO"
                          : "ALPHA // CUTOUT"}
                      </span>
                    </div>

                    {/* Quick Full-Peel Shutter Button */}
                    <div className="absolute bottom-4 right-4 z-30">
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPeeledAlpha((v) => !v);
                          setShutterTick((t) => t + 1);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold border backdrop-blur-md transition-all cursor-pointer ${
                          peeledAlpha
                            ? "bg-[#ff4d00] border-[#ff4d00] text-white"
                            : "bg-[#0c0e12]/80 border-white/20 text-white hover:border-white/50"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          {peeledAlpha
                            ? isEs
                              ? "VER ORIGINAL"
                              : "SHOW RAW"
                            : isEs
                            ? "REVELAR TODO"
                            : "PEEL ALL"}
                        </span>
                      </button>
                    </div>

                    {/* Engraved Leica-Style Circular Loupe Reticle */}
                    {viewMode === "loupe" && !peeledAlpha && (
                      <div
                        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full optical-loupe-ring"
                        style={{
                          width: `${loupeDiameter}px`,
                          height: `${loupeDiameter}px`,
                          left: `${effectiveLoupeX}%`,
                          top: `${effectiveLoupeY}%`,
                        }}
                      >
                        {/* Cardinal tick marks */}
                        <span className="absolute top-1 left-1/2 -translate-x-1/2 w-px h-2.5 bg-white/80" />
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-px h-2.5 bg-white/80" />
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 h-px w-2.5 bg-white/80" />
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 h-px w-2.5 bg-white/80" />
                        {/* Tiny center dot */}
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff4d00] shadow-[0_0_8px_#ff4d00]" />
                        {/* Bottom rim readout */}
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#0c0e12]/90 border border-white/15 text-[9px] font-mono tracking-wider text-emerald-400">
                          ALPHA · PNG/AVIF
                        </span>
                      </div>
                    )}

                    {/* Precision Metallic Split Handle */}
                    {viewMode === "split" && !peeledAlpha && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.65)] z-20"
                        style={{ left: `${comparisonPos}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white text-[#0c0e12] rounded-full shadow-lg flex items-center justify-center border-2 border-[#0c0e12]">
                          <MoveHorizontal className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ========================================================= */}
                {/* LENS 02: WASM IMAGE OPTIMIZER (2× PIXEL MICROSCOPE)       */}
                {/* ========================================================= */}
                {activeLens === "image-optimizer" && (
                  <>
                    {/* Base Image */}
                    <img
                      src="/demos/shoes.jpg"
                      alt="Sneaker studio plate for AVIF compression inspection"
                      className="absolute inset-0 w-full h-full object-cover"
                      decoding="async"
                      draggable={false}
                    />

                    {/* Magnified / Compressed Inspection Layer */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        clipPath:
                          viewMode === "split"
                            ? `inset(0 ${100 - comparisonPos}% 0 0)`
                            : `circle(${loupeRadius}px at ${effectiveLoupeX}% ${effectiveLoupeY}%)`,
                      }}
                    >
                      <img
                        src="/demos/shoes.jpg"
                        alt="Compressed AVIF magnified detail"
                        className="w-full h-full object-cover transition-transform duration-75"
                        style={{
                          transform: viewMode === "loupe" ? "scale(1.85)" : "scale(1)",
                          transformOrigin: `${effectiveLoupeX}% ${effectiveLoupeY}%`,
                        }}
                        decoding="async"
                        draggable={false}
                      />
                      {/* Micro Pixel Inspection Grid inside Loupe */}
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundSize: "12px 12px",
                          backgroundImage:
                            "linear-gradient(to right, rgba(30,64,255,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,64,255,0.45) 1px, transparent 1px)",
                        }}
                      />
                    </div>

                    {/* Top Left & Right Live Compression Readouts */}
                    <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#0c0e12]/85 backdrop-blur-md border border-emerald-500/35 text-[10px] font-mono text-emerald-400 font-semibold">
                        AVIF · {activeQuality.kb} KB (-{activeQuality.savings}%)
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#0c0e12]/85 backdrop-blur-md border border-white/15 text-[10px] font-mono text-slate-300">
                        RAW PNG · 2,410 KB
                      </span>
                    </div>

                    {/* Interactive Quality Preset Dial Bar */}
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 bg-[#0c0e12]/88 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center gap-1.5">
                        {QUALITY_PRESETS.map((preset, idx) => (
                          <button
                            key={preset.q}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQualityIdx(idx);
                            }}
                            className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold transition-colors cursor-pointer ${
                              qualityIdx === idx
                                ? "bg-[#1e40ff] text-white"
                                : "bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <div className="hidden sm:flex items-center gap-2 font-mono text-[10px]">
                        <div className="w-20 h-1.5 rounded-full bg-white/15 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${100 - activeQuality.savings + 8}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-bold tabular-nums">
                          -{activeQuality.savings}%
                        </span>
                      </div>
                    </div>

                    {/* Loupe Ring (2× Microscope) */}
                    {viewMode === "loupe" && (
                      <div
                        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full optical-loupe-ring"
                        style={{
                          width: `${loupeDiameter}px`,
                          height: `${loupeDiameter}px`,
                          left: `${effectiveLoupeX}%`,
                          top: `${effectiveLoupeY}%`,
                        }}
                      >
                        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#1e40ff] text-[9px] font-mono font-bold text-white">
                          2.0× AVIF
                        </span>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border border-white/60 rounded-full" />
                      </div>
                    )}

                    {viewMode === "split" && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.65)] z-20"
                        style={{ left: `${comparisonPos}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white text-[#0c0e12] rounded-full shadow-lg flex items-center justify-center border-2 border-[#0c0e12]">
                          <MoveHorizontal className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ========================================================= */}
                {/* LENS 03: EXIF STRIPPER (PRIVACY X-RAY SCANNER)            */}
                {/* ========================================================= */}
                {activeLens === "exif-stripper" && (
                  <>
                    <img
                      src="/demos/car.jpg"
                      alt="Outdoor vehicle photo demonstrating hidden EXIF GPS metadata"
                      className="absolute inset-0 w-full h-full object-cover brightness-[0.72] contrast-[1.06]"
                      decoding="async"
                      draggable={false}
                    />

                    {/* Clean Scrubbed Pixel Layer inside Loupe / Split */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        clipPath:
                          viewMode === "split"
                            ? `inset(0 ${100 - comparisonPos}% 0 0)`
                            : `circle(${loupeRadius}px at ${effectiveLoupeX}% ${effectiveLoupeY}%)`,
                      }}
                    >
                      <img
                        src="/demos/car.jpg"
                        alt="Clean metadata-free pixels"
                        className="w-full h-full object-cover brightness-100"
                        decoding="async"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-emerald-500/8 pointer-events-none" />
                    </div>

                    {/* Floating EXIF Metadata Markers that Scrub Live under the Lens */}
                    {EXIF_LEAKS.map((item) => {
                      const scrubbed = isPointScrubbed(item.x, item.y);
                      return (
                        <div
                          key={item.id}
                          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-200"
                          style={{ left: `${item.x}%`, top: `${item.y}%` }}
                        >
                          <div
                            className={`px-2.5 py-1.5 rounded-lg backdrop-blur-md border font-mono text-[10px] shadow-lg transition-all duration-200 ${
                              scrubbed
                                ? "bg-emerald-950/88 border-emerald-400/50 text-emerald-300 scale-95"
                                : "bg-[#1a0d0d]/88 border-[#ff4d00]/70 text-white"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  scrubbed ? "bg-emerald-400" : "bg-[#ff4d00] animate-pulse"
                                }`}
                              />
                              <span className="font-bold">{item.tag}</span>
                              <span
                                className={
                                  scrubbed
                                    ? "line-through opacity-60"
                                    : "text-orange-200"
                                }
                              >
                                {item.val}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Top Status Readout */}
                    <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/85 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isEs ? "PÍXELES LIMPIOS" : "CLEAN PIXELS"}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#0c0e12]/85 border border-[#ff4d00]/50 text-[#ff834d] font-mono text-[10px] font-semibold">
                        {isEs ? "4 FUGAS EXIF" : "4 EXIF LEAKS"}
                      </span>
                    </div>

                    {viewMode === "loupe" && (
                      <div
                        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full optical-loupe-ring border-emerald-400/50"
                        style={{
                          width: `${loupeDiameter}px`,
                          height: `${loupeDiameter}px`,
                          left: `${effectiveLoupeX}%`,
                          top: `${effectiveLoupeY}%`,
                        }}
                      >
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/40 text-[9px] font-mono tracking-wider text-emerald-300">
                          SCRUBBER ACTIVE · 0 EXIF
                        </span>
                      </div>
                    )}

                    {viewMode === "split" && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)] z-20"
                        style={{ left: `${comparisonPos}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-emerald-400 text-[#0c0e12] rounded-full shadow-lg flex items-center justify-center border-2 border-[#0c0e12]">
                          <MoveHorizontal className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ========================================================= */}
                {/* LENS 04: ASPECT RATIO FITTER (LIVE FRAMING BENCH)         */}
                {/* ========================================================= */}
                {activeLens === "aspect-ratio-fitter" && (
                  <div className="absolute inset-0 darkroom-grid bg-[#0d1017] flex flex-col items-center justify-center p-6 pb-16">
                    {/* Top Framing Telemetry */}
                    <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-[10px] font-mono">
                      <span className="px-2.5 py-1 rounded-md bg-[#0c0e12]/90 border border-white/15 text-white">
                        RATIO {aspectRatio} · {RATIO_PRESETS[aspectRatio].dims} PX
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#1e40ff]/25 border border-[#1e40ff]/50 text-[#93c5fd]">
                        NO CROP · 100% FRAME
                      </span>
                    </div>

                    {/* Live Animated Canvas Frame */}
                    <div
                      className={`relative rounded-xl overflow-hidden border border-white/25 shadow-2xl transition-all duration-300 flex items-center justify-center ${
                        RATIO_PRESETS[aspectRatio].boxClass
                      } ${
                        fillMode === "obsidian"
                          ? "bg-[#0c0e12]"
                          : fillMode === "paper"
                          ? "bg-[#f4f3ef]"
                          : "bg-[#1a1c22]"
                      }`}
                    >
                      {fillMode === "blur" && (
                        <img
                          src="/demos/coffee.jpg"
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-70"
                        />
                      )}
                      <img
                        src="/demos/coffee.jpg"
                        alt="Minimalist coffee studio shot fitted without cropping"
                        className="relative z-10 w-full h-full object-contain p-2 transition-all duration-300"
                        draggable={false}
                      />
                    </div>

                    {/* Interactive Ratio & Backdrop Control Bar */}
                    <div className="absolute bottom-3.5 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 bg-[#0c0e12]/90 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1">
                        {(Object.keys(RATIO_PRESETS) as RatioId[]).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setAspectRatio(r)}
                            className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold transition-colors cursor-pointer ${
                              aspectRatio === r
                                ? "bg-[#1e40ff] text-white"
                                : "bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {(
                          [
                            { id: "blur", label: "BLUR" },
                            { id: "obsidian", label: "DARK" },
                            { id: "paper", label: "PAPER" },
                          ] as const
                        ).map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setFillMode(mode.id)}
                            className={`px-2 py-1 rounded-md font-mono text-[10px] transition-colors cursor-pointer ${
                              fillMode === mode.id
                                ? "bg-[#ff4d00] text-white font-bold"
                                : "bg-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* LENS 05: LIVE CANVAS COLORIMETER & CSS GRADIENT EXTRACTOR */}
                {/* ========================================================= */}
                {activeLens === "gradient-extractor" && (
                  <>
                    <img
                      src="/demos/car.jpg"
                      alt="Sample photograph for live pixel color sampling"
                      className="absolute inset-0 w-full h-full object-cover"
                      decoding="async"
                      draggable={false}
                    />

                    {/* Live Optical Eyedropper Ring */}
                    <div
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${effectiveLoupeX}%`,
                        top: `${effectiveLoupeY}%`,
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-full border-[5px] shadow-2xl flex items-center justify-center transition-colors duration-75"
                        style={{
                          borderColor: liveColor.hex,
                          boxShadow:
                            "0 0 0 1px rgba(255,255,255,0.85), 0 12px 28px rgba(0,0,0,0.65)",
                        }}
                      >
                        <span className="w-2 h-2 rounded-full border border-white bg-black/50" />
                      </div>
                      <div className="mt-2 px-2 py-0.5 rounded bg-[#0c0e12]/92 border border-white/20 font-mono text-[10px] text-white text-center whitespace-nowrap">
                        {liveColor.hex} · {isEs ? "CLIC FIJAR" : "CLICK PIN"}
                      </div>
                    </div>

                    {/* Top Live Readout */}
                    <div className="pointer-events-none absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0c0e12]/88 backdrop-blur-md border border-white/15 font-mono text-[10px]">
                      <Pipette className="w-3.5 h-3.5 text-[#ff4d00]" />
                      <span
                        className="w-3 h-3 rounded-xs border border-white/30"
                        style={{ backgroundColor: liveColor.hex }}
                      />
                      <span className="text-white font-bold">{liveColor.hex}</span>
                      <span className="text-slate-400 hidden sm:inline">
                        RGB({liveColor.rgb})
                      </span>
                    </div>

                    {/* Bottom Live CSS Gradient & Swatch Strip */}
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute bottom-3.5 left-4 right-4 z-30 bg-[#0c0e12]/92 backdrop-blur-md border border-white/15 rounded-xl p-2.5 space-y-2"
                    >
                      <div
                        className="h-5 w-full rounded-lg border border-white/15"
                        style={{ background: liveGradientCss }}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {pinnedSwatches.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyText(hex, hex);
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 font-mono text-[10px] text-slate-200 cursor-pointer transition-colors"
                              title={isEs ? `Copiar ${hex}` : `Copy ${hex}`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-xs border border-white/30"
                                style={{ backgroundColor: hex }}
                              />
                              <span>{copiedToken === hex ? "OK" : hex}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(`background: ${liveGradientCss};`, "css");
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e40ff] hover:bg-[#1530cc] text-white font-mono text-[10px] font-semibold cursor-pointer transition-colors"
                        >
                          {copiedToken === "css" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>
                            {copiedToken === "css"
                              ? isEs
                                ? "CSS COPIADO"
                                : "CSS COPIED"
                              : isEs
                              ? "COPIAR CSS"
                              : "COPY CSS"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* LENS 06: FAVICON & PWA MULTI-SURFACE PREVIEWER            */}
                {/* ========================================================= */}
                {activeLens === "favicon-generator" && (
                  <div className="absolute inset-0 darkroom-grid bg-[#0e1118] p-5 sm:p-6 flex flex-col justify-between">
                    {/* Top Row: Theme Switcher */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                        16×16 · 32×32 · 180×180 · 512×512
                      </span>
                      <button
                        type="button"
                        onClick={() => setFaviconDark((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181d29] border border-white/15 hover:border-white/35 text-[10px] font-mono text-white cursor-pointer transition-colors"
                      >
                        {faviconDark ? (
                          <>
                            <Moon className="w-3 h-3 text-[#60a5fa]" />
                            <span>DARK TAB</span>
                          </>
                        ) : (
                          <>
                            <Sun className="w-3 h-3 text-amber-400" />
                            <span>LIGHT TAB</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Middle: Realistic Browser Tab + Google SERP + Mobile App Tiles */}
                    <div className="grid sm:grid-cols-12 gap-3.5 my-auto py-3">
                      {/* Browser Chrome Preview */}
                      <div
                        className={`sm:col-span-7 rounded-xl border overflow-hidden transition-colors ${
                          faviconDark
                            ? "bg-[#151923] border-white/15 text-white"
                            : "bg-[#f4f3ef] border-[#dcdad0] text-[#0c0e12]"
                        }`}
                      >
                        <div
                          className={`px-3 pt-2.5 flex items-center gap-2 border-b ${
                            faviconDark ? "border-white/10 bg-[#0f1219]" : "border-[#dcdad0] bg-[#e6e4dc]"
                          }`}
                        >
                          <div className="flex items-center gap-1 pb-2">
                            <span className="w-2 h-2 rounded-full bg-red-400/80" />
                            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                            <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-[11px] font-medium ${
                              faviconDark ? "bg-[#151923] text-white" : "bg-white text-[#0c0e12]"
                            }`}
                          >
                            <img
                              src="/favicon/favicon-96x96.png"
                              alt="Favicon 16px preview"
                              className="w-3.5 h-3.5 rounded-xs"
                            />
                            <span className="truncate">ClearCut Studio</span>
                          </div>
                        </div>
                        <div className="p-3.5 space-y-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center p-1 shrink-0">
                              <img
                                src="/favicon/favicon-96x96.png"
                                alt="Google SERP icon"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold truncate">
                                studio.fabianh.me
                              </div>
                              <div className="text-[10px] opacity-60 font-mono truncate">
                                https://studio.fabianh.me/{lang}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-[#1e40ff]">
                            ClearCut Studio — Optical Image Workbench
                          </div>
                        </div>
                      </div>

                      {/* Mobile Homescreen + Package Sizes */}
                      <div className="sm:col-span-5 rounded-xl bg-[#151923] border border-white/15 p-3.5 flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-around py-1">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-[13px] bg-white p-2 shadow-lg flex items-center justify-center">
                              <img
                                src="/favicon/favicon-96x96.png"
                                alt="iOS icon"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="font-mono text-[9px] text-slate-400">
                              iOS 180px
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-full bg-[#0c0e12] border border-white/20 p-2 shadow-lg flex items-center justify-center">
                              <img
                                src="/favicon/favicon-96x96.png"
                                alt="Android icon"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="font-mono text-[9px] text-slate-400">
                              PWA 512px
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-emerald-400">
                          <span>MANIFEST + ICO</span>
                          <span>READY .ZIP</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Hint */}
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span>HTML &lt;HEAD&gt; SNIPPET INCLUDED</span>
                      <span className="text-white">0 B UPLOADED</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Sub-Bar: Contextual Micro-Guidance */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                <span className="text-slate-400 font-accent">
                  {isEs ? currentLensMeta.hintEs : currentLensMeta.hintEn}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    activeLens === "background-remover"
                      ? onSelectDemo("/demos/demo-original.png")
                      : launchActiveTool(activeLens)
                  }
                  className="text-white hover:text-[#60a5fa] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <span>
                    {activeLens === "background-remover"
                      ? isEs
                        ? "Abrir muestra en editor"
                        : "Open sample in editor"
                      : isEs
                      ? `Ir a ${currentToolInfo.es.shortName}`
                      : `Launch ${currentToolInfo.en.shortName}`}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* RIGHT: 6-TOOL TACTILE CARTRIDGE CONSOLE */}
            <div className="lg:col-span-4 bg-[#10131b] p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-4 border-t lg:border-t-0 border-[#242936]">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242936]">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {isEs ? "06 // SELECTOR DE LENTES" : "06 // LENS SELECTOR"}
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#181d29] border border-[#283044]">
                    {isEs ? "TECLAS 1–6" : "KEYS 1–6"}
                  </span>
                </div>

                {/* 6 Tactile Hardware Cartridges (2 cols on small screens, 1 stacked precision rail on lg) */}
                <div
                  role="tablist"
                  aria-label={
                    isEs
                      ? "Explorar las 6 herramientas locales de ClearCut Studio"
                      : "Explore ClearCut Studio's 6 local tools"
                  }
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5"
                >
                  {LENSES.map((lens) => {
                    const tool =
                      STUDIO_TOOLS.find((t) => t.slug === lens.slug) || STUDIO_TOOLS[0];
                    const copy = isEs ? tool.es : tool.en;
                    const isActive = activeLens === lens.slug;

                    return (
                      <button
                        key={lens.slug}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => switchLens(lens.slug)}
                        onDoubleClick={() => launchActiveTool(lens.slug)}
                        className={`group w-full text-left px-3 py-2 sm:py-2.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 active:translate-y-px ${
                          isActive
                            ? "bg-[#192030] border-[#1e40ff] text-white shadow-[0_0_0_1px_rgba(30,64,255,0.35)]"
                            : "bg-[#141822]/70 border-[#222838] text-slate-300 hover:bg-[#181d2a] hover:border-[#323a50] hover:text-white"
                        }`}
                      >
                        {/* Mechanical Index + Status LED + Mobile Icon */}
                        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-1 shrink-0 w-full sm:w-5">
                          <div className="flex sm:flex-col items-center gap-1.5 sm:gap-1">
                            <span
                              className={`font-mono text-[10px] font-bold ${
                                isActive ? "text-[#60a5fa]" : "text-slate-500"
                              }`}
                            >
                              {lens.code}
                            </span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                isActive
                                  ? "bg-[#ff4d00] shadow-[0_0_6px_#ff4d00]"
                                  : "bg-white/15 group-hover:bg-white/35"
                              }`}
                              aria-hidden="true"
                            />
                          </div>
                          <ToolIcon
                            slug={lens.slug}
                            className={`w-3.5 h-3.5 sm:hidden ${
                              isActive ? "text-[#60a5fa]" : "text-slate-400"
                            }`}
                          />
                        </div>

                        {/* Tool Icon Box (Tablet/Desktop) */}
                        <div
                          className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-[#1e40ff] text-white"
                              : "bg-[#0c0e12] text-slate-400 border border-[#242936] group-hover:text-white"
                          }`}
                        >
                          <ToolIcon slug={lens.slug} className="w-4 h-4" />
                        </div>

                        {/* Tool Name & Technical Spec */}
                        <div className="min-w-0 flex-1 w-full">
                          <div className="text-xs sm:text-[13px] font-heading font-bold truncate leading-tight">
                            {copy.shortName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                            {isEs ? lens.specEs : lens.specEn}
                          </div>
                        </div>

                        {/* Quick Launch Arrow on Active */}
                        {isActive && (
                          <span
                            className="hidden lg:inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 text-white shrink-0"
                            aria-hidden="true"
                          >
                            <Sparkles className="w-3 h-3 text-[#ff4d00]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tactile Launch + Direct Drop Slot */}
              <div className="pt-3 border-t border-[#242936] space-y-2">
                <button
                  type="button"
                  onClick={() => launchActiveTool(activeLens)}
                  className="w-full py-3 px-4 rounded-xl bg-[#1e40ff] hover:bg-[#1530cc] active:translate-y-px text-white font-accent font-bold text-xs sm:text-sm flex items-center justify-between gap-2 transition-all cursor-pointer shadow-[0_10px_25px_-10px_rgba(30,64,255,0.75)]"
                >
                  <span className="truncate">
                    {isEs
                      ? `Usar ${currentToolInfo.es.shortName} ahora`
                      : `Launch ${currentToolInfo.en.shortName} now`}
                  </span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#0c0e12] hover:bg-[#161a24] border border-dashed border-[#2f374d] hover:border-[#60a5fa] text-slate-300 hover:text-white font-mono text-[11px] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 truncate">
                    <Upload className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                    <span className="truncate">
                      {isEs
                        ? "Arrastra una foto aquí o pega ⌘V"
                        : "Drop any photo here or paste ⌘V"}
                    </span>
                  </span>
                  <span className="text-[10px] text-emerald-400 shrink-0">0 B</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Hardware Spec Strip */}
          <div className="px-4 sm:px-5 py-2.5 border-t border-[#242936] bg-[#0a0c10] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                {isEs ? "PRIVACIDAD VERIFICABLE" : "VERIFIABLE PRIVACY"}:{" "}
                <strong className="text-emerald-400 font-semibold">
                  {isEs ? "100% EN MEMORIA LOCAL" : "100% LOCAL RAM"}
                </strong>
              </span>
              <span className="hidden sm:inline text-[#242936]">|</span>
              <span className="hidden sm:inline">
                {isEs ? "SIN CUENTA · SIN MARCAS DE AGUA" : "NO SIGNUP · NO WATERMARKS"}
              </span>
            </div>
            <a
              href="#tools"
              className="text-slate-300 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              {isEs ? "Ver catálogo completo ↓" : "Explore full catalog ↓"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
