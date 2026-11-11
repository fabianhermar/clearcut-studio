import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";
import { ShieldCheck, Lock, Cpu, EyeOff, KeyRound } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs
      ? "Política de Privacidad y Procesamiento Local | ClearCut Studio"
      : "Privacy Policy & Local Processing | ClearCut Studio",
    description: isEs
      ? "Explicación técnica verificable sobre cómo ClearCut Studio procesa tus imágenes localmente en el navegador, qué recursos descarga y cómo protege tu privacidad."
      : "Verifiable technical breakdown of how ClearCut Studio processes your images locally in the browser, what assets are downloaded, and how your privacy is protected.",
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
        {
          scope: "Imágenes y fotografías cargadas",
          where: "100% local en la memoria RAM del navegador",
          external: "Nunca se envían a ningún servidor",
        },
        {
          scope: "Pesos del modelo IA (@imgly/background-removal)",
          where: "Descargados 1ª vez y guardados en Cache Storage local",
          external: "Solo descarga estática del modelo (~40 MB), sin envío de fotos",
        },
        {
          scope: "Preferencias de usuario",
          where: "LocalStorage del navegador",
          external: "Permanecen en tu dispositivo",
        },
        {
          scope: "Analítica de navegación (Microsoft Clarity)",
          where: "Métricas anónimas de interacción en páginas públicas",
          external: "Jamás captura ni transmite los buffers de imagen de Canvas/WASM",
        },
      ]
    : [
        {
          scope: "Uploaded images & photographs",
          where: "100% local in browser RAM",
          external: "Never transmitted to any server",
        },
        {
          scope: "AI model weights (@imgly/background-removal)",
          where: "Downloaded on first run & cached in local Cache Storage",
          external: "Static model download (~40 MB) only; zero photo uploads",
        },
        {
          scope: "User preferences",
          where: "Browser LocalStorage",
          external: "Remains on your device",
        },
        {
          scope: "Navigation analytics (Microsoft Clarity)",
          where: "Anonymized UI interaction metrics",
          external: "Never captures or transmits Canvas/WASM image buffers",
        },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEs ? "Privacidad Verificable" : "Verifiable Privacy"}</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-3">
              {isEs ? "Política de Privacidad" : "Privacy Policy"}
            </h1>
            <p className="text-sm font-mono text-muted-foreground">
              {isEs ? "Última actualización: Junio de 2026" : "Last updated: June 2026"}
            </p>
          </div>

          {/* Technical Summary Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs mb-12">
            <div className="p-4 sm:p-5 border-b border-border bg-muted/40">
              <h2 className="text-sm font-bold font-heading text-foreground uppercase tracking-wider">
                {isEs
                  ? "Resumen técnico de flujo de datos"
                  : "Technical Data Flow Summary"}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                    <th className="py-3 px-4 font-semibold">
                      {isEs ? "Tipo de dato" : "Data Type"}
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      {isEs ? "Dónde se procesa / almacena" : "Where it is processed / stored"}
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      {isEs ? "Transferencia externa" : "External Transfer"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summaryRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-3.5 px-4 font-semibold text-foreground">{row.scope}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{row.where}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-emerald-800 font-medium">
                        {row.external}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8">
            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold font-heading text-foreground">
                  {isEs
                    ? "1. Procesamiento local de imágenes en el navegador"
                    : "1. In-Browser Local Image Processing"}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isEs
                  ? "Todas las herramientas actuales de ClearCut Studio (Eliminador de Fondos con IA, Optimizador WASM, Limpiador EXIF, Generador de Favicons, Extractor de Degradados, Ajuste de Proporción, Marca de Agua por Lotes y Estudio de Mockups) se ejecutan íntegramente dentro de tu navegador web utilizando WebAssembly, Web Workers y HTML5 Canvas."
                  : "All current ClearCut Studio utilities (AI Background Remover, WASM Image Optimizer, EXIF Stripper, Favicon Generator, Gradient Extractor, Aspect Ratio Fitter, Batch Watermarker, and Mockup Studio) execute entirely inside your web browser using WebAssembly, Web Workers, and HTML5 Canvas."}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isEs
                  ? "Tus archivos de imagen jamás se envían a nuestros servidores. Todo el cálculo se realiza utilizando la memoria RAM y el procesador de tu propio dispositivo."
                  : "Your image files are never uploaded to our servers. All computation is performed using your own device's RAM and processor."}
              </p>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold font-heading text-foreground">
                  {isEs
                    ? "2. Descarga y caché local de modelos de IA y códecs WASM"
                    : "2. Local Caching of AI Models & WASM Codecs"}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isEs
                  ? "Cuando utilizas por primera vez el Eliminador de Fondos con IA, tu navegador descarga los pesos estáticos del modelo neuronal ONNX (~40 MB) y los almacena en el almacenamiento en caché local de tu navegador (Cache Storage / IndexedDB). Este tráfico de red es exclusivamente de descarga (hacia tu navegador) y nunca envía tus fotografías al exterior."
                  : "When you run the AI Background Remover for the first time, your browser downloads the static ONNX neural model weights (~40 MB) and stores them in your browser's local Cache Storage / IndexedDB. This network traffic is strictly inbound (downloading the model to your browser) and never sends your photographs externally."}
              </p>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold font-heading text-foreground">
                  {isEs
                    ? "3. Integración opcional futura de APIs externas (Modelo BYOK)"
                    : "3. Future Optional Third-Party API Integration (BYOK Model)"}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isEs
                  ? "Para futuras funciones de IA generativa pesada que no puedan ejecutarse localmente en un navegador estándar, ClearCut Studio implementará un modelo opcional 'Bring Your Own Key' (BYOK). El uso de cualquier API externa será siempre opcional y explícito: se te informará claramente antes de que cualquier imagen salga de tu dispositivo hacia el proveedor de API que tú elijas conectar."
                  : "For future heavy generative AI capabilities that cannot run locally inside a standard browser, ClearCut Studio will implement an optional 'Bring Your Own Key' (BYOK) model. Using any external API will always be opt-in and explicit: you will be clearly notified before any image leaves your device toward the API provider you choose to connect."}
              </p>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold font-heading text-foreground">
                  {isEs
                    ? "4. Analítica de uso y almacenamiento local"
                    : "4. Usage Analytics & Local Storage"}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isEs
                  ? "ClearCut Studio no requiere cuentas de usuario ni registro. Utilizamos Microsoft Clarity únicamente para comprender de forma agregada y anónima la ergonomía de la interfaz (clics y desplazamiento). Los buffers de imagen procesados en WebAssembly y Canvas están aislados en memoria y no son accesibles ni registrados por herramientas analíticas. Asimismo, utilizamos LocalStorage únicamente para recordar preferencias técnicas de la interfaz en tu propio navegador."
                  : "ClearCut Studio requires no user accounts or registration. We use Microsoft Clarity solely to understand anonymized, aggregate interface ergonomics (clicks and scrolling). Image buffers processed in WebAssembly and Canvas are isolated in memory and are never accessed or recorded by analytics scripts. We also use LocalStorage strictly to remember technical UI preferences in your own browser."}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
