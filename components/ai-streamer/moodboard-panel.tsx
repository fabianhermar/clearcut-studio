"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  Download,
  CloudUpload,
  Archive,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import {
  downloadSingleAsset,
  exportMoodboardContactSheet,
} from "@/lib/ai-studio/export-utils";
import type { GeneratedAsset } from "@/lib/ai-studio/types";

interface MoodboardPanelProps {
  assets: GeneratedAsset[];
  onAddAsset: (asset: GeneratedAsset) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  onDownloadBatchZip: (items: GeneratedAsset[]) => Promise<void>;
  lang?: string;
}

export function MoodboardPanel({
  assets,
  onAddAsset,
  onSaveToDrive,
  onDownloadBatchZip,
  lang = "es",
}: MoodboardPanelProps) {
  const isEn = lang === "en";
  const imageAssets = assets.filter((a) => a.kind === "image");

  const [boardTitle, setBoardTitle] = useState(
    isEn ? "Campaign Visual Direction" : "Dirección Visual de Campaña"
  );
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  const [showCaptions, setShowCaptions] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportContactSheet = async (saveDrive: boolean) => {
    if (imageAssets.length === 0) return;
    setExporting(true);
    try {
      const sheet = await exportMoodboardContactSheet(imageAssets, {
        title: boardTitle,
        columns,
        showCaptions,
        darkTheme,
      });
      const created: GeneratedAsset = {
        id: `moodboard-${Date.now()}`,
        kind: "image",
        name: `${boardTitle || "moodboard"}-contact-sheet`,
        dataUrl: sheet.dataUrl,
        mimeType: "image/png",
        prompt: `Moodboard: ${boardTitle}`,
        provider: "local",
        model: "contact-sheet",
        width: sheet.width,
        height: sheet.height,
        sizeBytes: sheet.sizeBytes,
        createdAt: Date.now(),
      };
      onAddAsset(created);
      if (saveDrive) {
        await onSaveToDrive(created);
      } else {
        await downloadSingleAsset(created);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-5 tactile-surface flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-primary">
            STORYBOARD // {isEn ? "OPTICAL CONTACT SHEET" : "MESA DE LUZ Y HOJA DE CONTACTO"}
          </span>
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            className="w-full max-w-md bg-transparent text-xl font-heading font-bold text-foreground border-b border-transparent focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-full bg-background border border-border text-xs font-mono">
            {([2, 3, 4] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColumns(c)}
                className={`px-2.5 py-1 rounded-full font-bold cursor-pointer ${
                  columns === c ? "bg-foreground text-white" : "text-muted-foreground"
                }`}
              >
                {c} COL
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDarkTheme((d) => !d)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border text-xs font-semibold cursor-pointer"
          >
            {darkTheme ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{darkTheme ? "Darkroom" : "Paper"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCaptions((v) => !v)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer ${
              showCaptions
                ? "bg-foreground text-white border-foreground"
                : "bg-background border-border"
            }`}
          >
            {isEn ? "Captions" : "Notas"}
          </button>

          <button
            type="button"
            disabled={imageAssets.length === 0 || exporting}
            onClick={() => handleExportContactSheet(false)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold tactile-button cursor-pointer"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isEn ? "Export PNG Sheet" : "Exportar Hoja PNG"}</span>
          </button>

          <button
            type="button"
            disabled={imageAssets.length === 0 || exporting}
            onClick={() => handleExportContactSheet(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-600 hover:text-white disabled:opacity-40 text-emerald-800 border border-emerald-600/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Drive</span>
          </button>

          <button
            type="button"
            disabled={imageAssets.length === 0}
            onClick={() => onDownloadBatchZip(imageAssets)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background hover:bg-muted disabled:opacity-40 border border-border text-xs font-semibold cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>ZIP</span>
          </button>
        </div>
      </div>

      {/* Visual Board */}
      <div
        className={`rounded-2xl border p-6 transition-colors ${
          darkTheme
            ? "bg-[#0c0e12] border-[#242936] text-white"
            : "bg-[#faf9f5] border-border text-foreground"
        }`}
      >
        {imageAssets.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <LayoutGrid className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-sm font-semibold">
              {isEn
                ? "Generate or upload images to compose your visual moodboard"
                : "Genera o sube imágenes para componer tu moodboard visual"}
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              columns === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : columns === 4
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {imageAssets.map((img, idx) => (
              <figure
                key={img.id}
                className={`rounded-xl border overflow-hidden ${
                  darkTheme ? "bg-[#14171f] border-[#242936]" : "bg-card border-border"
                }`}
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-black">
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[10px] font-bold">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                {showCaptions && (
                  <figcaption className="p-3">
                    <p className="text-xs font-medium line-clamp-2">{img.prompt || img.name}</p>
                    <p className="text-[10px] font-mono opacity-65 mt-1">
                      {img.provider.toUpperCase()} · {img.model}
                    </p>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
