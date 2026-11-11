"use client";

import React, { useRef, useCallback } from "react";
import { SAMPLE_IMAGES } from "@/lib/constants";
import { ToolSlug } from "@/lib/tools-catalog";
import {
  Scissors,
  Zap,
  ShieldCheck,
  Cpu,
  SlidersHorizontal,
  ArrowRight,
  MoveHorizontal,
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

  const pillars = isEs
    ? [
        { label: "Procesamiento en navegador", icon: ShieldCheck },
        { label: "Codificadores WASM nativos", icon: Cpu },
        { label: "PNG · WebP · AVIF · JPG", icon: SlidersHorizontal },
      ]
    : [
        { label: "In-browser processing", icon: ShieldCheck },
        { label: "Native WASM encoders", icon: Cpu },
        { label: "PNG · WebP · AVIF · JPG", icon: SlidersHorizontal },
      ];

  return (
    <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-border bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Value Proposition & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-soft text-xs font-semibold text-foreground font-accent">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>
                {isEs
                  ? "Estudio de edición local · WebAssembly y Canvas API"
                  : "Local editing studio · WebAssembly & Canvas API"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] tracking-tight font-heading font-bold text-foreground">
              {isEs ? (
                <>
                  Herramientas de imagen precisas,{" "}
                  <span className="text-primary">ejecutadas en tu navegador.</span>
                </>
              ) : (
                <>
                  Precision image tools,{" "}
                  <span className="text-primary">running in your browser.</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed font-accent">
              {isEs
                ? "Elimina fondos con inteligencia artificial, comprime archivos en formatos WebP y AVIF, limpia metadatos EXIF y prepara recursos gráficos sin subir tus imágenes a servidores externos."
                : "Remove backgrounds with AI, compress files into WebP and AVIF, strip EXIF metadata, and prepare graphic assets without uploading your images to external servers."}
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onStartApp}
                className="group inline-flex items-center justify-between sm:justify-start gap-3.5 px-5 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-soft font-accent text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div className="pr-1">
                  <div className="text-sm font-bold leading-tight">
                    {isEs ? "Eliminar fondo con IA" : "AI Background Remover"}
                  </div>
                  <div className="text-[11px] text-white/80 font-mono mt-0.5">
                    PNG · WebP · AVIF · Editor
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto sm:ml-1 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onStartOptimizer}
                className="group inline-flex items-center justify-between sm:justify-start gap-3.5 px-5 py-3.5 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-xl transition-all shadow-soft font-accent text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="pr-1">
                  <div className="text-sm font-bold leading-tight">
                    {isEs ? "Optimizar y convertir" : "Optimize & Convert"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    libavif · libwebp · MozJPEG
                  </div>
                </div>
              </button>
            </div>

            {/* Technical Specs / Format Requirements Notice */}
            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground font-accent">
              {pillars.map(({ label, icon: Icon }) => (
                <div key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Quick Sample Try Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-xs text-muted-foreground font-accent">
                <span className="font-semibold text-foreground block sm:inline">
                  {isEs ? "Prueba inmediata:" : "Instant test:"}
                </span>{" "}
                {isEs
                  ? "Abre el motor de IA con una foto de ejemplo"
                  : "Launch the AI engine with a sample photo"}
              </div>
              <div className="flex items-center gap-2">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => onSelectDemo(img.src)}
                    className="group relative w-11 h-11 rounded-lg overflow-hidden border border-border hover:border-primary transition-all shadow-soft bg-card shrink-0"
                    title={
                      isEs
                        ? `Probar eliminación de fondo con: ${img.name}`
                        : `Test background removal with: ${img.name}`
                    }
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Accessible Before/After Workspace Demo */}
          <div className="lg:col-span-6">
            <div className="bg-card rounded-2xl border border-border shadow-medium overflow-hidden">
              {/* Studio Window Header */}
              <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="ml-1 text-xs font-mono font-medium text-muted-foreground">
                    {isEs
                      ? "Demostración interactiva (imagen de ejemplo)"
                      : "Interactive comparison (sample image)"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">
                  {comparisonPos}%
                </span>
              </div>

              {/* Interactive Before/After Viewport */}
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
                className="relative aspect-[4/3] cursor-ew-resize select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                {/* Original Layer (Right side) */}
                <div className="absolute inset-0">
                  <img
                    src="/demos/demo-original.png"
                    alt={isEs ? "Imagen de ejemplo con fondo original" : "Sample image with original background"}
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
                  <div className="w-full h-full checkerboard">
                    <img
                      src="/demos/demo-processed.avif"
                      alt={isEs ? "Imagen de ejemplo con fondo eliminado" : "Sample image with background removed"}
                      className="w-full h-full object-cover"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Top Labels */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 bg-card/95 backdrop-blur-sm border border-border text-foreground text-xs font-semibold rounded-md shadow-soft font-accent">
                    {isEs ? "Sin fondo (PNG/AVIF)" : "Removed background (PNG/AVIF)"}
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-sm text-white text-xs font-semibold rounded-md shadow-soft font-accent">
                    {isEs ? "Original" : "Original"}
                  </span>
                </div>

                {/* Divider Line & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(15,23,42,0.4)] pointer-events-none"
                  style={{ left: `${comparisonPos}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-card rounded-full shadow-medium flex items-center justify-center border border-border text-foreground">
                    <MoveHorizontal className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>

              {/* Studio Window Footer Bar */}
              <div className="px-4 py-3 border-t border-border bg-card flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground font-accent">
                <span>
                  {isEs
                    ? "Arrastra el control o usa las teclas ← → para comparar el recorte."
                    : "Drag the handle or use ← → arrow keys to inspect the cutout."}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectDemo("/demos/demo-original.png")}
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>
                    {isEs ? "Abrir esta imagen en el editor" : "Open this sample in editor"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
