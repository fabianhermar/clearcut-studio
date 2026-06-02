interface CtaSectionProps {
  onStartApp: () => void;
  onStartOptimizer: () => void;
  dict?: any;
}

export function CtaSection({ onStartApp, onStartOptimizer, dict }: CtaSectionProps) {
  const t = dict?.cta || {
    title: "Ready to enhance your images?",
    desc: "Join thousands of creators who are already saving time and improving their workflow with ClearCut Studio. Completely free, fast, and secure.",
    bgRemoverBtn: "Remove Background",
    optimizerBtn: "Optimize Image"
  };

  const c = dict?.common || { poweredByAi: "Powered by AI", optimizerDesc: "WebP · AVIF · JPEG" };

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-linear-to-b from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6 tracking-tight">
          {t.title}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-accent">
          {t.desc}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onStartApp}
            className="group font-accent flex items-center gap-3 px-6 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 text-left w-full sm:w-auto justify-center"
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
            className="group font-accent flex items-center gap-3 px-6 py-4 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-xl transition-all shadow-lg shadow-black/5 text-left w-full sm:w-auto justify-center"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold">{t.optimizerBtn}</div>
              <div className="text-xs text-muted-foreground">{dict?.hero?.optimizerDesc || "WebP · AVIF · JPEG"}</div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

export function AboutSection({ dict }: { dict?: any }) {
  const isEn = dict?.header?.features === "Features";

  return (
    <section className="py-24 px-4 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider font-accent">
              {isEn ? "Why clearcut?" : "¿Por qué clearcut?"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6 font-heading leading-tight">
              {isEn 
                ? "The privacy-first image editing suite" 
                : "La suite de edición de imágenes que prioriza tu privacidad"
              }
            </h2>
            <p className="text-muted-foreground text-lg mb-6 font-accent leading-relaxed">
              {isEn 
                ? "Most free image editors force you to upload your personal photos to their servers. We took a different approach."
                : "La mayoría de los editores de imágenes gratuitos te obligan a subir tus fotos personales a sus servidores. Nosotros tomamos un enfoque diferente."
              }
            </p>
            <p className="text-muted-foreground text-lg mb-8 font-accent leading-relaxed">
              {isEn 
                ? "By leveraging modern web technologies like WebAssembly, ClearCut runs completely inside your browser. No uploads, no waiting, no privacy concerns."
                : "Aprovechando tecnologías web modernas como WebAssembly, ClearCut se ejecuta completamente dentro de tu navegador. Sin subidas, sin esperas, sin preocupaciones de privacidad."
              }
            </p>
            <div className=" gap-4 items-center hidden">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`/demos/shoes.jpg`} alt="User" className="w-full h-full object-cover opacity-50 grayscale" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-accent text-foreground font-semibold">
                {isEn ? "Trusted by thousands of creators" : "Confiado por miles de creadores"}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative rounded-3xl overflow-hidden bg-[#0a0f1c] border border-border shadow-2xl group">
              <img 
                src="/img/secure-by-default.png" 
                alt="ClearCut Privacy and Security" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-90 group-hover:scale-105" 
              />

              <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/30 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-foreground">
                      {isEn ? "Total Privacy Guaranteed" : "Privacidad Total Garantizada"}
                    </h4>
                    <p className="text-xs text-muted-foreground font-accent">
                      {isEn ? "0 Bytes uploaded to cloud" : "0 Bytes subidos a la nube"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
