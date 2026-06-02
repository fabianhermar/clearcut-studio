"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ComparisonSlider } from "./comparison-slider";
import { FormatSelector, type ImageFormat, FORMATS } from "./format-selector";
import { OptimizerStats } from "./optimizer-stats";

interface OptimizerWorkspaceProps {
  file: File;
  onReset: () => void;
  onNewFile: (file: File) => void;
}

// Formats handled by WASM worker (Squoosh-style)
const WASM_FORMATS: ImageFormat[] = ["avif", "webp", "jpeg"];

const DEFAULT_QUALITY: Record<ImageFormat, number> = {
  avif: 50,   // libavif: 50 is excellent quality with real compression
  webp: 75,   // libwebp: matches Squoosh default
  jpeg: 75,   // MozJPEG: matches Squoosh default
  png: 100,   // Lossless — canvas.toBlob, no quality param
};

// ─── Worker client singleton ──────────────────────────────────────────────────
// The worker lives at /public/workers/encoder.js.
// It is served as a static file → NOT bundled by Turbopack.
// The browser runs it natively with full module support and WebAssembly access.
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

    // Transfer the pixel buffer (zero-copy via Transferable)
    const pixelBuffer = imageData.data.buffer.slice(0);
    getWorker().postMessage(
      { id, format, pixelData: pixelBuffer, width: imageData.width, height: imageData.height, quality },
      [pixelBuffer]
    );
  });
}
// ─────────────────────────────────────────────────────────────────────────────

export function OptimizerWorkspace({ file, onReset, onNewFile }: OptimizerWorkspaceProps) {
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [qualities, setQualities] = useState<Record<ImageFormat, number>>({ ...DEFAULT_QUALITY });

  const [originalSrc, setOriginalSrc] = useState<string>("");
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const [originalSize] = useState(file.size);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [encodeError, setEncodeError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quality = qualities[format];

  // Load image on mount
  useEffect(() => {
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
    async (targetFormat: ImageFormat, targetQuality: number) => {
      if (!imgRef.current || !canvasRef.current) return;
      setIsProcessing(true);
      setEncodeError(null);

      try {
        await new Promise((r) => setTimeout(r, 30)); // yield to UI

        const img = imgRef.current;
        const canvas = canvasRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        let blob: Blob;

        if (WASM_FORMATS.includes(targetFormat)) {
          // ── WASM path: libavif / libwebp / MozJPEG (Squoosh-style) ──
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          blob = await encodeViaWorker(targetFormat, imageData, targetQuality);
        } else {
          // ── PNG: lossless, canvas.toBlob is fine ──
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
        setEncodeError(`Error al codificar: ${msg}`);
        setOptimizedSrc(null);
        setOptimizedSize(null);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Debounced re-compress when format/quality changes
  useEffect(() => {
    if (!imgRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => compress(format, quality), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [format, quality, compress]);

  // Initial compress after image loads
  useEffect(() => {
    if (dimensions.width > 0) compress(format, quality);
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
      ? [{ label: "Baja", value: 25 }, { label: "Media", value: 50 }, { label: "Alta", value: 75 }]
      : format === "jpeg"
      ? [{ label: "Baja", value: 50 }, { label: "Media", value: 75 }, { label: "Alta", value: 90 }]
      : [{ label: "Baja", value: 40 }, { label: "Media", value: 75 }, { label: "Alta", value: 90 }];

  const isLargerThanOriginal =
    optimizedSize !== null && optimizedSize > originalSize && format !== "png";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onReset} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Optimizador de Imágenes</h1>
              <p className="text-xs text-muted-foreground font-accent truncate max-w-48">{file.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onNewFile(f); }} />
          <button onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border text-foreground text-sm font-medium rounded-xl transition-colors font-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Otra imagen
          </button>
          <button onClick={handleDownload} disabled={!optimizedSrc || isProcessing}
            className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-primary/20 font-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card/50 p-5 overflow-y-auto space-y-6 shrink-0">

          <FormatSelector selected={format} onChange={handleFormatChange} />

          {/* WASM encoder badge */}
          {WASM_FORMATS.includes(format) && !encodeError && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-accent flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>
                <strong>
                  {format === "avif" ? "libavif" : format === "webp" ? "libwebp" : "MozJPEG"}
                </strong>
                {" "}· Encoder WASM — igual que Squoosh. 100% local, sin servidores.
              </span>
            </div>
          )}

          {/* Encode error */}
          {encodeError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-accent flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {encodeError}
            </div>
          )}

          {/* Larger than original */}
          {isLargerThanOriginal && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-accent flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              El resultado supera el original. Baja la calidad para comprimir más.
            </div>
          )}

          {/* PNG notice */}
          {format === "png" && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs font-accent flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              PNG es sin pérdida. Para reducir tamaño, prueba WebP o AVIF.
            </div>
          )}

          {/* Quality slider */}
          {supportsQuality && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-accent">Calidad</label>
                <span className="text-sm font-bold text-foreground font-heading tabular-nums">{quality}</span>
              </div>
              <input type="range" min={1} max={100} value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground font-accent">
                <span>Máx compresión</span><span>Máx calidad</span>
              </div>
              <div className="flex gap-1.5">
                {qualityPresets.map((preset) => (
                  <button key={preset.label} onClick={() => handleQualityChange(preset.value)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition-all font-accent ${
                      quality === preset.value
                        ? "bg-primary text-white border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/40"
                    }`}>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <OptimizerStats
            originalSize={originalSize}
            optimizedSize={optimizedSize}
            width={dimensions.width}
            height={dimensions.height}
            format={format}
            isProcessing={isProcessing}
          />

          <button onClick={handleDownload} disabled={!optimizedSrc || isProcessing}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-semibold rounded-xl transition-colors font-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar imagen optimizada
          </button>

          <p className="text-[11px] text-muted-foreground/60 text-center font-accent mt-auto pt-4 border-t border-border/50">
            * ClearCut Studio utiliza IA para eliminar fondos y puede cometer errores.
          </p>
        </aside>

        {/* Preview */}
        <main className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-canvas min-h-[400px]">
          <div className="w-full h-full max-w-5xl max-h-[75vh] min-h-[340px]">
            {originalSrc ? (
              <ComparisonSlider originalSrc={originalSrc} optimizedSrc={optimizedSrc} isProcessing={isProcessing} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground font-accent text-sm">
                Cargando imagen...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
