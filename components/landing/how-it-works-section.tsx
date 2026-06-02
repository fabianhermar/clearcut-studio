import { STEPS } from "@/lib/constants";

interface HowItWorksSectionProps {
  dict?: any;
}

export function HowItWorksSection({ dict }: HowItWorksSectionProps) {
  const isEn = dict?.header?.features === "Features";

  const t = dict?.howItWorks || {
    title: "How the system works",
    subtitle: "The magic happens on your device",
    desc: "ClearCut uses WebAssembly and browser-optimized AI models. This means all the heavy processing happens on your own computer, not on our servers.",
    steps: [
      { title: "1. Select or drag", desc: "Upload your image. We support the most popular formats (JPG, PNG, WebP)." },
      { title: "2. Local processing", desc: "The AI and WASM engine analyze and edit your image directly in the browser." },
      { title: "3. Tweak and download", desc: "Adjust the final details in the editor and download your final result." }
    ]
  };

  const getSteps = () => {
    if (!isEn) return STEPS;
    return [
      { number: "01", title: "Upload your image", description: "Drag and drop or select an image from your device." },
      { number: "02", title: "AI Processing", description: "Our artificial intelligence automatically removes the background." },
      { number: "03", title: "Edit if needed", description: "Use the tools to fix details, crop, and adjust." },
      { number: "04", title: "Download", description: "Export in your preferred format with maximum quality." },
    ];
  };

  const currentSteps = getSteps();

  return (
    <section id="how-it-works" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider font-accent">
            {isEn ? "How it works" : "Cómo funciona"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4 font-heading">
            {isEn ? "Simple, fast, and secure" : "Simple, rápido y seguro"}
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
          
          {currentSteps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="w-24 h-24 mx-auto bg-card border border-border rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-muted-foreground/30 font-heading group-hover:text-primary transition-colors">
                  {step.number}
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-3 font-heading">{step.title}</h3>
                <p className="text-muted-foreground font-accent">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
