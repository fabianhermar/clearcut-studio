"use client";

import { CheckIcon, LayersIcon } from "@/components/icons";

interface ProcessingScreenProps {
  progress: number;
  originalImage: string | null;
}

export function ProcessingScreen({ progress, originalImage }: ProcessingScreenProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logos/ClearCut-logo.avif" alt="ClearCut" className="h-24 w-auto" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-10">
            <div className="text-center">
              {/* Animated progress ring */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                {/* Background ring */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress ring with gradient */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (351.86 * progress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent font-accent">
                    {progress}%
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2 font-heading">
                Procesando imagen
              </h3>
              <p className="text-slate-500 mb-2 font-accent">
                {progress < 30
                  ? "Cargando modelos de IA..."
                  : progress < 60
                  ? "Analizando imagen..."
                  : progress < 90
                  ? "Eliminando fondo..."
                  : "Finalizando..."}
              </p>

              {/* Progress steps */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {["IA", "Analisis", "Fondo", "Listo"].map((step, i) => {
                  const stepProgress = (i + 1) * 25;
                  const isActive = progress >= stepProgress - 25;
                  const isComplete = progress >= stepProgress;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                        isComplete
                          ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white"
                          : isActive
                          ? "bg-blue-100 text-blue-600 animate-pulse"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {isComplete ? <CheckIcon size={14} /> : i + 1}
                      </div>
                      {i < 3 && (
                        <div className={`w-8 h-0.5 rounded transition-colors ${
                          isComplete ? "bg-linear-to-r from-blue-500 to-cyan-500" : "bg-slate-200"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {originalImage && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-48 object-contain bg-slate-50"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
