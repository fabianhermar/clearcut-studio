import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";
import { ShieldCheck, Cpu, Zap, Layers, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs
      ? "Sobre ClearCut Studio — Arquitectura Local y Misión"
      : "About ClearCut Studio — Local Architecture & Mission",
    description: isEs
      ? "Conoce la arquitectura WebAssembly de ClearCut Studio, nuestros principios de privacidad verificable y el equipo detrás del proyecto."
      : "Learn about ClearCut Studio's WebAssembly architecture, verifiable privacy principles, and the team behind the project.",
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/about`,
      languages: {
        es: "https://studio.fabianh.me/es/about",
        en: "https://studio.fabianh.me/en/about",
      },
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  const stackItems = isEs
    ? [
        {
          code: "STACK 01",
          icon: Cpu,
          title: "ONNX Runtime Web y WebAssembly",
          desc: "La segmentación de sujetos y eliminación de fondos se ejecuta en el navegador mediante modelos neuronales cuantizados, evitando subir tus fotos a servidores externos.",
        },
        {
          code: "STACK 02",
          icon: Zap,
          title: "Códecs nativos en Web Workers",
          desc: "El optimizador utiliza compilaciones WebAssembly de libavif, libwebp y MozJPEG en un hilo dedicado para comprimir sin bloquear la interfaz.",
        },
        {
          code: "STACK 03",
          icon: Layers,
          title: "HTML5 Canvas 2D y buffers locales",
          desc: "La limpieza de metadatos EXIF, generación de favicons y ajuste de relación de aspecto operan directamente sobre buffers de píxeles en memoria RAM.",
        },
        {
          code: "STACK 04",
          icon: ShieldCheck,
          title: "Privacidad verificable por diseño",
          desc: "Puedes abrir las herramientas de desarrollo de tu navegador (pestaña Red/Network) y comprobar que ningún archivo de imagen se transmite fuera de tu equipo.",
        },
      ]
    : [
        {
          code: "STACK 01",
          icon: Cpu,
          title: "ONNX Runtime Web & WebAssembly",
          desc: "Subject segmentation and background removal run inside the browser using quantized neural models, avoiding external server uploads.",
        },
        {
          code: "STACK 02",
          icon: Zap,
          title: "Native Codecs in Web Workers",
          desc: "The image optimizer runs WebAssembly builds of libavif, libwebp, and MozJPEG inside a dedicated worker thread for non-blocking compression.",
        },
        {
          code: "STACK 03",
          icon: Layers,
          title: "HTML5 Canvas 2D & Local Buffers",
          desc: "EXIF sanitization, favicon generation, and aspect-ratio fitting operate directly on in-memory pixel buffers.",
        },
        {
          code: "STACK 04",
          icon: ShieldCheck,
          title: "Verifiable Privacy by Design",
          desc: "Open your browser's DevTools Network tab while editing to verify that zero image bytes are transmitted outside your device.",
        },
      ];

  return (
    <div className="min-h-screen bg-background studio-grid flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Editorial Index Header */}
          <div className="pb-10 mb-12 border-b border-border">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              {isEs ? "ARQUITECTURA // SOBRE CLEARCUT STUDIO" : "ARCHITECTURE // ABOUT CLEARCUT STUDIO"}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-foreground tracking-tight leading-[1.05] mb-5">
              {isEs
                ? "Herramientas visuales de precisión ejecutadas en tu navegador"
                : "Precision visual tools executed right inside your browser"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {isEs
                ? "ClearCut Studio reúne utilidades especializadas para diseñadores, desarrolladores y creadores que exigen control técnico, velocidad WebAssembly y privacidad verificable."
                : "ClearCut Studio brings together specialized utilities for designers, developers, and creators demanding technical control, WebAssembly speed, and verifiable privacy."}
            </p>
          </div>

          {/* Editorial Mission Block */}
          <div className="rounded-3xl bg-darkroom text-darkroom-foreground p-7 sm:p-11 mb-12 border border-white/10">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-3">
              {isEs ? "MANIFIESTO DE DISEÑO" : "ENGINEERING MANIFESTO"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-5">
              {isEs ? "Por qué trasladamos el estudio al cliente" : "Why we moved the studio into the client"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-slate-300 text-sm sm:text-base leading-relaxed font-accent">
              <p>
                {isEs
                  ? "La mayoría de las utilidades web para imágenes obligan a subir fotografías a servidores remotos, imponiendo límites de resolución, marcas de agua o suscripciones mensuales para tareas cotidianas como recortar un fondo o limpiar coordenadas GPS."
                  : "Most web image utilities force users to upload photographs to remote servers, imposing resolution caps, watermarks, or monthly paywalls for everyday tasks like background cutouts or stripping GPS metadata."}
              </p>
              <p>
                {isEs
                  ? "ClearCut Studio invierte ese modelo: aprovechamos WebAssembly, Web Workers, Canvas 2D y caché local del navegador para ejecutar los motores directamente en tu dispositivo sin coste de servidor ni esperas de red."
                  : "ClearCut Studio inverts that model: we harness WebAssembly, Web Workers, Canvas 2D, and local browser cache so the processing engine runs directly on your machine with zero upload queue."}
              </p>
            </div>
          </div>

          {/* Swiss Hairline Architecture Grid */}
          <div className="mb-12">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-5">
              {isEs ? "PILARES TÉCNICOS" : "TECHNICAL STACK"}
            </h2>
            <div className="rounded-3xl border border-border bg-card overflow-hidden grid sm:grid-cols-2">
              {stackItems.map((item, idx) => {
                const Icon = item.icon;
                const cellBorders = [
                  "border-b border-border sm:border-r",
                  "border-b border-border",
                  "border-b sm:border-b-0 border-border sm:border-r",
                  "",
                ][idx];
                return (
                  <div key={item.code} className={`p-6 sm:p-8 flex flex-col gap-3.5 ${cellBorders}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {item.code}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold font-heading text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-accent">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Author & Credits */}
          <div className="rounded-3xl bg-card border border-border p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                {isEs ? "MANTENIMIENTO INDEPENDIENTE" : "INDEPENDENT STEWARDSHIP"}
              </div>
              <h2 className="text-xl font-bold font-heading text-foreground mb-2">
                {isEs ? "Desarrollo y arquitectura" : "Development & Architecture"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl font-accent">
                {isEs
                  ? "ClearCut Studio es diseñado y desarrollado por Fabian Herrera como un estudio web independiente, gratuito y enfocado en herramientas visuales de precisión."
                  : "ClearCut Studio is designed and developed by Fabian Herrera as an independent, free studio focused on precision visual utilities."}
              </p>
            </div>
            <Link
              href={`/${lang}/?tool=background-remover`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-darkroom hover:bg-primary text-white text-sm font-semibold transition-colors shrink-0"
            >
              <span>{isEs ? "Explorar herramientas" : "Explore tools"}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
