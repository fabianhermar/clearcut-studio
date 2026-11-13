"use client";

import React, { useRef, useCallback } from "react";
import { SAMPLE_IMAGES } from "@/lib/constants";
import { ToolSlug } from "@/lib/tools-catalog";
import {
  Scissors,
  Zap,
  ArrowUpRight,
  MoveHorizontal,
  Crosshair,
} from "lucide-react";

interface HeroSectionProps {
  onStartApp: () => void;
  onStartOptimizer: () => void;
  onStartMockupGenerator?: () => void;
  onSelectTool?: (slug: ToolSlug) => void;
  onSelectDemo: (src: string) => void;
  comparisonPos: number;
  setComparisonPos: (pos: number) => void;
  dict?: any;
  lang?: string;
}

export function HeroSection({
  onStartApp,
  onStartOptimizer,
  onSelectDemo,
  comparisonPos,
  setComparisonPos,
  lang = "es",
}: HeroSectionProps) {
  const isEs = lang === "es";
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const updateSliderFromClientX = useCallback(
    (clientX: number) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      setComparisonPos(Math.max(5, Math.min(95, Math.round(x))));
    },
    [setComparisonPos]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setComparisonPos(Math.max(5, comparisonPos - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setComparisonPos(Math.min(95, comparisonPos + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setComparisonPos(5);
    } else if (e.key === "End") {
      e.preventDefault();
      setComparisonPos(95);
    }
  };

  return (
    <section className="studio-grid relative border-b border-border bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Monumental Editorial Copy + Tactile Controls */}
          <div className="lg:col-span-6 space-y-7 text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-[4.15rem] leading-[0.98] tracking-[-0.04em] font-heading font-bold text-foreground">
              {isEs ? (
                <>
                  Precisión óptica para tus imágenes,{" "}
                  <span className="text-primary">directo en tu pestaña.</span>
                </>
              ) : (
                <>
                  Optical precision for your images,{" "}
                  <span className="text-primary">right in your tab.</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed font-accent">
              {isEs
                ? "Recorta fondos con redes neuronales en WebAssembly, comprime en AVIF y WebP, elimina metadatos EXIF ocultos y prepara activos gráficos sin enviar archivos a servidores externos."
                : "Cut out backgrounds with WebAssembly neural models, compress to AVIF and WebP, strip hidden EXIF metadata, and prepare graphic assets without uploading files to external servers."}
            </p>

            {/* Primary & Secondary Tactile Studio Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={onStartApp}
                className="group inline-flex items-center justify-between sm:justify-start gap-3.5 px-6 py-4 bg-[#0c0e12] hover:bg-primary text-white font-semibold rounded-full transition-all tactile-button font-accent cursor-pointer"
              >
                <Scissors className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold">
                  {isEs ? "Eliminar fondo con IA" : "AI Background Remover"}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onStartOptimizer}
                className="group inline-flex items-center justify-between sm:justify-start gap-3 px-6 py-4 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-full transition-all tactile-surface font-accent cursor-pointer"
              >
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-bold">
                  {isEs ? "Optimizador AVIF / WebP" : "AVIF / WebP Optimizer"}
                </span>
              </button>
            </div>

            {/* Filmstrip / Slide Tray Quick Demos */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  {isEs
                    ? "PROBAR EN VIVO CON DIAPOSITIVAS DE MUESTRA"
                    : "TEST LIVE WITH SAMPLE SLIDES"}
                </span>
                <span className="text-[11px] font-mono text-primary">
                  {isEs ? "1 clic → Editor" : "1-click → Editor"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2.5 max-w-md">
                {SAMPLE_IMAGES.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => onSelectDemo(img.src)}
                    className="group relative bg-card border border-border hover:border-primary rounded-xl p-1.5 transition-all tactile-surface text-left cursor-pointer"
                    title={
                      isEs
                        ? `Abrir en el editor: ${img.name}`
                        : `Open in editor: ${img.name}`
                    }
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-1.5">
                      <img
                        src={img.src}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="flex items-center justify-between px-0.5 text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                      <span>0{i + 1}</span>
                      <span className="truncate font-sans font-semibold">{img.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Darkroom Optical Instrument Viewport */}
          <div className="lg:col-span-6">
            <div className="bg-[#0c0e12] text-white rounded-[1.5rem] border border-[#242936] shadow-medium overflow-hidden">
              {/* Instrument Top Bezel */}
              <div className="px-4 py-3 border-b border-[#242936] bg-[#11141c] flex items-center justify-between gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Crosshair className="w-3.5 h-3.5 text-[#ff4d00]" aria-hidden="true" />
                  <span>VIEWPORT // ALPHA SEGMENTATION</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#1c212e] text-slate-300 border border-[#2c3347]">
                    SPLIT {comparisonPos}%
                  </span>
                </div>
              </div>

              {/* Interactive Optical Canvas */}
              <div className="p-3 sm:p-4 bg-[#0c0e12]">
                <div
                  ref={sliderContainerRef}
                  role="slider"
                  tabIndex={0}
                  aria-label={
                    isEs
                      ? "Comparador interactivo antes y después de eliminación de fondo. Usa las flechas izquierda y derecha para comparar."
                      : "Interactive before and after background removal comparison slider. Use left and right arrow keys to compare."
                  }
                  aria-valuemin={5}
                  aria-valuemax={95}
                  aria-valuenow={comparisonPos}
                  onKeyDown={handleKeyDown}
                  onMouseMove={(e) => {
                    if (e.buttons !== 1) return;
                    updateSliderFromClientX(e.clientX);
                  }}
                  onMouseDown={(e) => updateSliderFromClientX(e.clientX)}
                  onTouchMove={(e) => {
                    if (e.touches[0]) updateSliderFromClientX(e.touches[0].clientX);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches[0]) updateSliderFromClientX(e.touches[0].clientX);
                  }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#242936] cursor-ew-resize select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {/* Viewfinder Corner Marks */}
                  <span className="pointer-events-none absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-white/40 z-20" />
                  <span className="pointer-events-none absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-white/40 z-20" />
                  <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-white/40 z-20" />
                  <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-white/40 z-20" />

                  {/* Original Layer (Right side) */}
                  <div className="absolute inset-0">
                    <img
                      src="/demos/demo-original.png"
                      alt={
                        isEs
                          ? "Imagen de ejemplo con fondo original"
                          : "Sample image with original background"
                      }
                      className="w-full h-full object-cover"
                      fetchPriority="high"
                      decoding="async"
                      draggable={false}
                    />
                  </div>

                  {/* Processed Transparent Layer (Left side clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - comparisonPos}% 0 0)` }}
                  >
                    <div className="w-full h-full checkerboard-dark">
                      <img
                        src="/demos/demo-processed.avif"
                        alt={
                          isEs
                            ? "Imagen de ejemplo con fondo eliminado"
                            : "Sample image with background removed"
                        }
                        className="w-full h-full object-cover"
                        decoding="async"
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* Minimal Optical Tags */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 bg-[#0c0e12]/80 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono uppercase tracking-wider rounded-md">
                      {isEs ? "ALPHA // SIN FONDO" : "ALPHA // CUTOUT"}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 bg-[#0c0e12]/80 backdrop-blur-md border border-white/15 text-slate-300 text-[11px] font-mono uppercase tracking-wider rounded-md">
                      RAW // ORIGINAL
                    </span>
                  </div>

                  {/* Precision Metallic Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.6)] pointer-events-none z-20"
                    style={{ left: `${comparisonPos}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white text-[#0c0e12] rounded-full shadow-lg flex items-center justify-center border-2 border-[#0c0e12]">
                      <MoveHorizontal className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Instrument Bottom Bar */}
              <div className="px-4 py-3 border-t border-[#242936] bg-[#11141c] flex flex-wrap items-center justify-between gap-2 text-xs font-accent">
                <span className="text-slate-400">
                  {isEs
                    ? "Arrastra o usa las teclas ← → para inspeccionar el canal alpha."
                    : "Drag or use ← → keys to inspect the alpha channel."}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectDemo("/demos/demo-original.png")}
                  className="text-white hover:text-[#60a5fa] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>
                    {isEs ? "Probar esta imagen" : "Open sample in editor"}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
