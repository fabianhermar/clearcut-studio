import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { BrandSwatches } from "@/components/studio/brand-swatches";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs
      ? "Manifiesto y Sistema de Marca — ClearCut Studio"
      : "Manifesto & Brand System — ClearCut Studio",
    description: isEs
      ? "Sistema visual de ClearCut Studio: dirección Optical Atelier & Tactile Darkroom, paleta interactiva, tipografía Urbanist/Albert Sans y directrices de marca."
      : "ClearCut Studio visual system: Optical Atelier & Tactile Darkroom direction, interactive palette, Urbanist/Albert Sans typography, and brand guidelines.",
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

  const principles = isEs
    ? [
        {
          code: "01",
          title: "Simplicidad",
          desc: "Operaciones complejas de imagen sin fricción técnica innecesaria ni menús ocultos.",
        },
        {
          code: "02",
          title: "Rendimiento",
          desc: "Interfaz ágil y motores WebAssembly ejecutados en paralelo fuera del hilo principal.",
        },
        {
          code: "03",
          title: "Privacidad",
          desc: "Transparencia técnica verificable: los procesos locales declaran exactamente cero envíos de red.",
        },
      ]
    : [
        {
          code: "01",
          title: "Simplicity",
          desc: "Complex image processing without unnecessary technical friction or buried menus.",
        },
        {
          code: "02",
          title: "Performance",
          desc: "Responsive workspaces powered by WebAssembly engines running off the main thread.",
        },
        {
          code: "03",
          title: "Privacy",
          desc: "Verifiable technical transparency: local pipelines declare zero network file transfers.",
        },
      ];

  return (
    <div className="min-h-screen bg-background studio-grid flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Editorial Index Header */}
          <div className="pb-10 border-b border-border">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              {isEs ? "SISTEMA VISUAL // OPTICAL ATELIER" : "VISUAL SYSTEM // OPTICAL ATELIER"}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-foreground tracking-tight leading-[1.05] mb-5">
              {isEs ? "Manifiesto y Sistema de Marca" : "Manifesto & Brand System"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {isEs
                ? "Directrices visuales, retícula suiza, visores Darkroom, paleta de tokens interactiva y jerarquía tipográfica de ClearCut Studio."
                : "Visual guidelines, Swiss grid hairlines, Darkroom viewports, interactive color tokens, and typographic hierarchy for ClearCut Studio."}
            </p>
          </div>

          {/* 3 Principles Strip */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {isEs ? "01 // PRINCIPIOS RECTORES" : "01 // CORE PRINCIPLES"}
            </h2>
            <div className="rounded-3xl border border-border bg-card overflow-hidden grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {principles.map((p) => (
                <div key={p.code} className="p-6 sm:p-8 flex flex-col justify-between gap-4">
                  <span className="font-mono text-xs font-bold text-primary">{p.code}</span>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-accent">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Logo Specimens (Warm Paper vs Obsidian Darkroom) */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {isEs ? "02 // LOGOTIPO Y CONTRASTE" : "02 // LOGOMARK & CONTRAST"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-10 rounded-3xl bg-card border border-border flex flex-col items-center justify-center gap-5 min-h-[210px]">
                <img
                  src="/logos/ClearCut-logo.avif"
                  alt="ClearCut Studio Logo Light"
                  className="h-16 w-auto object-contain"
                />
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {isEs ? "Superficie clara · #FFFFFF / #F4F3EF" : "Light Surface · #FFFFFF / #F4F3EF"}
                </span>
              </div>
              <div className="p-10 rounded-3xl bg-darkroom border border-white/10 flex flex-col items-center justify-center gap-5 min-h-[210px]">
                <img
                  src="/logos/ClearCut-logo.avif"
                  alt="ClearCut Studio Logo Darkroom"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  {isEs ? "Visor Darkroom · #0C0E12" : "Darkroom Viewport · #0C0E12"}
                </span>
              </div>
            </div>
          </section>

          {/* Color Palette with Interactive Copy */}
          <section className="space-y-5">
            <div>
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                {isEs ? "03 // TOKENS CROMÁTICOS" : "03 // COLOR TOKENS"}
              </h2>
              <p className="text-sm text-muted-foreground font-accent">
                {isEs
                  ? "Haz clic en cualquier token para copiar su valor hexadecimal exacto."
                  : "Click any token to copy its exact hexadecimal color value."}
              </p>
            </div>
            <BrandSwatches lang={lang} />
          </section>

          {/* Typography Scale */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {isEs ? "04 // ESCALA TIPOGRÁFICA" : "04 // TYPOGRAPHIC SYSTEM"}
            </h2>
            <div className="rounded-3xl border border-border bg-card divide-y divide-border overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary block mb-1.5">
                    Heading · Urbanist Variable
                  </span>
                  <p className="text-3xl sm:text-4xl font-bold font-heading text-foreground tracking-tight">
                    Aa Bb Cc — Precisión visual en tu navegador
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground shrink-0">700 / 800</span>
              </div>

              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary block mb-1.5">
                    Body & Controls · Albert Sans Variable
                  </span>
                  <p className="text-base sm:text-lg font-sans text-foreground max-w-2xl leading-relaxed">
                    Interfaz limpia y equilibrada para controles de compresión, pinceles de recorte y documentación técnica.
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground shrink-0">400 / 600</span>
              </div>

              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary block mb-1.5">
                    Telemetry & Metadata · UI Monospace
                  </span>
                  <p className="font-mono text-sm sm:text-base text-foreground">
                    1920 × 1080 px · #1E40FF · AVIF 245 KB (-90%) · 0 B UPLOADED
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground shrink-0">tabular-nums</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
