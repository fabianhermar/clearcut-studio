import {
  Check,
  ShieldCheck,
  Monitor,
  Users,
  Coffee,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ApiDisclaimer } from "./api-disclaimer";

interface PricingSectionProps {
  dict?: any;
  lang?: string;
}

export function PricingSection({ dict, lang = "es" }: PricingSectionProps) {
  const isEs = lang === "es";
  const t = dict?.pricing || {
    title: isEs ? "Precios Simples y Transparentes" : "Simple & Transparent Pricing",
    subtitle: isEs
      ? "ClearCut es gratis, pero puedes apoyarnos."
      : "ClearCut Studio is free for everyone, sustained voluntarily.",
    free: {
      title: isEs ? "Gratis" : "Free",
      desc: isEs
        ? "Perfecto para probar nuestra plataforma y procesar imágenes ilimitadas."
        : "Everything unlocked to process unlimited images right inside your browser.",
      price: "$0",
      period: isEs ? "/para siempre" : "/forever",
      whatsIncluded: isEs ? "¿Qué incluye?" : "What's Included?",
      features: isEs
        ? [
            "Eliminación de fondos ilimitada",
            "Optimización de imágenes ilimitada",
            "Procesamiento local 100% privado",
            "Sin marcas de agua",
            "Resultados de alta calidad",
          ]
        : [
            "Unlimited background removals",
            "Unlimited image optimizations",
            "100% private local processing",
            "No watermarks on exports",
            "High quality results",
          ],
      btn: isEs ? "Comenzar gratis" : "Start for free",
    },
    sponsor: {
      title: isEs ? "Apoyar el Proyecto" : "Support the Project",
      desc: isEs
        ? "Ayúdanos a mantener ClearCut Studio gratis y desarrollar nuevas herramientas."
        : "Help us keep ClearCut Studio free and fund new feature development.",
      whatsIncluded: isEs ? "¿Por qué apoyar?" : "Why Support?",
      features: isEs
        ? [
            "Cubrir costos de dominio y hosting",
            "Financiar nuevas herramientas",
            "Mantener la app 100% gratuita",
            "Sin anuncios ni rastreo de datos",
            "Impulsar mejoras continuas en WebAssembly",
          ]
        : [
            "Cover domain and hosting costs",
            "Fund new feature development",
            "Keep the tool 100% free",
            "No ads or data tracking",
            "Support continuous WebAssembly improvements",
          ],
      btn: isEs ? "Patrocinarnos" : "Sponsor us",
    },
  };

  const pillars = isEs
    ? [
        {
          code: "01",
          icon: ShieldCheck,
          title: "Siempre será gratis",
          desc: "Nunca habrá un plan de pago obligatorio. Las herramientas locales principales de ClearCut Studio permanecerán gratuitas.",
        },
        {
          code: "02",
          icon: Monitor,
          title: "Tu privacidad primero",
          desc: "El procesamiento local ocurre dentro de tu navegador. Tus fotografías jamás llegan a nuestros servidores.",
        },
        {
          code: "03",
          icon: Users,
          title: "Financiado por la comunidad",
          desc: "El dominio, infraestructura y desarrollo continuo se sostienen mediante aportes voluntarios, sin anuncios ni presión.",
        },
      ]
    : [
        {
          code: "01",
          icon: ShieldCheck,
          title: "Always free",
          desc: "There will never be a mandatory paid tier. ClearCut Studio's core local tools remain free forever.",
        },
        {
          code: "02",
          icon: Monitor,
          title: "Your privacy first",
          desc: "Local processing executes strictly in your browser. Your photographs never touch our servers.",
        },
        {
          code: "03",
          icon: Users,
          title: "Community-funded",
          desc: "Domain, hosting, and ongoing development are sustained through voluntary contributions with zero ads.",
        },
      ];

  const cleanSponsorFeatures: string[] = (t.sponsor?.features || []).map((item: string) =>
    item.replace(/\s*💙\s*$/, "").trim()
  );

  return (
    <section id="pricing" className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Swiss Editorial Header */}
        <div className="pb-10 mb-12 border-b border-border grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              {isEs ? "01 // ACCESO Y SOSTENIBILIDAD" : "01 // ACCESS & SUSTAINABILITY"}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-foreground tracking-tight leading-[1.04]">
              {t.title}
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-muted-foreground font-accent leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Light Optical Atelier Bento Pricing Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-20">
          {/* Free Tier — Precision Highlighted Light Studio Plate */}
          <div className="lg:col-span-7 rounded-3xl bg-card border-2 border-primary p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_24px_60px_-28px_rgba(30,64,255,0.22)]">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-primary" aria-hidden="true" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary font-bold">
                  {isEs ? "PLAN 01 // ESTUDIO LOCAL" : "TIER 01 // LOCAL STUDIO"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-700/20 font-mono text-[10px] font-semibold text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                  <span>{isEs ? "ACTIVO · SIN CUENTA" : "ACTIVE · NO SIGNUP"}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-7 border-b border-border">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-2">
                    {t.free.title}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground font-accent max-w-md leading-relaxed">
                    {t.free.desc}
                  </p>
                </div>
                <div className="flex items-baseline gap-1.5 shrink-0 px-4 py-2.5 rounded-2xl bg-background border border-border">
                  <span className="text-4xl sm:text-5xl font-extrabold font-heading text-foreground tabular-nums tracking-tight">
                    {t.free.price}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{t.free.period}</span>
                </div>
              </div>

              <div className="py-7">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5">
                  {t.free.whatsIncluded}
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {t.free.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground font-accent">
                      <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" aria-hidden="true" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href={`/${lang}/?tool=background-remover`}
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold font-accent transition-all shadow-[0_12px_28px_-10px_rgba(30,64,255,0.55)]"
            >
              <span>{t.free.btn}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Sponsor Tier — Clean Architectural Surface */}
          <div className="lg:col-span-5 rounded-3xl bg-card border border-border p-7 sm:p-10 flex flex-col justify-between shadow-soft">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                  {isEs ? "PLAN 02 // COMUNIDAD" : "TIER 02 // COMMUNITY"}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-500/30 text-amber-800 flex items-center justify-center">
                  <Coffee className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>

              <div className="pb-7 border-b border-border">
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-2">
                  {t.sponsor.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground font-accent leading-relaxed">
                  {t.sponsor.desc}
                </p>
              </div>

              <div className="py-7">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5">
                  {t.sponsor.whatsIncluded}
                </div>
                <ul className="space-y-3.5">
                  {cleanSponsorFeatures.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground font-accent">
                      <span className="w-5 h-5 rounded-full bg-background border border-border text-foreground flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" aria-hidden="true" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href="https://www.buymeacoffee.com/fabianhermar"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 bg-[#ffdd00] hover:bg-[#f2d000] text-[#111318] border border-[#111318]/10 rounded-full font-semibold font-accent transition-colors"
            >
              <img
                src="/logos/bmc.svg"
                alt="Buy me a coffee"
                className="w-5 h-5"
              />
              <span>{t.sponsor.btn}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Philosophy & 3 Pillars (Swiss Hairline Grid) */}
        <div className="mb-16">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-10">
            <div className="lg:col-span-6">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                {isEs ? "02 // POR QUÉ ES GRATIS" : "02 // WHY IT'S FREE"}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground tracking-tight leading-[1.08]">
                {isEs
                  ? "Una herramienta construida por frustración, para todos."
                  : "A tool built out of frustration, for everyone."}
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-base text-muted-foreground font-accent leading-relaxed">
                {isEs
                  ? "ClearCut Studio nació porque las utilidades básicas de edición y compresión de imágenes terminan casi siempre detrás de muros de pago o marcas de agua. Trasladar los motores a WebAssembly en tu navegador elimina costes por archivo y respeta tu privacidad."
                  : "ClearCut Studio was born because everyday image editing and optimization tools constantly hide behind paywalls and watermarks. Moving processing to in-browser WebAssembly removes per-file server costs and keeps your assets private."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card overflow-hidden grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.code} className="p-7 sm:p-8 flex flex-col justify-between gap-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{pillar.code}</span>
                    <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-accent leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitment Callout Strip */}
        <div className="rounded-2xl bg-card border border-border px-6 py-5 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-1" aria-hidden="true" />
            <p className="text-sm sm:text-base font-accent text-foreground leading-relaxed">
              {isEs
                ? "Si alguna vez ClearCut Studio te ahorró tiempo o dinero, considera invitarnos un café. No es obligatorio, pero nos ayuda a mantener el proyecto vivo."
                : "If ClearCut Studio ever saved you time or money, consider buying us a coffee. Never required, always appreciated."}
            </p>
          </div>
          <a
            href="https://www.buymeacoffee.com/fabianhermar"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs font-semibold text-primary hover:underline whitespace-nowrap shrink-0"
          >
            buymeacoffee.com/fabianhermar →
          </a>
        </div>

        {/* Third-party API / BYOK Architectural Disclaimer */}
        <ApiDisclaimer lang={lang} />
      </div>
    </section>
  );
}
