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
      ? "Initializing ONNX model in browser..."
      : clamped < 65
      ? "Analyzing subject edges and foreground..."
      : clamped < 92
      ? "Generating alpha mask..."
      : "Preparing editor workspace..."
    : clamped < 30
    ? "Inicializando modelo ONNX en el navegador..."
    : clamped < 65
    ? "Analizando bordes del sujeto y primer plano..."
    : clamped < 92
    ? "Generando máscara de transparencia..."
    : "Preparando el espacio de edición...";

  const steps = isEn
    ? ["Model", "Analysis", "Mask", "Ready"]
    : ["Modelo", "Análisis", "Máscara", "Listo"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="background-remover"
        lang={lang}
        onClose={onCancel}
        subtitle={isEn ? "Processing locally..." : "Procesando localmente..."}
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-md p-6 sm:p-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Cpu className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
              <span>{isEn ? "Local WebAssembly Execution" : "Ejecución local WebAssembly"}</span>
            </div>

            {/* Progress Ring */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <svg className="w-28 h-28 transform -rotate-90" aria-hidden="true">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#e2e8f0"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#2563eb"
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
                  className="text-2xl font-bold font-mono text-foreground"
                >
                  {clamped}%
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground font-heading mb-1.5">
              {isEn ? "Removing background" : "Eliminando el fondo"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{statusText}</p>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((step, i) => {
                const stepThreshold = (i + 1) * 25;
                const isActive = clamped >= stepThreshold - 25;
                const isComplete = clamped >= stepThreshold;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        isComplete
                          ? "bg-primary text-white"
                          : isActive
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    {i < 3 && (
                      <div
                        className={`w-6 h-0.5 rounded ${
                          isComplete ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {originalImage && (
            <div className="rounded-xl overflow-hidden border border-border bg-muted/40 mb-5">
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
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              {isEn ? "Cancel processing" : "Cancelar procesamiento"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
