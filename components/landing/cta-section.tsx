"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Terminal } from "lucide-react";

interface CtaSectionProps {
  onStartApp: () => void;
  onStartOptimizer?: () => void;
  dict?: any;
  lang?: string;
}

export function CtaSection({ onStartApp, onStartOptimizer, dict, lang }: CtaSectionProps) {
  const isEs = lang === "es" || (!lang && dict?.header?.features !== "Features");
  const t = dict?.cta;

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-darkroom text-darkroom-foreground darkroom-grid border-t border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/15 bg-[#12151c] p-8 sm:p-14 lg:p-16 relative overflow-hidden">
          {/* Optical viewfinder corner markers */}
          <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/25" aria-hidden="true" />
          <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/25" aria-hidden="true" />
          <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/25" aria-hidden="true" />
          <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/25" aria-hidden="true" />

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
                <span>{isEs ? "ESTUDIO LISTO // SESIÓN LOCAL" : "STUDIO READY // LOCAL SESSION"}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 font-heading tracking-tight leading-[1.06]">
                {t?.title ||
                  (isEs
                    ? "Empieza a procesar imágenes en segundos, directo en tu navegador"
                    : "Start processing images in seconds, right in your browser")}
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                {t?.subtitle ||
                  (isEs
                    ? "Abre cualquiera de nuestras utilidades especializadas y comprueba el procesamiento local sin marcas de agua ni límites artificiales."
                    : "Open any of our specialized utilities and experience local processing without watermarks or artificial limits.")}
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3.5 lg:items-end">
              <button
                type="button"
                onClick={onStartApp}
                className="w-full sm:w-auto lg:w-full max-w-xs inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-full transition-all shadow-[0_14px_30px_-10px_rgba(30,64,255,0.85)] cursor-pointer text-sm sm:text-base"
              >
                <span>{t?.button || (isEs ? "Abrir Eliminador de Fondos" : "Open Background Remover")}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              {onStartOptimizer && (
                <button
                  type="button"
                  onClick={onStartOptimizer}
                  className="w-full sm:w-auto lg:w-full max-w-xs inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold rounded-full transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <span>{isEs ? "Abrir Optimizador AVIF/WebP" : "Open AVIF/WebP Optimizer"}</span>
                </button>
              )}
              <div className="w-full max-w-xs pt-2 flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span>{t?.freeNote || (isEs ? "Sin registro · Sin marcas de agua" : "No signup · No watermarks")}</span>
                <span className="text-emerald-400">READY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface AboutSectionProps {
  dict?: any;
  lang?: string;
}

export function AboutSection({ dict, lang = "es" }: AboutSectionProps) {
  const isEs = lang === "es";
  const t = dict?.about;

  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Privacy Manifesto & DevTools Trace */}
          <div className="lg:col-span-6 space-y-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-700 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{t?.badge || (isEs ? "06 // PRIVACIDAD VERIFICABLE" : "06 // VERIFIABLE PRIVACY")}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-foreground font-heading tracking-tight leading-[1.06]">
              {t?.title || (isEs ? "Tus archivos nunca salen de tu equipo" : "Your files never leave your device")}
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {t?.p1 ||
                (isEs
                  ? "A diferencia de los editores en la nube que suben tus fotografías originales a servidores de terceros, ClearCut Studio descarga los motores WebAssembly en tu caché local y ejecuta todo el procesamiento dentro de tu navegador."
                  : "Unlike cloud editors that transmit your raw images to third-party servers, ClearCut Studio loads WebAssembly engines into local browser storage and processes every pixel on your device.")}
            </p>

            {/* DevTools Network Inspector Readout */}
            <div className="rounded-2xl bg-darkroom text-darkroom-foreground border border-white/10 p-4 sm:p-5 font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>DevTools → Network Inspector</span>
                </span>
                <span className="text-emerald-400 font-semibold">0 B UPLOADED</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">POST /api/upload-image</span>
                <span className="text-emerald-400">DISABLED // NONE</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">WORKER onnx-wasm-thread</span>
                <span className="text-slate-400">LOCAL MEMORY RAM</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">CANVAS 2d-pixel-buffer</span>
                <span className="text-slate-400">CLIENT SANDBOX</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href={`/${lang}/privacy`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>
                  {isEs ? "Leer arquitectura de privacidad y datos" : "Read privacy & data architecture"}
                </span>
              </Link>
            </div>
          </div>

          {/* Right: Obsidian Framed Visual Plate */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-darkroom p-3 sm:p-4 border border-border shadow-[0_28px_80px_-32px_rgba(12,14,18,0.45)]">
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <img
                  src="/img/secure-by-default.jpg"
                  alt={t?.imageAlt || (isEs ? "Arquitectura local y segura en tu navegador" : "Local browser-based secure processing architecture")}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between px-2 pt-3 font-mono text-[11px] text-slate-400">
                <span>LOCAL-FIRST // SANDBOXED RUNTIME</span>
                <span className="text-emerald-400 font-semibold">VERIFIABLE ZERO-UPLOAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
