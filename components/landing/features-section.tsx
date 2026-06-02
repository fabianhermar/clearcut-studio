import { FEATURES } from "@/lib/constants";

interface FeaturesSectionProps {
  dict?: any;
}

export function FeaturesSection({ dict }: FeaturesSectionProps) {
  const isEn = dict?.header?.features === "Features"; // Simple check
  
  const getFeatures = () => {
    if (!isEn) return FEATURES;
    return [
      {
        icon: FEATURES[0].icon,
        title: "Ultra fast",
        description: "Remove backgrounds in seconds thanks to our optimized AI that processes locally in your browser.",
      },
      {
        icon: FEATURES[1].icon,
        title: "100% private",
        description: "Your images never leave your device. All processing happens locally.",
      },
      {
        icon: FEATURES[2].icon,
        title: "Image optimizer",
        description: "Reduce your image sizes by up to 90% in WebP, AVIF, or JPEG without losing visual quality.",
      },
      {
        icon: FEATURES[3].icon,
        title: "Multiple formats",
        description: "Export in PNG, WebP, AVIF, or JPG with optimized settings for each format.",
      },
      {
        icon: FEATURES[4].icon,
        title: "Advanced editing",
        description: "Fix details with brush tools, crop, and adjust colors before exporting.",
      },
      {
        icon: FEATURES[5].icon,
        title: "Image adjustments",
        description: "Modify brightness, contrast, saturation, and exposure for the perfect finish.",
      },
    ];
  };

  const currentFeatures = getFeatures();

  return (
    <section id="features" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider font-accent">
            {isEn ? "Features" : "Características"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4 font-heading">
            {isEn ? "Everything you need to edit images" : "Todo lo que necesitas para editar imágenes"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-accent">
            {isEn ? "Professional tools in a simple and accessible interface for everyone." : "Herramientas profesionales en una interfaz simple y accesible para todos."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFeatures.map((feature, i) => (
            <div
              key={i}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-medium"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-accent">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
