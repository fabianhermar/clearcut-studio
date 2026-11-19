"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { Check, Cpu, X, Crosshair } from "lucide-react";

interface ProcessingScreenProps {
  progress: number;
  originalImage: string | null;
  onCancel?: () => void;
  lang?: string;
}

export function ProcessingScreen({
  progress,
  originalImage,
  onCancel,
  lang = "es",
}: ProcessingScreenProps) {
  const isEn = lang === "en";
  const clamped = Math.max(0, Math.min(100, progress || 0));

  const statusText = isEn
    ? clamped < 30
      ? "Initializing ONNX neural runtime in browser..."
      : clamped < 65
      ? "Isolating subject boundaries and foreground..."
      : clamped < 92
      ? "Generating high-precision alpha channel..."
      : "Preparing darkroom editor workspace..."
    : clamped < 30
    ? "Inicializando motor neuronal ONNX en tu navegador..."
    : clamped < 65
    ? "Aislando contornos del sujeto y primer plano..."
    : clamped < 92
    ? "Generando máscara de transparencia alpha..."
    : "Preparando el espacio de edición Darkroom...";

  const steps = isEn
    ? ["Model", "Analysis", "Alpha", "Studio"]
    : ["Modelo", "Análisis", "Alpha", "Estudio"];

  return (
    <div className="min-h-screen bg-background studio-grid text-foreground flex flex-col">
      <WorkspaceHeader
        slug="background-remover"
        lang={lang}
        onClose={onCancel}
        subtitle={isEn ? "Segmenting subject locally..." : "Segmentando sujeto localmente..."}
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-[1.75rem] bg-[#0c0e12] text-white border border-[#242936] darkroom-chassis overflow-hidden">
          {/* Top Hardware Bezel */}
          <div className="px-5 py-3 border-b border-[#242936] bg-[#11141c] flex items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-slate-200">
              <Crosshair className="w-3.5 h-3.5 text-[#ff4d00] animate-spin" aria-hidden="true" />
              <span>ONNX // NEURAL ALPHA SCAN</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>0 B UPLOADED</span>
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Optical Scanner Plate */}
            <div className="relative rounded-2xl overflow-hidden border border-[#242936] bg-[#090b0f] checkerboard-dark min-h-[200px] flex items-center justify-center p-4">
              {/* Viewfinder brackets */}
              <span className="pointer-events-none absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-white/35 z-20" />
              <span className="pointer-events-none absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-white/35 z-20" />
              <span className="pointer-events-none absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-white/35 z-20" />
              <span className="pointer-events-none absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-white/35 z-20" />

              {originalImage && (
                <img
                  src={originalImage}
                  alt={isEn ? "Image being processed" : "Imagen en proceso"}
                  className="max-h-48 w-auto object-contain rounded-lg opacity-85"
                />
              )}

              {/* Live Horizontal Optical Scan Beam tied to progress */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff4d00] to-transparent shadow-[0_0_18px_3px_rgba(255,77,0,0.65)] transition-all duration-300 z-20"
                style={{ top: `${Math.max(8, Math.min(92, clamped))}%` }}
              />

              {/* Floating Progress Percentage Pill */}
              <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-[#0c0e12]/90 border border-white/15 font-mono text-xs font-bold text-white tabular-nums flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#1e40ff] animate-pulse" />
                <span aria-live="polite">{clamped}%</span>
              </div>
            </div>

            {/* Title & Live Status */}
            <div className="text-center space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
                {isEn ? "Isolating subject in local RAM" : "Aislando sujeto en memoria local"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-accent">{statusText}</p>
            </div>

            {/* Continuous Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-[#1a1f2c] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1e40ff] to-[#ff4d00] transition-all duration-200"
                style={{ width: `${Math.max(4, clamped)}%` }}
              />
            </div>

            {/* 4 Pipeline Phase Tiles */}
            <div className="grid grid-cols-4 gap-2">
              {steps.map((step, i) => {
                const stepThreshold = (i + 1) * 25;
                const isActive = clamped >= stepThreshold - 25;
                const isComplete = clamped >= stepThreshold;
                return (
                  <div
                    key={step}
                    className={`py-2 px-2 rounded-xl border text-center transition-colors ${
                      isComplete
                        ? "bg-emerald-500/12 border-emerald-400/35 text-emerald-300"
                        : isActive
                        ? "bg-[#1e40ff]/18 border-[#1e40ff]/60 text-white"
                        : "bg-[#141822] border-[#222838] text-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 font-mono text-[10px] font-bold">
                      {isComplete ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span>0{i + 1}</span>
                      )}
                      <span>{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#141822] hover:bg-[#1c2230] border border-[#242936] text-xs font-mono font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isEn ? "Cancel processing" : "Cancelar procesamiento"}</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
