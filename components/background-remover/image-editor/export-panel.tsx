"use client";

import { useState } from "react";
import { Download, ArrowUpRight, Check, Upload, Layers } from "lucide-react";
import { EXPORT_FORMATS } from "@/lib/constants";
import type { ExportFormat } from "@/lib/constants";

interface ExportPanelProps {
  processedImage: string;
  canvasSize: { width: number; height: number };
  onDownload: (format: ExportFormat) => void;
  onUploadAnother: () => void;
  solidMatteHex?: string | null;
  lang?: string;
  className?: string;
}

const FORMAT_DESC_EN: Record<ExportFormat, string> = {
  png: "Lossless alpha transparency",
  webp: "30% lighter with alpha",
  avif: "Maximum modern compression",
  jpg: "Solid backdrop matte",
};

const FORMAT_BADGE_EN: Record<string, string> = {
  Recomendado: "Recommended",
  Optimizado: "Optimized",
  Moderno: "Modern",
};

export function ExportPanel({
  processedImage,
  canvasSize,
  onDownload,
  onUploadAnother,
  solidMatteHex = null,
  lang = "es",
  className = "",
}: ExportPanelProps) {
  const isEn = lang === "en";
  const [downloadedId, setDownloadedId] = useState<ExportFormat | null>(null);

  const handleSelectFormat = (format: ExportFormat) => {
    onDownload(format);
    setDownloadedId(format);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  return (
    <aside
      className={`w-full lg:w-80 bg-card text-foreground border-t lg:border-t-0 lg:border-l border-border flex flex-col shrink-0 ${className}`}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-foreground font-heading text-sm">
            {isEn ? "Export Cutout" : "Exportar recorte"}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
            FULL RES
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isEn
            ? "Select target format to render and download locally"
            : "Elige formato para exportar al instante en resolución nativa"}
        </p>
      </div>

      {/* Live Preview Specimen */}
      <div className="p-4 border-b border-border bg-background/60">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-xl overflow-hidden border border-border shrink-0 ${
              solidMatteHex ? "" : "checkerboard"
            }`}
            style={solidMatteHex ? { backgroundColor: solidMatteHex } : undefined}
          >
            <img
              src={processedImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-bold text-foreground truncate">
              {isEn ? "Active Canvas Layer" : "Capa activa del lienzo"}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {canvasSize.width} × {canvasSize.height} px
            </p>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-800 font-semibold">
              <Layers className="w-3 h-3 text-emerald-700" aria-hidden="true" />
              <span>
                {solidMatteHex
                  ? `${isEn ? "Matte" : "Fondo"} ${solidMatteHex.toUpperCase()}`
                  : isEn
                  ? "Transparent Alpha"
                  : "Alpha Transparente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Format Buttons */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          {isEn ? "OUTPUT FORMATS" : "FORMATOS DE SALIDA"}
        </div>
        <div className="space-y-2.5">
          {EXPORT_FORMATS.map((format) => {
            const isJustDownloaded = downloadedId === format.id;
            const badgeText = format.badge
              ? isEn
                ? FORMAT_BADGE_EN[format.badge] || format.badge
                : format.badge
              : null;

            return (
              <button
                key={format.id}
                type="button"
                onClick={() => handleSelectFormat(format.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group border cursor-pointer ${
                  isJustDownloaded
                    ? "bg-emerald-500/10 border-emerald-600/40"
                    : "bg-background hover:bg-muted/70 border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors shrink-0 ${
                    isJustDownloaded
                      ? "bg-emerald-700 text-white border-emerald-700"
                      : "bg-card text-muted-foreground group-hover:text-white group-hover:bg-primary border-border group-hover:border-primary"
                  }`}
                >
                  {isJustDownloaded ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground font-heading text-sm">
                      {format.label}
                    </span>
                    {badgeText && (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          format.badge === "Recomendado"
                            ? "bg-emerald-500/10 text-emerald-800 border border-emerald-700/20"
                            : "bg-primary/10 text-primary border border-primary/25"
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {isEn ? FORMAT_DESC_EN[format.id] : format.desc}
                  </p>
                </div>

                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* New image button */}
      <div className="p-4 border-t border-border bg-background/50">
        <button
          type="button"
          onClick={onUploadAnother}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-foreground hover:bg-primary text-white text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          <span>{isEn ? "Open another image" : "Subir otra imagen"}</span>
        </button>
      </div>
    </aside>
  );
}
