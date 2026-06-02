interface OptimizerInfoSectionProps {
  dict?: any;
}

export function OptimizerInfoSection({ dict }: OptimizerInfoSectionProps) {
  const t = dict?.optimizerInfo || {
    title: "Advanced image",
    titleGradient: "optimization",
    subtitle: "ClearCut Optimizer",
    desc: "We use the same WebAssembly (WASM) technology that powers top professional tools to encode your images directly in the browser. Drastically reduce your file sizes to improve your website's performance without compromising visual quality.",
    badges: {
      avif: "AVIF Encoder (libavif)",
      webp: "WebP Encoder (libwebp)",
      jpeg: "MozJPEG (High quality)"
    },
    features: [
      {
        title: "Fully Local",
        desc: "Compression is performed on your own device using a dedicated Web Worker. Zero cloud uploads, total privacy, and instant results."
      },
      {
        title: "Visual Control",
        desc: "Compare the original result with the optimized one using our real-time slider. See exactly how compression affects the finest details."
      },
      {
        title: "Versatile Export",
        desc: "Convert heavy PNGs to next-generation modern formats like AVIF and WebP to achieve maximum bandwidth savings."
      }
    ]
  };

  return (
    <section className="py-24 px-4 border-y border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left - Visual/Demo */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-3xl -z-10 blur-xl" />
            <div className="bg-background rounded-3xl border border-border overflow-hidden shadow-2xl relative">
              
              {/* Fake Window Header */}
              <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-card">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="mx-auto text-xs font-accent text-muted-foreground font-medium">optimizer-demo.wasm</div>
              </div>
              
              {/* Window Content */}
              <div className="p-6">
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden mb-6 border border-border">
                  <div className="absolute inset-0 checkerboard" />
                  <img src="/demos/cat.png" alt="Optimization demo" className="absolute inset-0 w-full h-full object-cover" />
                  
                  {/* Overlay Stats */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-4 font-accent">
                    <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border shadow-lg flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Original (PNG)</div>
                      <div className="font-bold text-foreground">2.4 MB</div>
                    </div>
                    <div className="bg-primary/90 backdrop-blur-md px-4 py-2 rounded-lg border border-primary-hover shadow-lg flex-1 text-white">
                      <div className="text-xs text-white/80 mb-1">Optimizada (AVIF)</div>
                      <div className="font-bold">245 KB <span className="text-xs font-normal ml-1">(-90%)</span></div>
                    </div>
                  </div>
                </div>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-2 justify-center font-accent">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground border border-border flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {t.badges.avif}
                  </span>
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground border border-border flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {t.badges.webp}
                  </span>
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground border border-border flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {t.badges.jpeg}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-bold font-heading tracking-widest uppercase mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              {t.subtitle}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
              {t.title} <br className="hidden lg:block" />
              <span className="gradient-text">{t.titleGradient}</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 font-accent leading-relaxed">
              {t.desc}
            </p>

            <ul className="space-y-6 text-left font-accent">
              {t.features.map((feature: any, idx: number) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-foreground font-bold mb-1">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
