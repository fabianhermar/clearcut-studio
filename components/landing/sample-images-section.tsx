import { SAMPLE_IMAGES } from "@/lib/constants";

interface SampleImagesSectionProps {
  onSelectDemo: (src: string) => void;
  dict?: any;
}

export function SampleImagesSection({ onSelectDemo, dict }: SampleImagesSectionProps) {
  const isEn = dict?.header?.features === "Features";

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider font-accent">
            {isEn ? "Gallery" : "Galería"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4 font-heading">
            {isEn ? "Try it with these examples" : "Pruébalo con estos ejemplos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-accent">
            {isEn 
              ? "Select any image to see the background removal in action."
              : "Selecciona cualquier imagen para ver la eliminación de fondo en acción."
            }
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {SAMPLE_IMAGES.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-medium transition-all cursor-pointer"
              onClick={() => onSelectDemo(img.src)}
            >
              <img
                src={img.src}
                alt={img.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1 font-accent">
                  {img.category}
                </p>
                <p className="text-white font-bold font-heading">{img.name}</p>
              </div>

              {/* Hover action overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary/90 text-white px-4 py-2 rounded-full font-medium font-accent text-sm shadow-lg backdrop-blur flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    <path d="M4.93 4.93l14.14 14.14"/>
                  </svg>
                  {isEn ? "Remove background" : "Eliminar fondo"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
