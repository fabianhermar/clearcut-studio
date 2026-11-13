import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";
import { ShieldCheck } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs ? "Política de Privacidad — ClearCut Studio" : "Privacy Policy — ClearCut Studio",
    description: isEs
      ? "Política de privacidad verificable de ClearCut Studio: procesamiento 100% local de imágenes en el navegador sin subidas ni rastreo de archivos."
      : "Verifiable privacy policy for ClearCut Studio: 100% in-browser local image processing with zero file uploads or tracking.",
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/privacy`,
      languages: {
        es: "https://studio.fabianh.me/es/privacy",
        en: "https://studio.fabianh.me/en/privacy",
      },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  const summaryRows = isEs
    ? [
        { tool: "Eliminador de Fondos IA", execution: "Local (ONNX Runtime Web)", network: "0 bytes de imagen enviados" },
        { tool: "Optimizador AVIF / WebP / JPEG", execution: "Local (WebAssembly Worker)", network: "0 bytes de imagen enviados" },
        { tool: "Limpiador de Metadatos EXIF", execution: "Local (exifr + Canvas 2D)", network: "0 bytes de imagen enviados" },
        { tool: "Extractor de Colores y Degradados", execution: "Local (Canvas Pixel Buffer)", network: "0 bytes de imagen enviados" },
        { tool: "Generador de Favicons", execution: "Local (Canvas + JSZip)", network: "0 bytes de imagen enviados" },
        { tool: "Adaptador de Relación de Aspecto", execution: "Local (Canvas 2D)", network: "0 bytes de imagen enviados" },
        { tool: "Futuro Generador IA en Streaming", execution: "Nube (requerirá API externa)", network: "Se avisará explícitamente" },
      ]
    : [
        { tool: "AI Background Remover", execution: "Local (ONNX Runtime Web)", network: "0 image bytes sent" },
        { tool: "AVIF / WebP / JPEG Optimizer", execution: "Local (WebAssembly Worker)", network: "0 image bytes sent" },
        { tool: "EXIF Metadata Stripper", execution: "Local (exifr + Canvas 2D)", network: "0 image bytes sent" },
        { tool: "Color & Gradient Extractor", execution: "Local (Canvas Pixel Buffer)", network: "0 image bytes sent" },
        { tool: "Favicon Generator", execution: "Local (Canvas + JSZip)", network: "0 image bytes sent" },
        { tool: "Aspect Ratio Fitter", execution: "Local (Canvas 2D)", network: "0 image bytes sent" },
        { tool: "Upcoming Streaming AI Generator", execution: "Cloud (external API required)", network: "Explicit notice shown" },
      ];

  const sections = isEs
    ? [
        {
          title: "1. Procesamiento local de archivos",
          body: "Todas las herramientas disponibles actualmente en ClearCut Studio ejecutan la lectura, edición, segmentación y codificación de tus imágenes íntegramente dentro de tu propio navegador utilizando HTML5 Canvas, Web Workers y WebAssembly. No almacenamos copias de tus fotografías en servidores remotos.",
        },
        {
          title: "2. Descarga inicial de modelos y caché del navegador",
          body: "La primera vez que utilizas el eliminador de fondos o los códecs de compresión, tu navegador descarga los archivos binarios estáticos del modelo neuronal (ONNX) y los módulos WASM desde la red de entrega de contenido para guardarlos localmente. A partir de ese momento, tus imágenes se procesan sin salir de tu dispositivo.",
        },
        {
          title: "3. Cookies y almacenamiento local",
          body: "ClearCut Studio no requiere cuentas de usuario ni utiliza cookies publicitarias invasivas. Podemos almacenar preferencias mínimas de interfaz (como tu idioma seleccionado) en el almacenamiento local del navegador.",
        },
        {
          title: "4. Transparencia ante futuras funciones externas",
          body: "Si en futuras versiones se habilitan utilidades experimentales que dependan de APIs externas (como el futuro generador de imágenes IA en streaming), se indicará de forma visible y explícita antes de iniciar cualquier envío fuera del navegador.",
        },
      ]
    : [
        {
          title: "1. Local File Processing",
          body: "All currently active tools inside ClearCut Studio read, edit, segment, and encode your images strictly inside your own browser using HTML5 Canvas, Web Workers, and WebAssembly. We never store copies of your photographs on remote servers.",
        },
        {
          title: "2. Initial Model & Codec Caching",
          body: "The first time you run the background remover or compression codecs, your browser downloads the static neural model binaries (ONNX) and WASM encoder modules into local browser storage. Once loaded, your image bytes never leave your device.",
        },
        {
          title: "3. Cookies & Local Storage",
          body: "ClearCut Studio requires no user accounts and sets no invasive advertising cookies. Minimal UI preferences (such as active locale) may stay in local browser storage.",
        },
        {
          title: "4. Disclosure of Future Cloud Features",
          body: "If future experimental modules connect to external cloud APIs (such as the upcoming streaming AI image generator), ClearCut Studio will display an explicit disclosure prior to transmitting any prompt or asset.",
        },
      ];

  return (
    <div className="min-h-screen bg-background studio-grid flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Editorial Header */}
          <div className="pb-10 mb-10 border-b border-border">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>{isEs ? "PRIVACIDAD VERIFICABLE // SPEC" : "VERIFIABLE PRIVACY // SPEC"}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-4">
              {isEs ? "Política de Privacidad" : "Privacy Policy"}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {isEs
                ? "Cómo manejamos tus archivos e información técnica en ClearCut Studio, explicado herramienta por herramienta de forma auditable."
                : "How ClearCut Studio handles your files and runtime behavior, documented tool by tool for straightforward auditing."}
            </p>
          </div>

          {/* Audit Matrix Table */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden mb-12">
            <div className="px-6 py-4 bg-darkroom text-white flex items-center justify-between">
              <h2 className="font-heading font-bold text-sm sm:text-base">
                {isEs ? "Matriz de ejecución y red por herramienta" : "Per-tool runtime & network transfer matrix"}
              </h2>
              <span className="font-mono text-[11px] text-emerald-400">VERIFIED // CLIENT-SIDE</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-3.5 px-6 font-semibold">{isEs ? "Herramienta" : "Tool"}</th>
                    <th className="py-3.5 px-6 font-semibold">{isEs ? "Entorno de ejecución" : "Execution Layer"}</th>
                    <th className="py-3.5 px-6 font-semibold">{isEs ? "Tráfico de imagen" : "Image Network Traffic"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-accent">
                  {summaryRows.map((row) => (
                    <tr key={row.tool} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6 font-semibold text-foreground">{row.tool}</td>
                      <td className="py-4 px-6 font-mono text-xs text-muted-foreground">{row.execution}</td>
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-emerald-800">{row.network}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Numbered Policy Sections */}
          <div className="rounded-3xl border border-border bg-card divide-y divide-border overflow-hidden">
            {sections.map((sec) => (
              <section key={sec.title} className="p-6 sm:p-8 space-y-2.5">
                <h2 className="font-heading font-bold text-xl text-foreground">{sec.title}</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-accent">
                  {sec.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
