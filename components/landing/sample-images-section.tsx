"use client";

import { SAMPLE_IMAGES } from "@/lib/constants";
import { ArrowUpRight, Aperture } from "lucide-react";

interface SampleImagesSectionProps {
  onSelectDemo: (src: string) => void;
  dict?: any;
  lang?: string;
}

export function SampleImagesSection({ onSelectDemo, dict, lang }: SampleImagesSectionProps) {
  const isEs = lang === "es" || (!lang && dict?.header?.features !== "Features");

  return (
    <section
      id="samples"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-darkroom text-darkroom-foreground border-y border-white/10 darkroom-grid relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Contact-sheet film strip header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-3">
              <Aperture className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {isEs ? "02 // HOJA DE CONTACTO 35MM" : "02 // 35MM CONTACT SHEET"}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading tracking-tight">
              {dict?.samples?.title || (isEs ? "Prueba con muestras de estudio" : "Test with studio plates")}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-400 max-w-md font-accent leading-relaxed">
            {dict?.samples?.subtitle ||
              (isEs
                ? "Haz clic en cualquier fotograma de prueba para cargarlo directamente en el visor de recorte local sin subir archivos."
                : "Click any test exposure frame to load it directly into the local cutout viewport without uploading files.")}
          </p>
        </div>

        {/* Contact sheet plate grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SAMPLE_IMAGES.map((img, idx) => {
            const frameNo = `EXP ${String(idx + 1).padStart(2, "0")}`;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelectDemo(img.src)}
                aria-label={`${isEs ? "Probar muestra" : "Test sample"} ${img.name}`}
                className="group relative flex flex-col text-left rounded-2xl bg-[#13161d] border border-white/10 hover:border-accent/60 transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]"
              >
                {/* Film perforation top strip */}
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-[#0e1116]">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-slate-400 group-hover:text-accent transition-colors font-semibold">
                    {frameNo}
                  </span>
                  <div className="flex items-center gap-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 rounded-xs bg-white/15 group-hover:bg-accent/70 transition-colors" />
                    <span className="w-1.5 h-1.5 rounded-xs bg-white/15 group-hover:bg-accent/70 transition-colors" />
                    <span className="w-1.5 h-1.5 rounded-xs bg-white/15 group-hover:bg-accent/70 transition-colors" />
                  </div>
                </div>

                {/* Framed image viewport */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={img.src}
                    alt={img.name}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-300"
                    loading="lazy"
                  />

                  {/* Subtle viewfinder reticle on hover */}
                  <div
                    className="pointer-events-none absolute inset-3 border border-white/0 group-hover:border-white/25 transition-colors rounded-lg"
                    aria-hidden="true"
                  >
                    <span className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute -top-px -right-px w-2.5 h-2.5 border-t border-r border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute -bottom-px -left-px w-2.5 h-2.5 border-b border-l border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b border-r border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Action pill */}
                  <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-darkroom/85 backdrop-blur-md border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white opacity-90 group-hover:bg-accent group-hover:border-accent transition-all">
                    <span>{isEs ? "Cargar" : "Load"}</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </div>
                </div>

                {/* Negative metadata footer */}
                <div className="px-4 py-3 flex items-center justify-between gap-2 bg-[#13161d]">
                  <span className="font-heading font-semibold text-sm text-white truncate">
                    {img.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 shrink-0">
                    {img.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer telemetry bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-white/10 text-xs font-mono text-slate-400">
          <span>
            {dict?.samples?.clickHint ||
              (isEs
                ? "PROCESAMIENTO LOCAL: LAS MUESTRAS SE CARGAN EN MEMORIA RAM SIN LATENCIA DE SUBIDA"
                : "LOCAL PIPELINE: PLATES LOAD DIRECTLY INTO RAM WITH ZERO UPLOAD LATENCY")}
          </span>
          <span className="text-slate-500">ONNX // U2NETP</span>
        </div>
      </div>
    </section>
  );
}
