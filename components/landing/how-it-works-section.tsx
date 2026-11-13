interface HowItWorksSectionProps {
  dict?: any;
  lang?: string;
}

export function HowItWorksSection({ dict, lang }: HowItWorksSectionProps) {
  const isEs = lang === "es" || (!lang && dict?.header?.features !== "Features");
  const t = dict?.howItWorks;

  const steps = t?.steps
    ? t.steps.map((s: any, idx: number) => ({
        number: String(idx + 1).padStart(2, "0"),
        title: String(s.title || "").replace(/^\d+\.\s*/, ""),
        description: s.desc,
        runtime: [
          "CLIENT // INPUT",
          "ONNX // WEBASSEMBLY",
          "CANVAS // 2D RETOUCH",
          "0 B // LOCAL EXPORT",
        ][idx] || "CLIENT // LOCAL",
      }))
    : isEs
      ? [
          {
            number: "01",
            title: "Carga o arrastra tu imagen",
            description:
              "El archivo permanece únicamente en la memoria de tu navegador (PNG, JPG, WebP o AVIF), sin subidas a la nube.",
            runtime: "CLIENT // INPUT",
          },
          {
            number: "02",
            title: "Ejecución WebAssembly local",
            description:
              "La herramienta elegida procesa píxeles o segmentación neuronal directamente en un hilo paralelo Web Worker.",
            runtime: "ONNX // WEBASSEMBLY",
          },
          {
            number: "03",
            title: "Ajuste táctil y retoque fino",
            description:
              "Refina máscaras con pincel manual, ajusta calidades AVIF/WebP o cambia fondos y proporciones en tiempo real.",
            runtime: "CANVAS // 2D RETOUCH",
          },
          {
            number: "04",
            title: "Exportación inmediata limpia",
            description:
              "Descarga el activo listo para producción sin marcas de agua, sin límites artificiales y sin creación de cuenta.",
            runtime: "0 B // LOCAL EXPORT",
          },
        ]
      : [
          {
            number: "01",
            title: "Drop or pick your image",
            description:
              "Your asset stays exclusively in local browser memory (PNG, JPG, WebP, or AVIF) with zero cloud uploads.",
            runtime: "CLIENT // INPUT",
          },
          {
            number: "02",
            title: "Local WebAssembly execution",
            description:
              "The active utility runs pixel math or neural segmentation inside a non-blocking Web Worker thread.",
            runtime: "ONNX // WEBASSEMBLY",
          },
          {
            number: "03",
            title: "Tactile refine & calibration",
            description:
              "Fine-tune edges with the manual brush, dial in AVIF/WebP compression targets, or swap backdrops live.",
            runtime: "CANVAS // 2D RETOUCH",
          },
          {
            number: "04",
            title: "Clean production export",
            description:
              "Download crisp files ready for production with zero watermarks, zero artificial gates, and no signup required.",
            runtime: "0 B // LOCAL EXPORT",
          },
        ];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background border-b border-border studio-grid"
    >
      <div className="max-w-7xl mx-auto">
        {/* Swiss Editorial Header */}
        <div className="grid lg:grid-cols-12 gap-6 items-end mb-12 sm:mb-16">
          <div className="lg:col-span-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">
              {isEs ? "03 // ARQUITECTURA DE FLUJO" : "03 // PIPELINE ARCHITECTURE"}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground font-heading tracking-tight leading-[1.05]">
              {t?.title || (isEs ? "Cómo opera el motor local" : "How the local engine operates")}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {t?.subtitle ||
                (isEs
                  ? "Un flujo continuo de cuatro fases ejecutado íntegramente en la memoria RAM de tu equipo."
                  : "A continuous four-stage pipeline executed end-to-end inside your device memory.")}
            </p>
          </div>
        </div>

        {/* Continuous Swiss Hairline Pipeline Grid */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-[0_24px_60px_-36px_rgba(12,14,18,0.2)]">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {steps.map((step: any, idx: number) => (
              <div
                key={idx}
                className="group p-7 sm:p-8 flex flex-col justify-between gap-8 hover:bg-muted/35 transition-colors relative"
              >
                {/* Top indicator row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground px-2.5 py-1 rounded-md bg-muted border border-border">
                    {step.runtime}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      idx === 3 ? "bg-emerald-600" : "bg-primary/60 group-hover:bg-accent"
                    } transition-colors`}
                    aria-hidden="true"
                  />
                </div>

                {/* Big architectural numeral & copy */}
                <div>
                  <div className="font-heading text-5xl sm:text-6xl font-extrabold tracking-tighter text-border group-hover:text-primary transition-colors tabular-nums mb-5 select-none">
                    {step.number}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2.5 font-heading leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-accent">
                    {step.description}
                  </p>
                </div>

                {/* Step connector line */}
                <div className="pt-4 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{isEs ? `FASE ${step.number}` : `STAGE ${step.number}`}</span>
                  <span className="group-hover:translate-x-1 transition-transform text-foreground font-semibold">
                    {idx < 3 ? "→" : "✓"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
