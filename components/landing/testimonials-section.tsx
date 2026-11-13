import { ShoppingBag, Code2, ShieldAlert, Layers } from "lucide-react";

interface TestimonialsSectionProps {
  dict?: any;
  lang?: string;
}

export function TestimonialsSection({ dict, lang }: TestimonialsSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const useCases = isEn
    ? [
        {
          index: "CASE 01",
          icon: ShoppingBag,
          tag: "E-commerce & Catalogs",
          title: "Product photography preparation",
          description:
            "Isolate product shots onto transparent or pure white backdrops, adjust aspect ratios without cropping, and export in WebP for fast store pages.",
          metrics: ["Background Remover + Brush", "Ratio 1:1 / 4:5 / 9:16", "Transparent PNG & WebP"],
        },
        {
          index: "CASE 02",
          icon: Code2,
          tag: "Frontend & Core Web Vitals",
          title: "Asset optimization for production",
          description:
            "Compress hero images into AVIF or WebP using in-browser WASM encoders and generate complete multi-platform favicon bundles with manifest files.",
          metrics: ["libavif & libwebp Worker", "ICO + Apple Touch + Manifest", "Real-time byte delta"],
        },
        {
          index: "CASE 03",
          icon: ShieldAlert,
          tag: "Privacy & Publishing",
          title: "Metadata sanitization before sharing",
          description:
            "Inspect embedded EXIF tags—including exact GPS coordinates, camera serials, and timestamps—and strip them locally before uploading to public platforms.",
          metrics: ["EXIF & GPS tag reader", "Clean Canvas re-encoding", "Zero server transfers"],
        },
        {
          index: "CASE 04",
          icon: Layers,
          tag: "Product Design & Social",
          title: "Brand palettes & social media layouts",
          description:
            "Extract dominant HEX/RGB palettes with ready-to-use CSS gradients from reference images, and adapt visuals to vertical and square formats.",
          metrics: ["Dominant HEX/RGB + CSS", "Blur-fill backdrops", "One-click CSS copy"],
        },
      ]
    : [
        {
          index: "CASO 01",
          icon: ShoppingBag,
          tag: "E-commerce y Catálogos",
          title: "Preparación de fotografía de producto",
          description:
            "Aísla productos sobre fondo transparente o color sólido, adapta proporciones sin recortar y exporta en WebP para tiendas online rápidas.",
          metrics: ["Recorte IA + Pincel manual", "Formato 1:1, 4:5 o 9:16", "Exportación PNG y WebP"],
        },
        {
          index: "CASO 02",
          icon: Code2,
          tag: "Desarrollo Web y Rendimiento",
          title: "Optimización de recursos para producción",
          description:
            "Comprime imágenes en AVIF o WebP mediante codificadores WASM locales y genera paquetes completos de favicons con manifiesto web e integración HTML.",
          metrics: ["libavif y libwebp Worker", "ICO + Apple Touch + Manifest", "Ahorro en tiempo real"],
        },
        {
          index: "CASO 03",
          icon: ShieldAlert,
          tag: "Privacidad y Publicación",
          title: "Limpieza de metadatos antes de compartir",
          description:
            "Inspecciona etiquetas EXIF ocultas —incluyendo coordenadas GPS exactas, modelo de cámara y fecha— y elimínalas localmente antes de publicar.",
          metrics: ["Lectura EXIF y GPS local", "Re-codificación limpia Canvas", "0 bytes enviados"],
        },
        {
          index: "CASO 04",
          icon: Layers,
          tag: "Diseño de Producto y Redes",
          title: "Paletas CSS y formatos para redes sociales",
          description:
            "Extrae colores dominantes en formato HEX/RGB con código CSS listo para producción y adapta composiciones a formatos verticales o cuadrados.",
          metrics: ["HEX/RGB + Degradado CSS", "Relleno desenfocado", "Copia instantánea CSS"],
        },
      ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background border-b border-border studio-grid">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 items-end mb-12 sm:mb-14">
          <div className="lg:col-span-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">
              {isEn ? "05 // PRODUCTION WORKFLOWS" : "05 // FLUJOS DE PRODUCCIÓN"}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground font-heading tracking-tight leading-[1.06]">
              {isEn
                ? "Built for design, engineering, and publishing teams"
                : "Diseñado para flujos reales de diseño, desarrollo y publicación"}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {isEn
                ? "Combine ClearCut Studio utilities to prepare visual assets from raw capture to production deployment without leaving your browser."
                : "Combina las utilidades de ClearCut Studio para preparar activos visuales desde la captura original hasta su publicación en producción sin salir del navegador."}
            </p>
          </div>
        </div>

        {/* Swiss Architectural Index Grid (hairline cell partitions) */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden grid md:grid-cols-2">
          {useCases.map((item, idx) => {
            const Icon = item.icon;
            const borderClasses = [
              "border-b border-border md:border-r",
              "border-b border-border",
              "border-b md:border-b-0 border-border md:border-r",
              "",
            ][idx];

            return (
              <div
                key={item.index}
                className={`p-7 sm:p-10 flex flex-col justify-between gap-7 hover:bg-muted/30 transition-colors ${borderClasses}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-primary">
                        {item.index}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
                      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        {item.tag}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-foreground font-heading tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-accent">
                    {item.description}
                  </p>
                </div>

                {/* Technical output chips */}
                <div className="flex flex-wrap gap-2 pt-5 border-t border-border/80">
                  {item.metrics.map((metric, mIdx) => (
                    <span
                      key={mIdx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-background border border-border font-mono text-[11px] text-foreground"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
