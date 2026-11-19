"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ComparisonSlider } from "./comparison-slider";
import { FormatSelector, type ImageFormat, FORMATS } from "./format-selector";
import { OptimizerStats, formatBytes } from "./optimizer-stats";
import { WorkspaceHeader } from "@/components/studio/workspace-header";
import {
  Download,
  ImagePlus,
  Cpu,
  AlertTriangle,
  Info,
  MoveHorizontal,
  Scan,
  Maximize2,
} from "lucide-react";

interface OptimizerWorkspaceProps {
  file: File;
  onReset: () => void;
  onClose?: () => void;
  onNewFile: (file: File) => void;
  lang?: string;
}

const WASM_FORMATS: ImageFormat[] = ["avif", "webp", "jpeg"];

const DEFAULT_QUALITY: Record<ImageFormat, number> = {
  avif: 55,
  webp: 75,
  jpeg: 78,
  png: 100,
};

const SCALE_PRESETS = [
  { label: "100%", value: 1 },
  { label: "75%", value: 0.75 },
  { label: "50%", value: 0.5 },
  { label: "25%", value: 0.25 },
] as const;

let worker: Worker | null = null;
let requestId = 0;
const pending = new Map<number, { resolve: (v: Blob) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker("/workers/encoder.js", { type: "module" });

  worker.onmessage = (e) => {
    const { id, success, buffer, mimeType, error } = e.data;
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);

    if (success) {
      p.resolve(new Blob([buffer], { type: mimeType }));
    } else {
      p.reject(new Error(error || "Encoding failed"));
    }
  };

  worker.onerror = (e) => {
    console.error("Encoder worker error:", e);
  };

  return worker;
}

function encodeViaWorker(
  format: ImageFormat,
  imageData: ImageData,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });

    const pixelBuffer = imageData.data.buffer.slice(0);
    getWorker().postMessage(
      {
        id,
        format,
        pixelData: pixelBuffer,
        width: imageData.width,
        height: imageData.height,
        quality,
      },
      [pixelBuffer]
    );
  });
}

