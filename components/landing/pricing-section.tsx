import { CheckCircle2 } from "lucide-react";
import React from "react";
import Link from "next/link";

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
      </div>
    </section>
  );
}
