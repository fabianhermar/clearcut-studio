"use client";

import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  lang?: string;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, lang = "es" }: ZoomControlsProps) {
  const isEn = lang === "en";

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-card/95 backdrop-blur-xs rounded-xl shadow-md px-2 py-1.5 border border-border z-10">
      <button
        type="button"
        onClick={onZoomOut}
        aria-label={isEn ? "Zoom out" : "Alejar"}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="text-xs font-mono font-semibold text-foreground min-w-14 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label={isEn ? "Zoom in" : "Acercar"}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  );
}