export function OptimizerWorkspace({
  file,
  onReset,
  onClose,
  onNewFile,
  lang = "es",
}: OptimizerWorkspaceProps) {
  const isEn = lang === "en";
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [qualities, setQualities] = useState<Record<ImageFormat, number>>({
    ...DEFAULT_QUALITY,
  });
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"split" | "loupe">("split");
  const [zoom, setZoom] = useState<number>(1);

  const [originalSrc, setOriginalSrc] = useState<string>("");
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(file.size);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [encodeError, setEncodeError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quality = qualities[format];
  const outputWidth = Math.max(1, Math.round(dimensions.width * scaleFactor));
  const outputHeight = Math.max(1, Math.round(dimensions.height * scaleFactor));

  useEffect(() => {
    setOriginalSize(file.size);
    setScaleFactor(1);
    const url = URL.createObjectURL(file);
    setOriginalSrc(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const compress = useCallback(
    async (targetFormat: ImageFormat, targetQuality: number, targetScale: number) => {
      if (!imgRef.current || !canvasRef.current) return;
      setIsProcessing(true);
      setEncodeError(null);

      try {
        await new Promise((r) => setTimeout(r, 25));

        const img = imgRef.current;
        const canvas = canvasRef.current;
        const outW = Math.max(1, Math.round(img.naturalWidth * targetScale));
        const outH = Math.max(1, Math.round(img.naturalHeight * targetScale));
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0, 0, outW, outH);
        ctx.drawImage(img, 0, 0, outW, outH);

        let blob: Blob;

        if (WASM_FORMATS.includes(targetFormat)) {
          const imageData = ctx.getImageData(0, 0, outW, outH);
          blob = await encodeViaWorker(targetFormat, imageData, targetQuality);
        } else {
          const native = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, "image/png")
          );
          if (!native) throw new Error("PNG encoding failed");
          blob = native;
        }

        const url = URL.createObjectURL(blob);
        setOptimizedSrc((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setOptimizedSize(blob.size);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Compress error:", msg);
        setEncodeError(isEn ? `Encoding error: ${msg}` : `Error al codificar: ${msg}`);
        setOptimizedSrc(null);
        setOptimizedSize(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [isEn]
  );

  useEffect(() => {
    if (!imgRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => compress(format, quality, scaleFactor),
      220
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [format, quality, scaleFactor, compress]);

  useEffect(() => {
    if (dimensions.width > 0) compress(format, quality, scaleFactor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions]);

  const handleDownload = () => {
    if (!optimizedSrc) return;
    const ext = FORMATS.find((f) => f.id === format)?.extension ?? ".webp";
    const a = document.createElement("a");
    a.href = optimizedSrc;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}-optimized${ext}`;
    a.click();
  };

  const handleQualityChange = (val: number) =>
    setQualities((prev) => ({ ...prev, [format]: val }));

  const handleFormatChange = (newFormat: ImageFormat) => {
    setFormat(newFormat);
    setOptimizedSrc(null);
    setOptimizedSize(null);
    setEncodeError(null);
  };

  const supportsQuality = FORMATS.find((f) => f.id === format)?.supportsQuality ?? true;

  const qualityPresets =
    format === "avif"
      ? [
          { label: isEn ? "Compact" : "Compacta", value: 30 },
          { label: isEn ? "Balanced" : "Óptima", value: 55 },
          { label: isEn ? "Master" : "Máxima", value: 80 },
        ]
      : format === "jpeg"
      ? [
          { label: isEn ? "Compact" : "Compacta", value: 55 },
          { label: isEn ? "Balanced" : "Óptima", value: 78 },
          { label: isEn ? "Master" : "Máxima", value: 92 },
        ]
      : [
          { label: isEn ? "Compact" : "Compacta", value: 45 },
          { label: isEn ? "Balanced" : "Óptima", value: 75 },
          { label: isEn ? "Master" : "Máxima", value: 92 },
        ];

  const savingsPct =
    optimizedSize !== null && originalSize > 0
      ? ((originalSize - optimizedSize) / originalSize) * 100
      : null;

  const isLargerThanOriginal =
    optimizedSize !== null && optimizedSize > originalSize && format !== "png";

  return (
    <div className="min-h-screen lg:h-screen bg-background text-foreground flex flex-col lg:overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      <WorkspaceHeader
        slug="image-optimizer"
        lang={lang}
        onClose={onClose || onReset}
        subtitle={file.name}
        centerSlot={
          optimizedSize !== null && savingsPct !== null && !isProcessing ? (
            <span className="font-mono text-xs font-semibold text-foreground px-3 py-1 rounded-full bg-muted border border-border tabular-nums">
              {formatBytes(optimizedSize)} ·{" "}
              <span
                className={
                  savingsPct >= 0 ? "text-emerald-700 font-bold" : "text-destructive font-bold"
                }
              >
                {savingsPct >= 0
                  ? `-${savingsPct.toFixed(1)}%`
                  : `+${Math.abs(savingsPct).toFixed(1)}%`}
              </span>
            </span>
          ) : null
        }
        rightSlot={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onNewFile(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-border/60 border border-border text-foreground text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isEn ? "New image" : "Otra imagen"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!optimizedSrc || isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0c0e12] hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full transition-all tactile-button cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Download" : "Descargar"}</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
        {/* LEFT CONSOLE: OPTICAL CODEC, QUALITY, RESIZE & DARKROOM TELEMETRY */}
        <aside className="w-full lg:w-[365px] border-t lg:border-t-0 lg:border-r border-border bg-card p-5 overflow-y-auto space-y-5 shrink-0 order-2 lg:order-1">
          <FormatSelector selected={format} onChange={handleFormatChange} />

          {/* Quality Control */}
          {supportsQuality && (
            <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="optimizer-quality-slider"
                  className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]"
                >
                  {isEn ? "COMPRESSION QUALITY" : "CALIDAD DE COMPRESIÓN"}
                </label>
                <span className="font-mono text-xs font-bold text-foreground tabular-nums px-2 py-0.5 rounded bg-card border border-border">
                  {quality}%
                </span>
              </div>
              <input
                id="optimizer-quality-slider"
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1.5">
                {qualityPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQualityChange(preset.value)}
                    className={`py-1.5 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                      quality === preset.value
                        ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Output Scale / Resize Control */}
          <div className="p-4 rounded-2xl bg-background border border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em] inline-flex items-center gap-1.5">
                <Maximize2 className="w-3 h-3 text-primary" />
                <span>{isEn ? "OUTPUT SCALE" : "ESCALA DE SALIDA"}</span>
              </span>
              <span className="font-mono text-[10px] font-semibold text-foreground tabular-nums">
                {outputWidth} × {outputHeight} px
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SCALE_PRESETS.map((sc) => (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => setScaleFactor(sc.value)}
                  className={`py-1.5 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                    scaleFactor === sc.value
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts / Engine Info */}
          {encodeError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{encodeError}</span>
            </div>
          )}

          {isLargerThanOriginal && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {isEn
                  ? "Output exceeds original size. Lower quality or scale to compress further."
                  : "El resultado supera el peso original. Reduce calidad o escala para comprimir más."}
              </span>
            </div>
          )}

          {format === "png" && (
            <div className="p-3 rounded-xl bg-background border border-border text-muted-foreground text-xs flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                {isEn
                  ? "PNG is lossless. Switch to AVIF or WebP for maximum byte savings."
                  : "PNG es sin pérdida. Usa AVIF o WebP para máximo ahorro de peso."}
              </span>
            </div>
          )}

          {/* Darkroom Hardware Telemetry */}
          <OptimizerStats
            originalSize={originalSize}
            optimizedSize={optimizedSize}
            width={outputWidth}
            height={outputHeight}
            format={format}
            isProcessing={isProcessing}
          />

          {/* WASM Worker Badge */}
          {WASM_FORMATS.includes(format) && !encodeError && (
            <div className="px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-muted-foreground text-[11px] font-mono flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
                <strong className="text-foreground">
                  {format === "avif" ? "libavif" : format === "webp" ? "libwebp" : "MozJPEG"}
                </strong>
              </span>
              <span>WASM WORKER</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={!optimizedSrc || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isEn ? "Download optimized image" : "Descargar imagen optimizada"}</span>
          </button>
        </aside>

        {/* MAIN PANORAMIC DARKROOM COMPARISON STAGE */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 gap-4 bg-background studio-grid order-1 lg:order-2 min-h-[54vh] lg:min-h-0">
          {/* Top Optical Inspection Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border tactile-surface shrink-0">
            {/* Split vs Optical Loupe Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-muted border border-border">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                  viewMode === "split"
                    ? "bg-[#0c0e12] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MoveHorizontal className="w-3.5 h-3.5" />
                <span>SPLIT</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("loupe")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                  viewMode === "loupe"
                    ? "bg-[#0c0e12] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{isEn ? "LOUPE" : "LUPA"}</span>
              </button>
            </div>

            {/* Optical Zoom Inspector (1x / 2x / 4x) */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                ZOOM:
              </span>
              <div className="inline-flex items-center p-1 rounded-xl bg-background border border-border font-mono text-[11px]">
                {[1, 2, 4].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      zoom === z
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {z}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Darkroom Comparison Stage */}
          <div className="flex-1 min-h-[340px] w-full">
            {originalSrc ? (
              <ComparisonSlider
                originalSrc={originalSrc}
                optimizedSrc={optimizedSrc}
                formatLabel={format.toUpperCase()}
                qualityLabel={supportsQuality ? `Q${quality}` : "LOSSLESS"}
                zoom={zoom}
                viewMode={viewMode}
                isProcessing={isProcessing}
                lang={lang}
              />
            ) : (
              <div className="flex items-center justify-center h-full rounded-2xl bg-[#0c0e12] border border-[#242936] font-mono text-xs text-slate-400">
                {isEn ? "LOADING OPTICAL PLATE..." : "CARGANDO IMAGEN..."}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
