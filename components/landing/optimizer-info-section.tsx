"use client";

import { useState } from "react";
import { Cpu, Zap, ShieldCheck, Check } from "lucide-react";

interface OptimizerInfoSectionProps {
  dict?: any;
  lang?: string;
}

type CodecKey = "avif" | "webp" | "jpeg";

const CODEC_BENCHMARKS: Record<
  CodecKey,
  {
    label: string;
    encoder: string;
    outputSize: string;
    savings: string;
    barPct: number;
    qualityNoteEs: string;
    qualityNoteEn: string;
  }
> = {
  avif: {
    label: "AVIF",
    encoder: "libavif · WASM 10-bit",
    outputSize: "245 KB",
    savings: "-90%",
    barPct: 10,
    qualityNoteEs: "Máxima compresión moderna para héroes web y Core Web Vitals.",
    qualityNoteEn: "Maximum modern compression for web hero assets & Core Web Vitals.",
  },
  webp: {
    label: "WebP",
    encoder: "libwebp · WASM Lossy/Lossless",
    outputSize: "318 KB",
    savings: "-87%",
    barPct: 14,
    qualityNoteEs: "Compatibilidad universal con transparencia alfa y menor tamaño.",
    qualityNoteEn: "Universal browser support with alpha channel and lightweight output.",
  },
  jpeg: {
    label: "MozJPEG",
    encoder: "mozjpeg · Progressive 4:2:0",
    outputSize: "490 KB",
    savings: "-80%",
    barPct: 21,
    qualityNoteEs: "Fotografía clásica con tablas de cuantización perceptuales optimizadas.",
    qualityNoteEn: "Classic photography with perceptually tuned quantization tables.",
  },
};

export function OptimizerInfoSection({ dict, lang }: OptimizerInfoSectionProps) {
  const isEs = lang === "es" || (!lang && dict?.header?.features !== "Features");
  const t = dict?.optimizerInfo;
  const [selectedCodec, setSelectedCodec] = useState<CodecKey>("avif");
  const activeBenchmark = CODEC_BENCHMARKS[selectedCodec];

  const features = t?.features
    ? [
        {
          icon: Cpu,
          code: "WASM-01",
          title: t.features[0]?.title,
          desc: t.features[0]?.desc,
        },
        {
          icon: Zap,
          code: "WASM-02",
          title: t.features[1]?.title,
          desc: t.features[1]?.desc,
        },
        {
          icon: ShieldCheck,
          code: "WASM-03",
          title: t.features[2]?.title,
          desc: t.features[2]?.desc,
        },
      ]
    : [
        {
          icon: Cpu,
          code: "WASM-01",
          title: isEs ? "Códecs nativos en Web Workers" : "Native codecs in Web Workers",
          desc: isEs
            ? "Compilaciones WebAssembly de libavif, libwebp y MozJPEG ejecutadas fuera del hilo principal."
            : "WebAssembly builds of libavif, libwebp, and MozJPEG running off the main UI thread.",
        },
        {
          icon: Zap,
          code: "WASM-02",
          title: isEs ? "Comparativa de bytes en vivo" : "Live byte-delta inspection",
          desc: isEs
            ? "Calibra calidad vs. peso visualmente antes de exportar cada variante a producción."
            : "Dial in visual quality versus byte weight live before exporting production files.",
        },
        {
          icon: ShieldCheck,
          code: "WASM-03",
          title: isEs ? "Cero transferencia de originales" : "Zero original file uploads",
          desc: isEs
            ? "Tus fotografías de alta resolución se recomprimen en RAM y nunca abandonan el equipo."
            : "High-resolution masters are re-encoded strictly in RAM and never leave your machine.",
        },
      ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Swiss Spec Sheet */}
          <div className="lg:col-span-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">
              {isEs ? "04 // MOTOR DE COMPRESIÓN WASM" : "04 // WASM COMPRESSION ENGINE"}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground font-heading tracking-tight leading-[1.08] mb-5">
              {t?.title || (isEs ? "Códecs reales en el" : "Real codecs inside your")}{" "}
              <span className="text-primary">
                {t?.titleGradient || (isEs ? "navegador" : "browser")}
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
              {t?.desc ||
                (isEs
                  ? "A diferencia de las APIs de compresión en la nube que limitan el número de archivos o añaden esperas de red, ClearCut ejecuta libavif, libwebp y MozJPEG compilados a WebAssembly directamente en tu dispositivo."
                  : "Unlike cloud compression APIs that throttle queues or add upload roundtrips, ClearCut runs WebAssembly builds of libavif, libwebp, and MozJPEG directly on your device.")}
            </p>

            {/* Architectural Divider List instead of generic cards */}
            <div className="border-t border-border divide-y divide-border">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="py-5 flex items-start gap-4">
                    <span className="font-mono text-[11px] text-muted-foreground pt-1 shrink-0 w-16">
                      {f.code}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-foreground mb-1">
                        {f.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-accent">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Obsidian Darkroom Benchmark Console */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-darkroom text-darkroom-foreground border border-white/10 p-5 sm:p-7 shadow-[0_32px_90px_-32px_rgba(12,14,18,0.85)] relative overflow-hidden">
              {/* Top console bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="font-mono text-xs text-slate-300 tracking-wide">
                    optimizer-demo.wasm
                  </span>
                </div>
                <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10" role="tablist" aria-label={isEs ? "Selector de códec" : "Codec selector"}>
                  {(["avif", "webp", "jpeg"] as CodecKey[]).map((key) => {
                    const active = selectedCodec === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedCodec(key)}
                        className={`px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                          active
                            ? "bg-white text-darkroom shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {t?.badges?.[key]?.split(" ")[0] || CODEC_BENCHMARKS[key].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual Plate: Sample Preview + Delta Metrics */}
              <div className="grid sm:grid-cols-12 gap-5 items-stretch mb-6">
                <div className="sm:col-span-5 relative aspect-[4/3] sm:aspect-auto rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <img
                    src="/demos/cat.jpg"
                    alt={isEs ? "Vista de muestra de compresión" : "Compression sample plate"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 font-mono text-[10px] text-white">
                    1920 × 1280 px
                  </div>
                </div>

                <div className="sm:col-span-7 flex flex-col justify-between gap-4 bg-[#141821] border border-white/10 rounded-2xl p-4 sm:p-5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-1">
                      {activeBenchmark.encoder}
                    </div>
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="font-heading text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                        {activeBenchmark.outputSize}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-xs font-bold">
                        <Check className="w-3 h-3" aria-hidden="true" />
                        {activeBenchmark.savings}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {isEs ? activeBenchmark.qualityNoteEs : activeBenchmark.qualityNoteEn}
                    </p>
                  </div>

                  {/* Proportional byte-weight bars */}
                  <div className="space-y-2.5 pt-3 border-t border-white/10">
                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                        <span>{isEs ? "ORIGINAL SIN COMPRIMIR" : "ORIGINAL UNCOMPRESSED"}</span>
                        <span>2,410 KB</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-full bg-slate-500/70 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-emerald-300 mb-1">
                        <span>{activeBenchmark.label} // Q80</span>
                        <span>{activeBenchmark.outputSize}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300"
                          style={{ width: `${activeBenchmark.barPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom badge spec row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/10 font-mono text-[11px] text-slate-400">
                <span>
                  {t?.badges?.[selectedCodec] || `${activeBenchmark.label} WebAssembly`}
                </span>
                <span className="text-emerald-400">
                  {isEs ? "0 KB SUBIDOS A LA RED" : "0 KB NETWORK UPLOAD"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
