import { Eraser, Zap, ShieldCheck, Cpu, HardDrive, Lock } from "lucide-react";

interface CtaSectionProps {
  onStartApp: () => void;
  onStartOptimizer: () => void;
  dict?: any;
  lang?: string;
}

export function CtaSection({ onStartApp, onStartOptimizer, dict, lang }: CtaSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const t = dict?.cta || {
    title: isEn ? "Ready to work with your images?" : "¿Listo para trabajar con tus imágenes?",
    desc: isEn
      ? "Open any ClearCut Studio utility directly in your browser. Free, without watermarks, and with verifiable local processing."
      : "Abre cualquier herramienta de ClearCut Studio directamente en tu navegador. Sin marcas de agua obligatorias y con procesamiento local verificable.",
    bgRemoverBtn: isEn ? "Open Background Remover" : "Abrir Quitar Fondo IA",
    optimizerBtn: isEn ? "Open Image Optimizer" : "Abrir Optimizador Web",
  };

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
      <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? "Zero-Upload Browser Studio" : "Estudio en navegador sin subida de archivos"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-heading mb-5 tracking-tight text-white">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mb-9 max-w-2xl mx-auto leading-relaxed">
            {t.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              onClick={onStartApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Eraser className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.bgRemoverBtn}</span>
            </button>

            <button
              type="button"
              onClick={onStartOptimizer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Zap className="w-5 h-5 text-blue-400 shrink-0" aria-hidden="true" />
              <span>{t.optimizerBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection({ dict, lang }: { dict?: any; lang?: string }) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const pillars = isEn
    ? [
        {
          icon: Lock,
          title: "Files stay inside your browser tab",
          desc: "Image buffers are decoded and transformed via HTML5 Canvas, WebGL, and WebAssembly in your device's RAM. Your photos are never sent to an external storage server.",
        },
        {
          icon: Cpu,
          title: "Transparent AI & codec loading",
          desc: "When using the AI Background Remover for the first time, the browser downloads the ONNX segmentation model weights (~40 MB) and caches them locally in Cache Storage / IndexedDB for subsequent uses.",
        },
        {
          icon: HardDrive,
          title: "No artificial credit limits",
          desc: "Because your own CPU/GPU executes the work, there are no per-image paywalls, forced watermarks, or daily export quotas.",
        },
      ]
    : [
        {
          icon: Lock,
          title: "Tus archivos permanecen en tu pestaña",
          desc: "Los píxeles se decodifican y transforman mediante HTML5 Canvas, WebGL y WebAssembly en la memoria RAM de tu equipo. Tus fotografías nunca se envían a un servidor de almacenamiento externo.",
        },
        {
          icon: Cpu,
          title: "Transparencia en modelos IA y códecs",
          desc: "Al usar el eliminador de fondos por primera vez, el navegador descarga los pesos del modelo ONNX (~40 MB) y los guarda en la caché local del navegador para que las siguientes ejecuciones sean inmediatas.",
        },
        {
          icon: HardDrive,
          title: "Sin límites artificiales de créditos",
          desc: "Dado que tu propio procesador ejecuta el trabajo, no existen muros de pago por imagen, marcas de agua impuestas ni cuotas diarias de exportación.",
        },
      ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
              {isEn ? "Verifiable Privacy Architecture" : "Arquitectura de privacidad verificable"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-5 font-heading tracking-tight leading-tight">
              {isEn
                ? "Why local browser execution matters for your images"
                : "Por qué el procesamiento local en el navegador marca la diferencia"}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
              {isEn
                ? "Traditional online converters upload your files to remote servers, process them in a queue, and make you download the result. ClearCut Studio ships the processing engine to your browser instead."
                : "Los convertidores tradicionales suben tus archivos a servidores remotos, los procesan en una cola y te obligan a descargar el resultado. ClearCut Studio lleva el motor de procesamiento directamente a tu navegador."}
            </p>

            <div className="space-y-5">
              {pillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-heading text-foreground mb-1">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-border shadow-lg">
              <img
                src="/img/secure-by-default.jpg"
                loading="lazy"
                decoding="async"
                alt={isEn ? "Local browser execution architecture" : "Arquitectura de ejecución local en el navegador"}
                className="w-full h-[380px] sm:h-[440px] object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 p-5 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-md">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
                      <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-foreground text-base">
                        {isEn ? "Verifiable in DevTools → Network" : "Verificable en DevTools → Red"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isEn
                          ? "Inspect network traffic while editing: 0 image bytes leave your device."
                          : "Inspecciona el tráfico de red al editar: 0 bytes de tus imágenes salen de tu equipo."}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                    0 B UPLOADED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
