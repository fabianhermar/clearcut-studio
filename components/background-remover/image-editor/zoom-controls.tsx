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
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/95 backdrop-blur-md rounded-full shadow-medium px-2 py-1.5 border border-border z-20">
      <button
        type="button"
        onClick={onZoomOut}
        aria-label={isEn ? "Zoom out" : "Alejar"}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onResetZoom}
        title={isEn ? "Reset zoom to fit (100%)" : "Ajustar a pantalla (100%)"}
        className="px-2.5 py-1 rounded-full hover:bg-muted text-xs font-mono font-semibold text-foreground min-w-16 text-center tabular-nums cursor-pointer inline-flex items-center justify-center gap-1"
      >
        <span>{Math.round(zoom * 100)}%</span>
        {zoom !== 1 && onResetZoom && <RotateCcw className="w-3 h-3 text-muted-foreground" aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label={isEn ? "Zoom in" : "Acercar"}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  );
}
