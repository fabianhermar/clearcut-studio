"use client";

import { ZoomInIcon, ZoomOutIcon } from "@/components/icons";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-full shadow-lg px-2 py-1.5 border border-slate-200">
      <button
        onClick={onZoomOut}
        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
      >
        <ZoomOutIcon size={18} />
      </button>
      <span className="text-sm font-medium text-slate-700 min-w-16 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
      >
        <ZoomInIcon size={18} />
      </button>
    </div>
  );
}
