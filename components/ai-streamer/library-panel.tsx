"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Download,
  CloudUpload,
  Check,
  Maximize2,
  SlidersHorizontal,
  Scissors,
  Trash2,
  Upload,
  Sparkles,
  Film,
  Volume2,
  Image as ImageIcon,
} from "lucide-react";
import {
  blobToDataUrl,
  downloadSingleAsset,
  formatFileSize,
} from "@/lib/ai-studio/export-utils";
import type { GeneratedAsset } from "@/lib/ai-studio/types";

interface LibraryPanelProps {
  assets: GeneratedAsset[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onAddAsset: (asset: GeneratedAsset) => void;
  onDeleteAsset: (id: string) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  onSaveBatchToDrive: (items: GeneratedAsset[]) => Promise<void>;
  onDownloadBatchZip: (items: GeneratedAsset[]) => Promise<void>;
  onSendToResize: (asset: GeneratedAsset) => void;
  onSendToEditImage: (asset: GeneratedAsset) => void;
  onSendToEditVideo: (asset: GeneratedAsset) => void;
  onInspectAsset: (asset: GeneratedAsset) => void;
  lang?: string;
}

const STUDIO_SAMPLES = [
  { src: "/demos/cat.jpg", name: "studio-sample-cat.jpg", prompt: "Editorial feline portrait sample" },
  { src: "/demos/car.jpg", name: "studio-sample-car.jpg", prompt: "Automotive studio lighting sample" },
  { src: "/demos/coffee.jpg", name: "studio-sample-coffee.jpg", prompt: "Artisan espresso product shot sample" },
  { src: "/demos/shoes.jpg", name: "studio-sample-shoes.jpg", prompt: "Footwear commercial photography sample" },
];

export function LibraryPanel({
  assets,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onAddAsset,
  onDeleteAsset,
  onSaveToDrive,
  onSaveBatchToDrive,
  onDownloadBatchZip,
  onSendToResize,
  onSendToEditImage,
  onSendToEditVideo,
  onInspectAsset,
  lang = "es",
}: LibraryPanelProps) {
  const isEn = lang === "en";
  const [filterKind, setFilterKind] = useState<"all" | "image" | "video" | "audio" | "drive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => {
    if (filterKind === "drive" && !a.driveFileId) return false;
    if (filterKind !== "all" && filterKind !== "drive" && a.kind !== filterKind) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        a.prompt.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUploadMedia = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const kind = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : file.type.startsWith("image/")
        ? "image"
        : null;
      if (!kind) continue;
      const dataUrl = await blobToDataUrl(file);
      onAddAsset({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind,
        name: file.name,
        dataUrl,
        mimeType: file.type,
        prompt: file.name,
        provider: "local",
        model: "local-upload",
        sizeBytes: file.size,
        createdAt: Date.now(),
      });
    }
  };

  const handleLoadStudioSamples = async () => {
    for (const sample of STUDIO_SAMPLES) {
      try {
        const res = await fetch(sample.src);
        const blob = await res.blob();
        const dataUrl = await blobToDataUrl(blob);
        onAddAsset({
          id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind: "image",
          name: sample.name,
          dataUrl,
          mimeType: blob.type || "image/jpeg",
          prompt: sample.prompt,
          provider: "local",
          model: "studio-sample",
          sizeBytes: blob.size,
          createdAt: Date.now(),
        });
      } catch {
        // Ignore single sample error
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-5 tactile-surface space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-primary">
              ASSETS // {isEn ? "UNIFIED SESSION LIBRARY" : "BIBLIOTECA DE SESIÓN"}
            </span>
            <h2 className="text-xl font-heading font-bold text-foreground">
              {isEn ? "All Created & Edited Media" : "Todas tus Imágenes, Videos y Audios"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              onChange={(e) => handleUploadMedia(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>{isEn ? "Import Files" : "Importar Archivos"}</span>
            </button>

            <button
              type="button"
              onClick={handleLoadStudioSamples}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff4d00]" />
              <span>{isEn ? "Load Demo Batch (4)" : "Cargar Lote Demo (4)"}</span>
            </button>

            {filtered.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  selectedIds.size === filtered.length
                    ? onClearSelection()
                    : onSelectAll(filtered.map((f) => f.id))
                }
                className="px-3.5 py-1.5 rounded-full bg-foreground text-white text-xs font-semibold cursor-pointer"
              >
                {selectedIds.size === filtered.length
                  ? isEn
                    ? "Deselect All"
                    : "Quitar selección"
                  : isEn
                  ? `Select All (${filtered.length})`
                  : `Seleccionar todo (${filtered.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Filter + Search + View Switch */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/70">
          <div className="flex flex-wrap gap-1">
            {(
              [
                { id: "all", es: "Todo", en: "All" },
                { id: "image", es: "Imágenes", en: "Images" },
                { id: "video", es: "Videos", en: "Videos" },
                { id: "audio", es: "Audio", en: "Audio" },
                { id: "drive", es: "En Drive", en: "In Drive" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterKind(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  filterKind === tab.id
                    ? "bg-foreground text-white"
                    : "bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                {isEn ? tab.en : tab.es}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isEn ? "Filter prompt or model..." : "Buscar prompt o modelo..."}
                className="w-full h-9 pl-8 pr-3 rounded-full bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex p-0.5 rounded-full bg-background border border-border">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded-full cursor-pointer ${
                  viewMode === "grid" ? "bg-foreground text-white" : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-1.5 rounded-full cursor-pointer ${
                  viewMode === "list" ? "bg-foreground text-white" : "text-muted-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center space-y-3 studio-grid">
          <ImageIcon className="w-9 h-9 text-muted-foreground mx-auto" />
          <h3 className="font-heading font-bold text-base text-foreground">
            {isEn ? "Your session library is empty" : "Tu biblioteca de sesión está vacía"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {isEn
              ? "Generate batches with AI, import local images/videos, or load our 4 demo assets to test batch resizing, editing, ZIP export, and Google Drive sync."
              : "Genera lotes con IA, importa imágenes o videos locales, o carga nuestro lote demo de 4 fotos para probar el redimensionado, edición, descarga ZIP y guardado en Google Drive."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((asset) => {
            const isSelected = selectedIds.has(asset.id);
            return (
              <article
                key={asset.id}
                className={`bg-card border rounded-2xl overflow-hidden flex flex-col transition-all ${
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                <div className="aspect-square relative bg-[#0c0e12] flex items-center justify-center overflow-hidden">
                  {asset.kind === "image" && (
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      onClick={() => onInspectAsset(asset)}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  )}
                  {asset.kind === "video" && (
                    <video
                      src={asset.dataUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )}
                  {asset.kind === "audio" && (
                    <div className="p-4 w-full text-center space-y-3">
                      <Volume2 className="w-10 h-10 text-amber-400 mx-auto" />
                      <audio src={asset.dataUrl} controls className="w-full h-8" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleSelect(asset.id)}
                    className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "bg-black/60 border-white/40 text-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[9px] uppercase font-bold">
                    {asset.kind}
                  </span>
                </div>

                <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground line-clamp-2">
                      {asset.prompt || asset.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      {asset.model} · {formatFileSize(asset.sizeBytes)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => downloadSingleAsset(asset)}
                        title={isEn ? "Download" : "Descargar"}
                        className="p-1.5 rounded-lg bg-background hover:bg-primary hover:text-white border border-border cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveToDrive(asset)}
                        title="Google Drive"
                        className="p-1.5 rounded-lg bg-background hover:bg-emerald-600 hover:text-white border border-border cursor-pointer"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                      </button>
                      {asset.kind === "image" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onSendToResize(asset)}
                            title={isEn ? "Resize" : "Redimensionar"}
                            className="p-1.5 rounded-lg bg-background hover:bg-foreground hover:text-white border border-border cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSendToEditImage(asset)}
                            title={isEn ? "Edit" : "Editar"}
                            className="p-1.5 rounded-lg bg-background hover:bg-foreground hover:text-white border border-border cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {asset.kind === "video" && (
                        <button
                          type="button"
                          onClick={() => onSendToEditVideo(asset)}
                          title={isEn ? "Edit Video" : "Editar Video"}
                          className="p-1.5 rounded-lg bg-background hover:bg-foreground hover:text-white border border-border cursor-pointer"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteAsset(asset.id)}
                      title={isEn ? "Delete from session" : "Quitar de la sesión"}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {filtered.map((asset) => {
            const isSelected = selectedIds.has(asset.id);
            return (
              <div
                key={asset.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#faf9f5]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleSelect(asset.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                      isSelected ? "bg-primary border-primary text-white" : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                  <div className="w-11 h-11 rounded-lg bg-[#0c0e12] overflow-hidden flex items-center justify-center shrink-0">
                    {asset.kind === "image" ? (
                      <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                    ) : asset.kind === "video" ? (
                      <Film className="w-5 h-5 text-slate-300" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {asset.prompt || asset.name}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {asset.kind.toUpperCase()} · {asset.model} · {formatFileSize(asset.sizeBytes)}
                      {asset.driveFileId ? " · DRIVE ✓" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadSingleAsset(asset)}
                    className="px-3 py-1.5 rounded-full bg-background hover:bg-primary hover:text-white border border-border text-xs font-semibold cursor-pointer"
                  >
                    {isEn ? "Download" : "Descargar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveToDrive(asset)}
                    className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-600/20 text-xs font-semibold cursor-pointer"
                  >
                    Drive
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
