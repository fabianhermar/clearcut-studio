"use client";

import { SAMPLE_IMAGES } from "@/lib/constants";

interface HeroSectionProps {
  onStartApp: () => void;
  onStartOptimizer: () => void;
  onSelectDemo: (src: string) => void;
  comparisonPos: number;
  setComparisonPos: (pos: number) => void;
  dict?: any;
}

export function HeroSection({ onStartApp, onStartOptimizer, onSelectDemo, comparisonPos, setComparisonPos, dict }: HeroSectionProps) {
  const t = dict?.hero || {
    aiBadge: "Powered by Artificial Intelligence",
    title: "Edit images ",
    titleGradient: "with AI",
    description: "Remove backgrounds with AI and optimize your image file sizes. Edit, crop, and export in multiple formats — all for free in your browser.",
    bgRemoverBtn: "Remove background",
    optimizerBtn: "Optimize image",
    optimizerDesc: "WebP · AVIF · JPEG",
    demoBtn: "Demo",
    badges: {
      quality: "High quality",
      formats: "PNG, WebP, AVIF",
      editor: "Full editor",
      private: "100% private"
    },
    comparison: {
      original: "Original",
      processed: "Background removed",
      badgeProcessed: "Background removed",
      badgeOriginal: "Original quality",
      disclaimer: "* ClearCut Studio uses AI to remove backgrounds and may make mistakes."
    }
  };

  const c = dict?.common || { poweredByAi: "Powered by AI" };

  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-150 bg-linear-to-b from-primary/5 via-accent/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium font-accent mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              {t.aiBadge}
            </p>

            <h1 className="text-5xl md:text-7xl tracking-tighter font-heading text-balance font-bold mb-6">
              {t.title}
              <span className="gradient-text">{t.titleGradient}</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-accent">
              {t.description}
            </p>

            {/* Tool cards */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <button
                onClick={onStartApp}
                className="group font-accent flex items-center gap-3 px-6 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    <path d="M4.93 4.93l14.14 14.14"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold">{t.bgRemoverBtn}</div>
                  <div className="text-xs text-white/70">{c.poweredByAi}</div>
                </div>
              </button>

              <button
                onClick={onStartOptimizer}
                className="group font-accent flex items-center gap-3 px-6 py-4 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-xl transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold">{t.optimizerBtn}</div>
                  <div className="text-xs text-muted-foreground">{t.optimizerDesc}</div>
                </div>
              </button>

              <button
                onClick={() => onSelectDemo(SAMPLE_IMAGES[0].src)}
                className="flex font-accent items-center justify-center gap-2 px-6 py-4 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-xl transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {t.demoBtn}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 sm:gap-y-2">
              {[
                { label: t.badges.quality, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: t.badges.formats, icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: t.badges.editor, icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
                { label: t.badges.private, icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              ].map(({ label, icon }) => (
                <div key={label} className="inline-flex items-center gap-2.5 text-sm text-muted-foreground font-accent leading-none justify-self-center lg:justify-self-start">
                  <span className="flex h-5 w-5 items-center justify-center shrink-0 text-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d={icon} />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap leading-none">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Comparison */}
          <div className="relative">
            <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-medium">
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1.5 bg-foreground/80 backdrop-blur text-card text-xs font-medium rounded-full font-accent">{t.comparison.original}</span>
              </div>
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-full font-accent">{t.comparison.processed}</span>
              </div>

              <div
                className="relative aspect-4/3 cursor-ew-resize select-none"
                onMouseMove={(e) => {
                  if (e.buttons !== 1) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  setComparisonPos(Math.max(10, Math.min(90, x)));
                }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  setComparisonPos(Math.max(10, Math.min(90, x)));
                }}
              >
                {/* Original */}
                <div className="absolute inset-0">
                  <img src="/demos/demo-original.png" alt="Original" className="w-full h-full object-cover" />
                </div>

                {/* Processed */}
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - comparisonPos}% 0 0)` }}>
                  <div className="w-full h-full checkerboard">
                    <img src="/demos/demo-processed.avif" alt="Sin fondo" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Slider */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${comparisonPos}%` }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border border-border">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M8 3L4 7l4 4M16 3l4 4-4 4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-3 font-accent -right-3 px-4 py-2 bg-success/10 border border-success/20 text-success text-sm font-medium rounded-full animate-float hidden lg:flex items-center gap-2 shadow-soft">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t.comparison.badgeProcessed}
            </div>

            <div className="absolute -bottom-3 -left-3 font-accent px-4 py-2 bg-card border border-border text-foreground text-sm font-medium rounded-full animate-float-delayed hidden lg:flex items-center gap-2 shadow-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
              </svg>
              {t.comparison.badgeOriginal}
            </div>

            {/* Sample thumbnails */}
            <div className="absolute -bottom-6 right-6 hidden lg:flex gap-2 z-20">
              {SAMPLE_IMAGES.slice(1, 4).map((img) => (
                <button
                  key={img.id}
                  onClick={() => onSelectDemo(img.src)}
                  className="w-14 h-14 rounded-xl overflow-hidden border-2 border-card hover:border-primary transition-all hover:scale-105 shadow-medium bg-card"
                >
                  <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/80 text-center lg:text-left mt-2 lg:mt-3 font-accent lg:absolute lg:-bottom-8 lg:left-0">
            {t.comparison.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
