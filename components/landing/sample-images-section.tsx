import { SAMPLE_IMAGES } from "@/lib/constants";
import { Eraser, ArrowUpRight } from "lucide-react";

interface SampleImagesSectionProps {
  onSelectDemo: (src: string) => void;
  dict?: any;
  lang?: string;
}

export function SampleImagesSection({ onSelectDemo, dict, lang }: SampleImagesSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              {isEn ? "Interactive Test Gallery" : "Galería de prueba inmediata"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 font-heading tracking-tight">
              {isEn ? "No image on hand? Test with a sample" : "¿Sin imagen a mano? Prueba con un ejemplo real"}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base leading-relaxed">
            {isEn
              ? "Click any photograph below to load it directly into the AI Background Remover workspace."
              : "Selecciona cualquiera de estas fotografías de muestra para cargarla directamente en el editor de recorte con IA."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {SAMPLE_IMAGES.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelectDemo(img.src)}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card shadow-2xs hover:shadow-md hover:border-primary/40 transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img
                loading="lazy"
                decoding="async"
                src={img.src}
                alt={`${img.name} - ${img.category}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-900/75 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white/75 text-[11px] font-mono uppercase tracking-wider mb-0.5">
                  {img.category}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-bold font-heading text-base">{img.name}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-primary/90 px-2.5 py-1 rounded-md">
                    <Eraser className="w-3 h-3" aria-hidden="true" />
                    {isEn ? "Test" : "Probar"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
