import { Upload, Cpu, SlidersHorizontal, Download } from "lucide-react";

interface HowItWorksSectionProps {
  dict?: any;
  lang?: string;
}

export function HowItWorksSection({ dict, lang }: HowItWorksSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const steps = isEn
    ? [
        {
          number: "01",
          icon: Upload,
          title: "Select or drop your file",
          description:
            "Open any tool and load your JPG, PNG, WebP, or AVIF image directly from your device.",
        },
        {
          number: "02",
          icon: Cpu,
          title: "In-browser WASM & Canvas engine",
          description:
            "WebAssembly and HTML5 Canvas process pixels locally inside your browser tab without uploading files to external servers.",
        },
        {
          number: "03",
          icon: SlidersHorizontal,
          title: "Fine-tune with studio controls",
          description:
            "Inspect before/after sliders, refine edges with the recovery brush, adjust compression quality, or customize frames.",
        },
        {
          number: "04",
          icon: Download,
          title: "Export ready-to-use assets",
          description:
            "Download individual images in PNG, WebP, AVIF, or JPG, or export complete multi-asset ZIP packages.",
        },
      ]
    : [
        {
          number: "01",
          icon: Upload,
          title: "Selecciona o arrastra tu archivo",
          description:
            "Abre cualquier herramienta y carga tu imagen JPG, PNG, WebP o AVIF directamente desde tu dispositivo.",
        },
        {
          number: "02",
          icon: Cpu,
          title: "Motor local WASM y Canvas",
          description:
            "WebAssembly y HTML5 Canvas procesan cada píxel localmente dentro de tu pestaña sin subir tus archivos a servidores externos.",
        },
        {
          number: "03",
          icon: SlidersHorizontal,
          title: "Ajusta con controles de estudio",
          description:
            "Compara el antes y después en tiempo real, retoca bordes con el pincel, calibra la compresión o personaliza el encuadre.",
        },
        {
          number: "04",
          icon: Download,
          title: "Exporta activos listos para producción",
          description:
            "Descarga imágenes individuales en PNG, WebP, AVIF o JPG, o paquetes ZIP listos para publicar.",
        },
      ];

  return (
    <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            {isEn ? "Local Architecture" : "Arquitectura de ejecución"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-3 font-heading tracking-tight">
            {isEn ? "How ClearCut Studio processes your images" : "Cómo procesa tus imágenes ClearCut Studio"}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {isEn
              ? "A transparent four-step workflow designed for speed, precision, and verifiable local privacy."
              : "Un flujo transparente de cuatro pasos diseñado para ofrecer velocidad, precisión técnica y privacidad verificable."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-background border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-sm font-bold text-muted-foreground px-2.5 py-1 rounded-md bg-muted border border-border">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2.5 font-heading">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
