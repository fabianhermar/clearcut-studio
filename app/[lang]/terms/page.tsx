import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";
import { FileCheck2 } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs
      ? "Términos y Condiciones de Uso | ClearCut Studio"
      : "Terms & Conditions of Use | ClearCut Studio",
    description: isEs
      ? "Términos de servicio para el uso personal y comercial de las herramientas de ClearCut Studio."
      : "Terms of service for personal and commercial use of ClearCut Studio utilities.",
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/terms`,
      languages: {
        es: "https://studio.fabianh.me/es/terms",
        en: "https://studio.fabianh.me/en/terms",
      },
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          title: "1. Uso del servicio",
          body: "ClearCut Studio se ofrece como una suite de herramientas web gratuitas para uso personal, académico y comercial. No se requiere registro de cuenta para utilizar ninguna de las utilidades de procesamiento local.",
        },
        {
          title: "2. Propiedad intelectual y derechos sobre tus imágenes",
          body: "Tú conservas el 100% de los derechos de autor y propiedad sobre todas las imágenes que procesas en ClearCut Studio. Dado que el procesamiento ocurre localmente en tu navegador, nosotros no almacenamos, inspeccionamos ni reclamamos derecho alguno sobre tus archivos. Eres responsable de contar con los permisos necesarios sobre el material que edites.",
        },
        {
          title: "3. Garantías y limitación de responsabilidad",
          body: "Las herramientas de segmentación con IA, codificación WASM y manipulación de lienzo se proporcionan 'tal cual' (as-is). Aunque buscamos la máxima precisión técnica, los algoritmos de recorte o compresión pueden presentar variaciones según la imagen de entrada. ClearCut Studio no se hace responsable por pérdidas de datos o daños derivados del uso de los archivos exportados.",
        },
        {
          title: "4. Uso de claves de API de terceros (Modelo híbrido BYOK)",
          body: "Para futuras herramientas que permitan conectar credenciales propias de proveedores externos (como OpenAI o Google Gemini), el usuario acepta regirse por los términos de servicio y facturación del proveedor externo correspondiente. ClearCut Studio actúa únicamente como interfaz cliente.",
        },
        {
          title: "5. Disponibilidad y actualizaciones",
          body: "Podemos mejorar, actualizar o modificar las herramientas del estudio en cualquier momento para optimizar su rendimiento o compatibilidad con los estándares web modernos.",
        },
      ]
    : [
        {
          title: "1. Use of Service",
          body: "ClearCut Studio is provided as a free suite of web utilities for personal, academic, and commercial use. No account registration is required to use any of the local processing tools.",
        },
        {
          title: "2. Intellectual Property & Image Rights",
          body: "You retain 100% of the copyright and ownership over all images you process in ClearCut Studio. Because processing happens locally inside your browser, we never store, inspect, or claim any rights over your files. You are responsible for ensuring you hold the necessary rights to modify the material you load.",
        },
        {
          title: "3. Warranties & Limitation of Liability",
          body: "AI segmentation, WASM encoding, and canvas manipulation utilities are provided 'as-is'. While we engineer for maximum technical accuracy, automated cutouts or compression codecs may vary depending on source imagery. ClearCut Studio is not liable for data loss or damages arising from exported assets.",
        },
        {
          title: "4. Third-Party API Keys (Hybrid BYOK Model)",
          body: "For future utilities that allow connecting your own credentials from external providers (such as OpenAI or Google Gemini), you agree to abide by the respective provider's terms of service and billing policies. ClearCut Studio acts strictly as a client interface.",
        },
        {
          title: "5. Availability & Updates",
          body: "We may enhance, update, or modify studio utilities at any time to improve performance or compatibility with modern web standards.",
        },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEs ? "Condiciones Legales" : "Legal Terms"}</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-3">
              {isEs ? "Términos y Condiciones" : "Terms & Conditions"}
            </h1>
            <p className="text-sm font-mono text-muted-foreground">
              {isEs ? "Última actualización: Junio de 2026" : "Last updated: June 2026"}
            </p>
          </div>

          <div className="space-y-5">
            {sections.map((sec, idx) => (
              <section
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xs space-y-2.5"
              >
                <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  {sec.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
