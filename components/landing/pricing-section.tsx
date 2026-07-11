import { CheckCircle2 } from "lucide-react";
import React from "react";
import Link from "next/link";
import { ApiDisclaimer } from "./api-disclaimer";

interface PricingSectionProps {
  dict?: any;
  lang?: string;
}

export function PricingSection({ dict, lang = "en" }: PricingSectionProps) {
  const t = dict?.pricing || {
    title: "Simple & Transparent Pricing",
    subtitle: "Choose the perfect plan that fits your needs",
    free: {
      title: "Free",
      desc: "Perfect for testing out our platform and processing unlimited images locally.",
      price: "$0",
      period: "/forever",
      whatsIncluded: "What's Included?",
      features: [
        "Unlimited background removals",
        "Unlimited image optimizations",
        "100% private local processing",
        "No watermarks on exports",
        "High quality results"
      ],
      btn: "Start for free"
    },
    sponsor: {
      title: "Support the Project",
      desc: "Help us keep ClearCut Studio free and fund new feature development.",
      whatsIncluded: "Why Support?",
      features: [
        "Cover domain and hosting costs",
        "Fund new feature development",
        "Keep the tool 100% free",
        "No ads or data tracking",
        "Our eternal gratitude 💙"
      ],
      btn: "Sponsor us"
    }
  };

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-foreground">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-accent">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Card (Blue Highlighted style) */}
          <div className="bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-3xl"></div>
            
            <h3 className="text-3xl font-bold font-heading text-foreground mb-2">
              {t.free.title}
            </h3>
            <p className="text-muted-foreground font-accent mb-6 min-h-[48px]">
              {t.free.desc}
            </p>
            
            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-bold font-heading text-foreground">{t.free.price}</span>
              <span className="text-muted-foreground font-accent mb-1">{t.free.period}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <hr className="flex-1 border-border" />
                <span className="text-sm font-semibold font-heading text-muted-foreground uppercase tracking-wider">{t.free.whatsIncluded}</span>
                <hr className="flex-1 border-border" />
              </div>
              
              <ul className="space-y-4 mb-8">
                {t.free.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-accent text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Link 
              href={`/${lang}/?tool=background-remover`}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold font-accent transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 text-center"
            >
              {t.free.btn}
            </Link>
          </div>

          {/* Sponsor Card (Dark style) */}
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col hover:border-border/80 transition-colors">
            <h3 className="text-3xl font-bold font-heading text-foreground mb-2">
              {t.sponsor.title}
            </h3>
            <p className="text-muted-foreground font-accent mb-6 min-h-[48px]">
              {t.sponsor.desc}
            </p>
            
            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-bold font-heading text-foreground">☕</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <hr className="flex-1 border-border" />
                <span className="text-sm font-semibold font-heading text-muted-foreground uppercase tracking-wider">{t.sponsor.whatsIncluded}</span>
                <hr className="flex-1 border-border" />
              </div>
              
              <ul className="space-y-4 mb-8">
                {t.sponsor.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="font-accent text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <a 
              href="https://www.buymeacoffee.com/fabianhermar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-semibold font-accent transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <img 
                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" 
                alt="Buy me a coffee" 
                className="w-6 h-6" 
              />
              {t.sponsor.btn}
            </a>
          </div>
        </div>

        {/* Why Free — Philosophy Section */}
        <div className="max-w-4xl mx-auto mt-24 px-4">
          {/* Divider with label */}
          <div className="flex items-center gap-4 mb-16">
            <hr className="flex-1 border-border" />
            <span className="text-xs font-bold font-heading uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              {lang === 'es' ? 'Por qué es gratis' : 'Why it\'s free'}
            </span>
            <hr className="flex-1 border-border" />
          </div>

          {/* Story */}
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-6 text-balance">
              {lang === 'es'
                ? 'Una herramienta construida por frustración, para todos.'
                : 'A tool built out of frustration, for everyone.'}
            </h3>
            <p className="text-lg text-muted-foreground font-accent leading-relaxed max-w-2xl mx-auto">
              {lang === 'es'
                ? 'ClearCut Studio nació porque las mejores herramientas de edición de imágenes terminan siempre detrás de un muro de pago. Cansados de eso, decidimos construir algo diferente: una suite que respeta tu privacidad, procesa todo en tu navegador y que no te pide ni un centavo para usarla.'
                : 'ClearCut Studio was born out of frustration. The best image editing tools always end up behind a paywall. Tired of that, we decided to build something different — a suite that respects your privacy, processes everything in your browser, and never asks you for a single cent to use it.'}
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: lang === 'es' ? 'Siempre será gratis' : 'Always free',
                desc: lang === 'es'
                  ? 'Nunca habrá un plan de pago obligatorio. Nuestro compromiso es claro: las herramientas principales de ClearCut Studio serán gratis para siempre.'
                  : 'There will never be a mandatory paid plan. Our commitment is clear: ClearCut Studio\'s core tools will be free forever.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                ),
                title: lang === 'es' ? 'Tu privacidad primero' : 'Your privacy first',
                desc: lang === 'es'
                  ? 'Todo el procesamiento ocurre en tu navegador. Tus imágenes jamás llegan a nuestros servidores. Lo que es tuyo, es tuyo.'
                  : 'All processing happens in your browser. Your images never reach our servers. What\'s yours stays yours.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: lang === 'es' ? 'Financiado por la comunidad' : 'Community-funded',
                desc: lang === 'es'
                  ? 'Los servidores, el dominio y el desarrollo continuo se sostienen gracias a las personas que eligen apoyar el proyecto voluntariamente. Sin presión.'
                  : 'Servers, the domain, and ongoing development are sustained by people who choose to support the project voluntarily. No pressure.'
              }
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-foreground mb-2">{title}</h4>
                  <p className="text-sm text-muted-foreground font-accent leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Commitment banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center relative overflow-hidden mb-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
            <p className="relative text-base md:text-lg font-accent text-foreground leading-relaxed max-w-2xl mx-auto">
              {lang === 'es'
                ? '💙 Si alguna vez ClearCut Studio te ahorró tiempo o dinero, considera invitarnos un café. No es obligatorio, pero nos ayuda a seguir construyendo para todos.'
                : '💙 If ClearCut Studio ever saved you time or money, consider buying us a coffee. It\'s not required, but it helps us keep building for everyone.'}
            </p>
          </div>

          {/* Third-party API Disclaimer */}
          <ApiDisclaimer lang={lang} />
        </div>
      </div>
    </section>
  );
}
