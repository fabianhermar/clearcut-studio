"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Maximize2,
  Upload,
  Download,
  Archive,
  CloudUpload,
  Check,
  Loader2,
  Lock,
  Unlock,
  Plus,
} from "lucide-react";
import {
  blobToDataUrl,
  DEFAULT_RESIZE_CONFIG,
  downloadSingleAsset,
  formatFileSize,
  resizeImageDataUrl,
} from "@/lib/ai-studio/export-utils";
import type { GeneratedAsset, ResizeConfig, ResizeFitMode } from "@/lib/ai-studio/types";

interface ResizeImagePanelProps {
  assets: GeneratedAsset[];
  initialAssetIds?: string[];
  onAddAsset: (asset: GeneratedAsset) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  onDownloadBatchZip: (items: GeneratedAsset[]) => Promise<void>;
  lang?: string;
}

const SIZE_PRESETS = [
  { label: "IG Square", w: 1080, h: 1080 },
  { label: "IG 4:5", w: 1080, h: 1350 },
  { label: "Reels 9:16", w: 1080, h: 1920 },
  { label: "Full HD", w: 1920, h: 1080 },
  { label: "4K UHD", w: 3840, h: 2160 },
  { label: "OG Social", w: 1200, h: 630 },
  { label: "Web Hero", w: 1600, h: 900 },
  { label: "Thumb 512", w: 512, h: 512 },
];

