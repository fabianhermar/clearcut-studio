import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";
import { BrandSwatches } from "@/components/studio/brand-swatches";
import { HeartHandshake, Type, Palette, Sparkles } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs
      ? "Proyecto, Manifiesto y Guía de Marca | ClearCut Studio"
      : "Project Manifesto & Brand Guidelines | ClearCut Studio",
    description: isEs
      ? "Conoce el manifiesto del proyecto, los tokens de color oficiales, tipografía y recursos de marca de ClearCut Studio."
      : "Read the project manifesto, official color tokens, typography, and brand assets of ClearCut Studio.",
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/brand`,
      languages: {
        es: "https://studio.fabianh.me/es/brand",
        en: "https://studio.fabianh.me/en/brand",
      },
    },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Hero Header */}
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEs ? "Manifiesto y Sistema Visual" : "Manifesto & Visual System"}</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-5">
              {isEs ? "El Proyecto y Guía de Marca" : "Project Manifesto & Brand Kit"}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isEs
                ? "Principios del proyecto, modelo de sostenibilidad abierto y tokens visuales oficiales del sistema de diseño ClearCut Studio 2026."
                : "Project principles, open sustainability model, and official visual tokens of the ClearCut Studio 2026 design system."}
            </p>
          </div>

          {/* Manifesto Section */}
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-2xs space-y-5">
            <h2 className="text-2xl font-bold font-heading text-foreground">
              {isEs ? "Manifiesto del Producto" : "Product Manifesto"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isEs
                ? "ClearCut Studio nació con una premisa técnica clara: demostrar que la web contemporánea permite ejecutar herramientas gráficas de alta precisión directamente en el navegador del usuario sin depender de suscripciones obligatorias ni servidores que almacenen fotografías privadas."
                : "ClearCut Studio was built with a clear technical premise: proving that the modern web can run high-precision graphic utilities directly inside the user's browser without mandatory subscriptions or remote servers storing private photographs."}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {isEs
                ? "Todas las herramientas locales de ClearCut Studio son gratuitas, no imponen marcas de agua y no establecen límites diarios artificiales. Si el estudio te ahorra tiempo en tu flujo de diseño o desarrollo, puedes apoyar voluntariamente su mantenimiento."
                : "All local tools in ClearCut Studio are free, impose no watermarks, and set no artificial daily quotas. If the studio saves you time in your design or development workflow, you can voluntarily support its maintenance."}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="https://www.buymeacoffee.com/fabianhermar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm transition-colors shadow-2xs"
              >
                <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                <span>{isEs ? "Apoyar en Buy Me a Coffee" : "Support on Buy Me a Coffee"}</span>
              </a>
              <a
                href="https://github.com/sponsors"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-background hover:bg-muted border border-border text-foreground font-semibold text-sm transition-colors"
              >
                <span>{isEs ? "GitHub Sponsors" : "GitHub Sponsors"}</span>
              </a>
            </div>
          </section>

          {/* Logo Showcase */}
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {isEs ? "Logotipo Oficial" : "Official Logotype"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEs
                  ? "Mantén siempre una zona de respeto limpia alrededor del logotipo y evita alterar sus proporciones."
                  : "Always preserve clear space around the logotype and avoid distorting its aspect ratio."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-10 bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-4 shadow-2xs">
                <img
                  src="/logos/ClearCut-logo.avif"
                  alt="ClearCut Studio Logo (Light surface)"
                  className="h-24 w-auto object-contain"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {isEs ? "Superficie clara (#FFFFFF)" : "Light surface (#FFFFFF)"}
                </span>
              </div>
              <div className="p-10 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-2xs">
                <img
                  src="/logos/ClearCut-logo.avif"
                  alt="ClearCut Studio Logo (Dark surface)"
                  className="h-24 w-auto object-contain brightness-110"
                />
                <span className="text-xs font-mono text-slate-400">
                  {isEs ? "Superficie oscura (#0F172A)" : "Dark surface (#0F172A)"}
                </span>
              </div>
            </div>
          </section>

          {/* Interactive Color Tokens */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-bold font-heading text-foreground">
                  {isEs ? "Paleta de Color y Tokens (2026)" : "Color Palette & Design Tokens (2026)"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEs
                    ? "Haz clic en cualquier muestra para copiar su valor hexadecimal al portapapeles."
                    : "Click any swatch button to copy its hexadecimal value to the clipboard."}
                </p>
              </div>
            </div>

            <BrandSwatches lang={lang} />
          </section>

          {/* Typography System */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5">
              <Type className="w-5 h-5 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-bold font-heading text-foreground">
                  {isEs ? "Sistema Tipográfico" : "Typography System"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEs
                    ? "Jerarquía tipográfica optimizada para legibilidad editorial e interfaces técnicas."
                    : "Typographic hierarchy optimized for editorial legibility and technical interfaces."}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-xs font-mono font-semibold text-primary uppercase">
                  Heading Font
                </span>
                <h3 className="text-2xl font-bold font-heading text-foreground mt-2 mb-2">
                  Urbanist Variable
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEs
                    ? "Utilizada en titulares principales, encabezados de sección y nombres de herramientas con pesos 600–700."
                    : "Used for main headlines, section headers, and tool titles in weights 600–700."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-xs font-mono font-semibold text-primary uppercase">
                  Body & UI Controls
                </span>
                <h3 className="text-2xl font-bold font-sans text-foreground mt-2 mb-2">
                  Albert Sans Variable
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEs
                    ? "Utilizada en texto de lectura, controles de interfaz, etiquetas de formularios y navegación."
                    : "Used for body copy, interface controls, form labels, and navigation."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-xs font-mono font-semibold text-primary uppercase">
                  Technical Metrics
                </span>
                <h3 className="text-2xl font-bold font-mono text-foreground mt-2 mb-2">
                  UI Monospace
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEs
                    ? "Reservada para dimensiones en píxeles, pesos en KB/MB, porcentajes, códigos HEX/RGB y bloques CSS."
                    : "Reserved for pixel dimensions, KB/MB file weights, percentages, HEX/RGB codes, and CSS snippets."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
