"use client";

import { useState } from "react";
import { Download, ArrowRight, Check, Upload } from "lucide-react";
import { EXPORT_FORMATS } from "@/lib/constants";
import type { ExportFormat } from "@/lib/constants";

interface ExportPanelProps {
  processedImage: string;
  canvasSize: { width: number; height: number };
  onDownload: (format: ExportFormat) => void;
  onUploadAnother: () => void;
  lang?: string;
  className?: string;
}

export function ExportPanel({
  processedImage,
  canvasSize,
  onDownload,
  onUploadAnother,
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
      className={`w-full lg:w-80 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col shrink-0 ${className}`}
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-foreground font-heading text-sm">
          {isEn ? "Export Cutout" : "Exportar recorte"}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isEn ? "Select a format to download immediately" : "Elige el formato para descargar al instante"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2.5">
          {EXPORT_FORMATS.map((format) => {
            const isJustDownloaded = downloadedId === format.id;
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => handleSelectFormat(format.id)}
                className="w-full flex items-center gap-3 p-3.5 bg-background hover:bg-muted/80 rounded-xl transition-all group border border-border hover:border-primary/40 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                    isJustDownloaded
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-card text-muted-foreground group-hover:text-primary border-border"
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
                    {format.badge && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          format.badge === "Recomendado"
                            ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {format.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{format.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Image info */}
      <div className="p-4 border-t border-border bg-muted/40">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-10 bg-card rounded-lg overflow-hidden border border-border checkerboard shrink-0">
            <img
              src={processedImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">
              {isEn ? "Processed output" : "Imagen procesada"}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {canvasSize.width} × {canvasSize.height} px
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
          <Check className="w-3.5 h-3.5 text-emerald-700" />
          <span>
            {isEn ? "Background removed locally" : "Fondo eliminado localmente"}
          </span>
        </div>
      </div>

      {/* New image button */}
      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={onUploadAnother}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{isEn ? "Upload another image" : "Subir otra imagen"}</span>
        </button>
      </div>
    </aside>
  );
}
