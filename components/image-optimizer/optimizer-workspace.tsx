"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ComparisonSlider } from "./comparison-slider";
import { FormatSelector, type ImageFormat, FORMATS } from "./format-selector";
import { OptimizerStats } from "./optimizer-stats";
import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { Download, ImagePlus, Cpu, AlertTriangle, Info } from "lucide-react";

interface OptimizerWorkspaceProps {
  file: File;
  onReset: () => void;
  onClose?: () => void;
  onNewFile: (file: File) => void;
  lang?: string;
}

const WASM_FORMATS: ImageFormat[] = ["avif", "webp", "jpeg"];

const DEFAULT_QUALITY: Record<ImageFormat, number> = {
  avif: 50,
  webp: 75,
  jpeg: 75,
  png: 100,
};

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
      { id, format, pixelData: pixelBuffer, width: imageData.width, height: imageData.height, quality },
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
  const [qualities, setQualities] = useState<Record<ImageFormat, number>>({ ...DEFAULT_QUALITY });

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

  useEffect(() => {
    setOriginalSize(file.size);
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
        await new Promise((r) => setTimeout(r, 30));

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
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
    debounceRef.current = setTimeout(() => compress(format, quality), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [format, quality, compress]);

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
      ? [
          { label: isEn ? "Low" : "Baja", value: 25 },
          { label: isEn ? "Balanced" : "Media", value: 50 },
          { label: isEn ? "High" : "Alta", value: 75 },
        ]
      : format === "jpeg"
      ? [
          { label: isEn ? "Low" : "Baja", value: 50 },
          { label: isEn ? "Balanced" : "Media", value: 75 },
          { label: isEn ? "High" : "Alta", value: 90 },
        ]
      : [
          { label: isEn ? "Low" : "Baja", value: 40 },
          { label: isEn ? "Balanced" : "Media", value: 75 },
          { label: isEn ? "High" : "Alta", value: 90 },
        ];

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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background hover:bg-muted border border-border text-foreground text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isEn ? "New image" : "Otra imagen"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!optimizedSrc || isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Download" : "Descargar"}</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Optical Atelier Inspector Rail */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-r border-border bg-card p-5 overflow-y-auto space-y-5 shrink-0 order-2 lg:order-1">
          <FormatSelector selected={format} onChange={handleFormatChange} />

          {WASM_FORMATS.includes(format) && !encodeError && (
            <div className="p-3 rounded-xl bg-primary/8 border border-primary/25 text-foreground text-xs flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-mono font-semibold text-primary">
                  {format === "avif" ? "libavif" : format === "webp" ? "libwebp" : "MozJPEG"}
                </strong>{" "}
                · {isEn ? "WASM Worker encoder. 100% local." : "Codificador WASM en Worker. 100% local."}
              </span>
            </div>
          )}

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
                  ? "Output exceeds original file size. Lower the quality slider to compress further."
                  : "El resultado supera el peso original. Reduce la calidad para comprimir más."}
              </span>
            </div>
          )}

          {format === "png" && (
            <div className="p-3 rounded-xl bg-background border border-border text-muted-foreground text-xs flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                {isEn
                  ? "PNG is lossless. To reduce file weight significantly, select WebP or AVIF."
                  : "PNG es sin pérdida. Para reducir el peso drásticamente, elige WebP o AVIF."}
              </span>
            </div>
          )}

          {supportsQuality && (
            <div className="p-3.5 rounded-2xl bg-background border border-border space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="optimizer-quality-slider"
                  className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]"
                >
                  {isEn ? "QUALITY" : "CALIDAD"}
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
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>{isEn ? "Smallest" : "Máx. compresión"}</span>
                <span>{isEn ? "Max fidelity" : "Máx. fidelidad"}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {qualityPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQualityChange(preset.value)}
                    className={`py-1.5 text-[11px] font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                      quality === preset.value
                        ? "bg-primary text-white border-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
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

          <button
            type="button"
            onClick={handleDownload}
            disabled={!optimizedSrc || isProcessing}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-sm font-semibold rounded-full transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isEn ? "Download optimized image" : "Descargar imagen optimizada"}</span>
          </button>
        </aside>

        {/* Central Light Studio Preview */}
        <main className="w-full h-[50vh] lg:h-auto lg:flex-1 flex items-center justify-center p-4 lg:p-8 bg-[#ebe8e0] studio-grid shrink-0 order-1 lg:order-2">
          <div className="w-full h-full max-w-5xl max-h-[78vh] min-h-[320px]">
            {originalSrc ? (
              <ComparisonSlider
                originalSrc={originalSrc}
                optimizedSrc={optimizedSrc}
                isProcessing={isProcessing}
                lang={lang}
              />
            ) : (
              <div className="flex items-center justify-center h-full font-mono text-xs text-muted-foreground">
                {isEn ? "LOADING PLATE..." : "CARGANDO IMAGEN..."}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
