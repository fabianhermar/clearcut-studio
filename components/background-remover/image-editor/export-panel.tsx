"use client";

import { DownloadIcon, ArrowRightIcon, CheckIcon, UploadIcon } from "@/components/icons";
import { EXPORT_FORMATS } from "@/lib/constants";
import type { ExportFormat } from "@/lib/constants";

interface ExportPanelProps {
  processedImage: string;
  canvasSize: { width: number; height: number };
  onDownload: (format: ExportFormat) => void;
  onUploadAnother: () => void;
}

export function ExportPanel({
  processedImage,
  canvasSize,
  onDownload,
  onUploadAnother,
}: ExportPanelProps) {
  return (
    <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 order-3">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 font-heading">Exportar imagen</h3>
        <p className="text-sm text-slate-500 mt-0.5 font-accent">Elige el formato de descarga</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {EXPORT_FORMATS.map((format) => (
            <button
              key={format.id}
              onClick={() => onDownload(format.id)}
              className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group border border-transparent hover:border-slate-200"
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 border border-slate-200 transition-colors">
                <DownloadIcon size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 font-heading">{format.label}</span>
                  {format.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium font-accent ${
                      format.badge === "Recomendado"
                        ? "bg-emerald-100 text-emerald-700"
                        : format.badge === "Optimizado"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-cyan-100 text-cyan-700"
                    }`}>
                      {format.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-accent">{format.desc}</p>
              </div>
              <ArrowRightIcon size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Image info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-slate-200">
            <img
              src={processedImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 font-accent">Imagen procesada</p>
            <p className="text-xs text-slate-500 font-accent">
              {canvasSize.width} x {canvasSize.height}px
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckIcon size={14} />
          <span className="font-accent">Fondo eliminado correctamente</span>
        </div>
      </div>

      {/* New image button */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onUploadAnother}
          className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25"
        >
          <UploadIcon size={18} />
          <span className="font-accent">Subir otra imagen</span>
        </button>
      </div>
    </aside>
  );
}
