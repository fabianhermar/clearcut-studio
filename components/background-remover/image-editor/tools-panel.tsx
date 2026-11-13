"use client";

import { Eye, RotateCcw, Check, Crop as CropIcon, X } from "lucide-react";
import { TOOLS } from "@/lib/constants";
import type { ToolId } from "@/lib/constants";

export type MatteMode = "checker-light" | "checker-dark" | "solid";

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
  matteMode: MatteMode;
  setMatteMode: (mode: MatteMode) => void;
  solidColor: string;
  setSolidColor: (color: string) => void;
  bakeBackground: boolean;
  setBakeBackground: (bake: boolean) => void;
  onResetMask?: () => void;
  lang?: string;
}

const TOOL_SHORTCUTS: Record<ToolId, string> = {
  move: "V",
  recover: "B",
  erase: "E",
  crop: "C",
};

const TOOL_LABELS_EN: Record<ToolId, string> = {
  move: "Pan",
  recover: "Restore",
  erase: "Erase",
  crop: "Crop",
};

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
  showOriginal,
  setShowOriginal,
  matteMode,
  setMatteMode,
  solidColor,
  setSolidColor,
  bakeBackground,
  setBakeBackground,
  onResetMask,
  lang = "es",
}: ToolsPanelProps) {
  const isEn = lang === "en";

  const presetColors = ["#ffffff", "#111318", "#1e40ff", "#ff4d00"];

  return (
    <div className="space-y-6 text-foreground">
      {/* Tools grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {isEn ? "INSTRUMENTS" : "HERRAMIENTAS"}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">V · B · E · C</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map((t) => {
            const active = tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTool(t.id);
                  if (t.id !== "crop") {
                    setCropMode(false);
                  }
                }}
                className={`relative flex flex-col items-start gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? "bg-primary border-primary text-white shadow-[0_8px_18px_-6px_rgba(30,64,255,0.55)]"
                    : "bg-background border-border text-foreground hover:bg-muted/70 hover:border-foreground/25"
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <t.icon size={18} />
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                      active
                        ? "bg-white/15 border-white/25 text-white"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    {TOOL_SHORTCUTS[t.id]}
                  </span>
                </div>
                <span className="text-xs font-semibold font-accent">
                  {isEn ? TOOL_LABELS_EN[t.id] : t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brush calibration */}
      {(tool === "recover" || tool === "erase") && (
        <div className="p-3.5 rounded-2xl bg-background border border-border space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="brush-size-slider"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"
            >
              {isEn ? "BRUSH RADIUS" : "TAMAÑO DE PINCEL"}
            </label>
            <span className="font-mono text-xs font-bold text-foreground tabular-nums px-2 py-0.5 rounded bg-card border border-border">
              {brushSize} px
            </span>
          </div>

          <input
            id="brush-size-slider"
            type="range"
            min={5}
            max={100}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] text-muted-foreground">
              {isEn ? "Shortcuts: [  ]" : "Atajos: [  ]"}
            </span>
            <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
              <div
                className="rounded-full border border-foreground bg-primary/20 transition-all"
                style={{
                  width: Math.max(4, Math.min(28, brushSize * 0.28)),
                  height: Math.max(4, Math.min(28, brushSize * 0.28)),
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Crop actions */}
      {cropMode && (
        <div className="p-3.5 rounded-2xl bg-background border border-accent/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent flex items-center gap-1.5">
              <CropIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "CROP SELECTION" : "SELECCIÓN DE RECORTE"}</span>
            </span>
          </div>
          <div className="font-mono text-xs text-foreground bg-card border border-border rounded-lg px-3 py-2 tabular-nums">
            {cropRect.width.toFixed(0)} × {cropRect.height.toFixed(0)} px
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onApplyCrop}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 font-accent bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Apply" : "Aplicar"}</span>
            </button>
            <button
              type="button"
              onClick={onCancelCrop}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 font-accent bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Cancel" : "Cancelar"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage Matte / Backdrop Preview & Export Bake */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {isEn ? "BACKDROP MATTE" : "FONDO DE INSPECCIÓN"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMatteMode("checker-light");
              setBakeBackground(false);
            }}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              matteMode === "checker-light"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-background text-foreground hover:bg-muted/70"
            }`}
          >
            <span className="w-4 h-4 rounded checkerboard border border-border shrink-0" />
            <span className="truncate">{isEn ? "Alpha Light" : "Alpha Claro"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMatteMode("checker-dark");
              setBakeBackground(false);
            }}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              matteMode === "checker-dark"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-background text-foreground hover:bg-muted/70"
            }`}
          >
            <span className="w-4 h-4 rounded checkerboard-dark border border-border shrink-0" />
            <span className="truncate">{isEn ? "Alpha Dark" : "Alpha Oscuro"}</span>
          </button>
        </div>

        {/* Preset Studio Backdrop Swatches + Custom Color */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background border border-border">
          <div className="flex items-center gap-1.5">
            {presetColors.map((hex) => {
              const active = matteMode === "solid" && solidColor.toLowerCase() === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Color ${hex}`}
                  onClick={() => {
                    setSolidColor(hex);
                    setMatteMode("solid");
                    setBakeBackground(true);
                  }}
                  className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                    active ? "ring-2 ring-primary scale-110 border-white" : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
            <label
              className="relative w-6 h-6 rounded-full border border-dashed border-muted-foreground flex items-center justify-center text-[10px] font-mono text-foreground cursor-pointer hover:border-primary"
              title={isEn ? "Pick custom color" : "Elegir color personalizado"}
            >
              <span>+</span>
              <input
                type="color"
                value={solidColor}
                onChange={(e) => {
                  setSolidColor(e.target.value);
                  setMatteMode("solid");
                  setBakeBackground(true);
                }}
                className="sr-only"
              />
            </label>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            {matteMode === "solid" ? solidColor : "ALPHA"}
          </span>
        </div>

        {matteMode === "solid" && (
          <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-background border border-border cursor-pointer text-xs text-foreground">
            <span>{isEn ? "Bake background in export" : "Incluir fondo al exportar"}</span>
            <input
              type="checkbox"
              checked={bakeBackground}
              onChange={(e) => setBakeBackground(e.target.checked)}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </label>
        )}
      </div>

      {/* View original & Reset mask */}
      <div className="pt-4 border-t border-border space-y-2">
        <button
          type="button"
          onMouseDown={() => setShowOriginal(true)}
          onMouseUp={() => setShowOriginal(false)}
          onMouseLeave={() => showOriginal && setShowOriginal(false)}
          onTouchStart={() => setShowOriginal(true)}
          onTouchEnd={() => setShowOriginal(false)}
          className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
            showOriginal
              ? "bg-accent border-accent text-white"
              : "bg-background hover:bg-muted/80 border-border text-foreground"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold font-accent">
              {isEn ? "Hold to view original" : "Mantén para ver original"}
            </span>
          </div>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
              showOriginal
                ? "bg-black/20 border-white/25 text-white"
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            {isEn ? "Space" : "Espacio"}
          </span>
        </button>

        {onResetMask && (
          <button
            type="button"
            onClick={onResetMask}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-background hover:bg-muted/80 border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? "Reset cutout mask" : "Restaurar recorte inicial"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
