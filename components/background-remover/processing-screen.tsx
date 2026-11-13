"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { Check, Cpu, X } from "lucide-react";

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
      : "Preparing studio editor workspace..."
    : clamped < 30
    ? "Inicializando motor neuronal ONNX en tu navegador..."
    : clamped < 65
    ? "Aislando contornos del sujeto y primer plano..."
    : clamped < 92
    ? "Generando máscara de transparencia alpha..."
    : "Preparando el espacio de edición...";

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
        <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-[0_24px_70px_-30px_rgba(12,14,18,0.18)]">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-6">
              <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" aria-hidden="true" />
              <span>{isEn ? "ONNX // WASM LOCAL RUNTIME" : "ONNX // EJECUCIÓN WASM LOCAL"}</span>
            </div>

            {/* Progress Ring */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <svg className="w-28 h-28 transform -rotate-90" aria-hidden="true">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#e6e3da"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#1e40ff"
                  strokeWidth="7"
                  fill="none"
                  strokeDasharray={301.59}
                  strokeDashoffset={301.59 - (301.59 * clamped) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  aria-live="polite"
                  className="text-2xl font-bold font-mono text-foreground tabular-nums"
                >
                  {clamped}%
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading mb-1.5">
              {isEn ? "Isolating subject" : "Eliminando fondo"}
            </h2>
            <p className="text-sm text-muted-foreground font-accent mb-6">{statusText}</p>

            {/* Step indicators */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {steps.map((step, i) => {
                const stepThreshold = (i + 1) * 25;
                const isActive = clamped >= stepThreshold - 25;
                const isComplete = clamped >= stepThreshold;
                return (
                  <div
                    key={step}
                    className={`py-2 px-2 rounded-xl border text-center transition-colors ${
                      isComplete
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : isActive
                        ? "bg-background border-border text-foreground"
                        : "bg-muted/40 border-border/60 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 font-mono text-[11px] font-semibold">
                      {isComplete ? <Check className="w-3 h-3 text-emerald-700" /> : <span>0{i + 1}</span>}
                      <span>{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {originalImage && (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-background mb-5 p-2">
              <img
                src={originalImage}
                alt={isEn ? "Image being processed" : "Imagen en proceso"}
                className="w-full h-40 object-contain"
              />
            </div>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-background hover:bg-muted border border-border text-xs font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>{isEn ? "Cancel processing" : "Cancelar procesamiento"}</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
