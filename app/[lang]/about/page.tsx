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
          icon: Cpu,
          title: "ONNX Runtime Web y WebAssembly",
          desc: "La segmentación de sujetos y eliminación de fondos se ejecuta en el navegador mediante modelos neuronales cuantizados, evitando subir tus fotos a servidores externos.",
        },
        {
          icon: Zap,
          title: "Códecs nativos en Web Workers",
          desc: "El optimizador utiliza compilaciones WebAssembly de libavif, libwebp y MozJPEG en un hilo dedicado para comprimir sin bloquear la interfaz.",
        },
        {
          icon: Layers,
          title: "HTML5 Canvas 2D y procesamiento por lotes",
          desc: "La limpieza de metadatos EXIF, generación de favicons, ajuste de relación de aspecto y marcas de agua operan directamente sobre buffers de píxeles en memoria RAM.",
        },
        {
          icon: ShieldCheck,
          title: "Privacidad verificable por diseño",
          desc: "Puedes abrir las herramientas de desarrollo de tu navegador (pestaña Red/Network) y comprobar que ningún archivo de imagen se transmite fuera de tu equipo.",
        },
      ]
    : [
        {
          icon: Cpu,
          title: "ONNX Runtime Web & WebAssembly",
          desc: "Subject segmentation and background removal run inside the browser using quantized neural models, avoiding external server uploads.",
        },
        {
          icon: Zap,
          title: "Native Codecs in Web Workers",
          desc: "The image optimizer runs WebAssembly builds of libavif, libwebp, and MozJPEG inside a dedicated worker thread for non-blocking compression.",
        },
        {
          icon: Layers,
          title: "HTML5 Canvas 2D & Batch Buffers",
          desc: "EXIF sanitization, favicon generation, aspect-ratio fitting, and batch watermarking operate directly on in-memory pixel buffers.",
        },
        {
          icon: ShieldCheck,
          title: "Verifiable Privacy by Design",
          desc: "Open your browser's DevTools Network tab while editing to verify that zero image bytes are transmitted outside your device.",
        },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              {isEs ? "Sobre el producto" : "About the product"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-5">
              {isEs
                ? "Herramientas visuales de precisión ejecutadas en tu propio navegador"
                : "Precision visual tools executed right inside your browser"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {isEs
                ? "ClearCut Studio reúne 8 utilidades especializadas para diseñadores, desarrolladores y creadores de contenido que necesitan velocidad, control técnico y privacidad verificable sin muros de pago."
                : "ClearCut Studio brings together 8 specialized utilities for designers, developers, and creators who need speed, technical control, and verifiable privacy without paywalls."}
            </p>
          </div>

          {/* Editorial Content */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-2xs space-y-6 text-foreground leading-relaxed mb-12">
            <h2 className="text-2xl font-bold font-heading text-foreground">
              {isEs ? "Nuestra misión" : "Our Mission"}
            </h2>
            <p className="text-muted-foreground">
              {isEs
                ? "La mayoría de las utilidades web para trabajar con imágenes obligan al usuario a subir sus fotografías a servidores remotos, imponiendo límites artificiales de resolución, marcas de agua o suscripciones mensuales para tareas cotidianas como recortar un fondo, convertir a AVIF o eliminar coordenadas GPS."
                : "Most web image utilities force users to upload their photographs to remote servers, imposing artificial resolution caps, watermarks, or monthly subscriptions for everyday tasks like removing a background, converting to AVIF, or stripping GPS coordinates."}
            </p>
            <p className="text-muted-foreground">
              {isEs
                ? "ClearCut Studio invierte ese modelo: aprovechamos las capacidades de los navegadores modernos (WebAssembly, Web Workers, Canvas 2D y almacenamiento en caché local) para trasladar el motor de procesamiento directamente a tu dispositivo."
                : "ClearCut Studio inverts that model: we leverage modern browser capabilities (WebAssembly, Web Workers, Canvas 2D, and local cache storage) to deliver the processing engine directly to your device."}
            </p>
          </div>

          {/* Technical Architecture Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-heading text-foreground mb-6">
              {isEs ? "Arquitectura técnica" : "Technical Architecture"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {stackItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold font-heading text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Author & Credits */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-foreground mb-2">
                {isEs ? "Desarrollo y mantenimiento" : "Development & Stewardship"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                {isEs
                  ? "ClearCut Studio es diseñado y desarrollado por Fabian Herrera como un estudio web independiente, gratuito y enfocado en la comunidad."
                  : "ClearCut Studio is designed and developed by Fabian Herrera as an independent, free, community-focused web studio."}
              </p>
            </div>
            <Link
              href={`/${lang}/?tool=background-remover`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shrink-0"
            >
              <span>{isEs ? "Explorar herramientas" : "Explore tools"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
