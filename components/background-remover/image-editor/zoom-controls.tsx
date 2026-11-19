"use client";

import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom?: () => void;
  lang?: string;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  lang = "es",
}: ZoomControlsProps) {
  const isEn = lang === "en";

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#14171f]/92 backdrop-blur-xl rounded-full shadow-2xl px-2.5 py-1.5 border border-[#2a3142] text-white z-20">
      <button
        type="button"
        onClick={onZoomOut}
        aria-label={isEn ? "Zoom out" : "Alejar"}
        className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onResetZoom}
        title={isEn ? "Reset zoom to fit (100%)" : "Ajustar a pantalla (100%)"}
        className="px-2.5 py-1 rounded-full hover:bg-white/10 text-xs font-mono font-bold text-white min-w-16 text-center tabular-nums cursor-pointer inline-flex items-center justify-center gap-1"
      >
        <span>{Math.round(zoom * 100)}%</span>
        {zoom !== 1 && onResetZoom && (
          <RotateCcw className="w-3 h-3 text-[#ff834d]" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label={isEn ? "Zoom in" : "Acercar"}
        className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  );
}