export function ResizeImagePanel({
  assets,
  initialAssetIds = [],
  onAddAsset,
  onSaveToDrive,
  onDownloadBatchZip,
  lang = "es",
}: ResizeImagePanelProps) {
  const isEn = lang === "en";
  const imageAssets = assets.filter((a) => a.kind === "image");

  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>(initialAssetIds);
  const [config, setConfig] = useState<ResizeConfig>({ ...DEFAULT_RESIZE_CONFIG });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<GeneratedAsset[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialAssetIds.length > 0) {
      setSelectedQueueIds(initialAssetIds);
    } else if (selectedQueueIds.length === 0 && imageAssets.length > 0) {
      setSelectedQueueIds([imageAssets[0].id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAssetIds.join(",")]);

  const toggleQueue = (id: string) => {
    setSelectedQueueIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUploadLocal = async (files: FileList | null) => {
    if (!files) return;
    const newIds: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await blobToDataUrl(file);
      const id = `local-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      onAddAsset({
        id,
        kind: "image",
        name: file.name,
        dataUrl,
        mimeType: file.type,
        prompt: file.name,
        provider: "local",
        model: "local-upload",
        sizeBytes: file.size,
        createdAt: Date.now(),
      });
      newIds.push(id);
    }
    if (newIds.length > 0) {
      setSelectedQueueIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const handleProcessResize = async () => {
    const queue = imageAssets.filter((a) => selectedQueueIds.includes(a.id));
    if (queue.length === 0) return;

    setIsProcessing(true);
    const out: GeneratedAsset[] = [];

    try {
      for (const item of queue) {
        const resized = await resizeImageDataUrl(item.dataUrl, config);
        const created: GeneratedAsset = {
          id: `resized-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind: "image",
          name: `${item.name.replace(/\.[^.]+$/, "")}-${resized.width}x${resized.height}`,
          dataUrl: resized.dataUrl,
          mimeType: resized.mimeType,
          prompt: item.prompt,
          provider: item.provider,
          model: `${item.model} (resized)`,
          width: resized.width,
          height: resized.height,
          sizeBytes: resized.sizeBytes,
          createdAt: Date.now(),
        };
        out.push(created);
        onAddAsset(created);
      }
      setResults(out);
    } finally {
      setIsProcessing(false);
    }
  };

  const queueAssets = imageAssets.filter((a) => selectedQueueIds.includes(a.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Queue Selection & Upload */}
        <section className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 tactile-surface space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/80">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-primary">
                OPTICAL SCALER // {isEn ? "SINGLE & BATCH RESIZE" : "REDIMENSIONADO POR LOTES"}
              </span>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {isEn ? "Select Images to Resize" : "Selecciona Imágenes a Redimensionar"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleUploadLocal(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>{isEn ? "Upload Images" : "Subir Imágenes"}</span>
              </button>
              {imageAssets.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedQueueIds(
                      selectedQueueIds.length === imageAssets.length
                        ? []
                        : imageAssets.map((a) => a.id)
                    )
                  }
                  className="px-3 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-mono font-semibold cursor-pointer"
                >
                  {selectedQueueIds.length === imageAssets.length
                    ? isEn
                      ? "Clear"
                      : "Ninguna"
                    : isEn
                    ? `All (${imageAssets.length})`
                    : `Todas (${imageAssets.length})`}
                </button>
              )}
            </div>
          </div>

          {imageAssets.length === 0 ? (
            <div className="py-12 border border-dashed border-border rounded-xl bg-background/60 text-center space-y-3">
              <Maximize2 className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                {isEn ? "No images loaded yet" : "Aún no hay imágenes en tu sesión"}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEn ? "Add local images" : "Cargar imágenes locales"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {imageAssets.map((img) => {
                const active = selectedQueueIds.includes(img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggleQueue(img.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                      active
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-md flex items-center justify-center ${
                        active ? "bg-primary text-white" : "bg-black/55 text-white/60"
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                    </span>
                    {img.width && img.height && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                        {img.width}×{img.height}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Dimensions & Fit Controls */}
        <section className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 tactile-surface space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              {isEn ? "TARGET PARAMETERS" : "PARÁMETROS DE SALIDA"}
            </span>
            <div className="flex bg-background border border-border p-0.5 rounded-full text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, mode: "dimensions" }))}
                className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer ${
                  config.mode === "dimensions" ? "bg-foreground text-white" : "text-muted-foreground"
                }`}
              >
                PX
              </button>
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, mode: "percentage" }))}
                className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer ${
                  config.mode === "percentage" ? "bg-foreground text-white" : "text-muted-foreground"
                }`}
              >
                %
              </button>
            </div>
          </div>

          {config.mode === "dimensions" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-11 gap-2 items-end">
                <div className="col-span-5">
                  <label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1">
                    {isEn ? "Width (px)" : "Ancho (px)"}
                  </label>
                  <input
                    type="number"
                    min={16}
                    max={8192}
                    value={config.width}
                    onChange={(e) => setConfig((c) => ({ ...c, width: Number(e.target.value) || 16 }))}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-border text-sm font-mono font-bold"
                  />
                </div>
                <div className="col-span-1 flex justify-center pb-1.5">
                  <button
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, lockAspect: !c.lockAspect }))}
                    title={isEn ? "Lock aspect ratio" : "Mantener proporción"}
                    className={`p-1.5 rounded-lg border cursor-pointer ${
                      config.lockAspect
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {config.lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="col-span-5">
                  <label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1">
                    {isEn ? "Height (px)" : "Alto (px)"}
                  </label>
                  <input
                    type="number"
                    min={16}
                    max={8192}
                    value={config.height}
                    onChange={(e) => setConfig((c) => ({ ...c, height: Number(e.target.value) || 16 }))}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-border text-sm font-mono font-bold"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {SIZE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, width: p.w, height: p.h }))}
                    className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      config.width === p.w && config.height === p.h
                        ? "bg-foreground text-white border-foreground"
                        : "bg-background hover:bg-muted border-border text-foreground"
                    }`}
                  >
                    <div className="text-[10px] font-bold truncate">{p.label}</div>
                    <div className="text-[9px] font-mono opacity-75">
                      {p.w}×{p.h}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>{isEn ? "Scale Factor" : "Factor de Escala"}</span>
                <span className="text-primary">{config.percentage}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={config.percentage}
                onChange={(e) => setConfig((c) => ({ ...c, percentage: Number(e.target.value) }))}
              />
              <div className="flex gap-1.5">
                {[25, 50, 75, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, percentage: pct }))}
                    className={`flex-1 py-1 rounded-lg border text-xs font-mono font-semibold cursor-pointer ${
                      config.percentage === pct
                        ? "bg-foreground text-white border-foreground"
                        : "bg-background border-border"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fit Mode */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">
              {isEn ? "Fit Strategy" : "Modo de Ajuste"}
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: "contain", es: "Contener", en: "Contain" },
                  { id: "cover", es: "Cubrir", en: "Cover" },
                  { id: "pad", es: "Rellenar", en: "Pad" },
                  { id: "stretch", es: "Estirar", en: "Stretch" },
                ] as Array<{ id: ResizeFitMode; es: string; en: string }>
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setConfig((c) => ({ ...c, fit: m.id }))}
                  className={`py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                    config.fit === m.id
                      ? "bg-primary text-white border-primary"
                      : "bg-background border-border text-foreground"
                  }`}
                >
                  {isEn ? m.en : m.es}
                </button>
              ))}
            </div>
          </div>

          {/* Output Format & Quality */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">
                {isEn ? "Format" : "Formato"}
              </span>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-background border border-border">
                {(["png", "webp", "jpeg"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, format: fmt }))}
                    className={`py-1 rounded-lg text-[11px] font-mono font-bold uppercase cursor-pointer ${
                      config.format === fmt ? "bg-foreground text-white" : "text-muted-foreground"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">
                <span>{isEn ? "Quality" : "Calidad"}</span>
                <span>{config.quality}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                value={config.quality}
                disabled={config.format === "png"}
                onChange={(e) => setConfig((c) => ({ ...c, quality: Number(e.target.value) }))}
              />
            </div>
          </div>

          {(config.fit === "pad" || config.format === "jpeg") && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
              <span className="text-xs font-medium text-foreground">
                {isEn ? "Matte Background" : "Color de Fondo"}
              </span>
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => setConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
                className="w-8 h-7 rounded cursor-pointer border border-border"
              />
            </div>
          )}

          <button
            type="button"
            disabled={queueAssets.length === 0 || isProcessing}
            onClick={handleProcessResize}
            className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold inline-flex items-center justify-center gap-2 tactile-button cursor-pointer"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span>
              {isEn
                ? `Resize ${queueAssets.length} Image${queueAssets.length === 1 ? "" : "s"}`
                : `Redimensionar ${queueAssets.length} ${queueAssets.length === 1 ? "Imagen" : "Imágenes"}`}
            </span>
          </button>
        </section>
      </div>

      {/* Resized Batch Output */}
      {results.length > 0 && (
        <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800">
                OUTPUT READY // {results.length} {isEn ? "RESIZED" : "REDIMENSIONADAS"}
              </span>
              <h3 className="font-heading font-bold text-lg text-foreground">
                {isEn ? "Resized Results" : "Resultados Listos para Descargar"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onDownloadBatchZip(results)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground hover:bg-primary text-white text-xs font-semibold cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isEn ? `Download ZIP (${results.length})` : `Descargar Lote ZIP (${results.length})`}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {results.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-xl overflow-hidden bg-background"
              >
                <div className="aspect-square bg-[#0c0e12] checkerboard-dark flex items-center justify-center overflow-hidden">
                  <img src={item.dataUrl} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-xs font-mono font-bold text-foreground">
                    {item.width} × {item.height} px · {formatFileSize(item.sizeBytes)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => downloadSingleAsset(item)}
                      className="flex-1 py-1.5 rounded-lg bg-card hover:bg-primary hover:text-white border border-border text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? "Download" : "Descargar"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveToDrive(item)}
                      className="p-1.5 rounded-lg bg-card hover:bg-emerald-600 hover:text-white border border-border text-muted-foreground cursor-pointer"
                      title="Google Drive"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
