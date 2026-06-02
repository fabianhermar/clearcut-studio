"use client";

import { EyeIcon } from "@/components/icons";
import { TOOLS } from "@/lib/constants";
import type { ToolId } from "@/lib/constants";

interface ToolsPanelProps {
  tool: ToolId;
  setTool: (tool: ToolId) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  cropMode: boolean;
  setCropMode: (mode: boolean) => void;
  cropRect: { x: number; y: number; width: number; height: number };
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  showOriginal: boolean;
  setShowOriginal: (show: boolean) => void;
}

export function ToolsPanel({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  cropMode,
  setCropMode,
  cropRect,
  onApplyCrop,
  onCancelCrop,
  setShowOriginal,
}: ToolsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Tools grid */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 block font-accent">
          Herramientas
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTool(t.id);
                if (t.id !== "crop") {
                  setCropMode(false);
                }
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                tool === t.id
                  ? "bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <t.icon size={20} />
              <span className="text-xs font-medium font-accent">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brush size */}
      {(tool === "recover" || tool === "erase") && (
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 block font-accent">
            Tamano del pincel
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min={5}
              max={100}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex items-center justify-between">
              <div
                className="rounded-full bg-slate-800"
                style={{ width: brushSize / 2, height: brushSize / 2 }}
              />
              <span className="text-sm text-slate-600 font-medium">{brushSize}px</span>
            </div>
          </div>
        </div>
      )}

      {/* Crop actions */}
      {cropMode && (
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 block font-accent">
            Recorte
          </label>
          <div className="space-y-2">
            <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              {cropRect.width.toFixed(0)} x {cropRect.height.toFixed(0)}px
            </div>
            <button
              onClick={onApplyCrop}
              className="w-full py-2.5 font-accent bg-linear-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Aplicar recorte
            </button>
            <button
              onClick={onCancelCrop}
              className="w-full py-2.5 font-accent bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* View original */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 block font-accent">
          Vista
        </label>
        <button
          onMouseDown={() => setShowOriginal(true)}
          onMouseUp={() => setShowOriginal(false)}
          onMouseLeave={() => setShowOriginal(false)}
          className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-500 border border-slate-200">
            <EyeIcon size={18} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-700 font-accent">Ver original</p>
            <p className="text-xs text-slate-400 font-accent">Manten presionado</p>
          </div>
        </button>
      </div>
    </div>
  );
}
