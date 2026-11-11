import { ShoppingBag, Code2, ShieldAlert, Layers, CheckCircle2 } from "lucide-react";

interface TestimonialsSectionProps {
  dict?: any;
  lang?: string;
}

export function TestimonialsSection({ dict, lang }: TestimonialsSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const useCases = isEn
    ? [
        {
          icon: ShoppingBag,
          tag: "E-commerce & Catalogs",
          title: "Product photography preparation",
          description:
            "Isolate product shots onto transparent or pure white backdrops, adjust aspect ratios without cropping, and export in WebP for fast store pages.",
          metrics: [
            "Background Remover + Brush refine",
            "Aspect Ratio 1:1 / 4:5 / 9:16",
            "Transparent PNG & WebP export",
          ],
        },
        {
          icon: Code2,
          tag: "Frontend & Core Web Vitals",
          title: "Asset optimization for production",
          description:
            "Compress hero images into AVIF or WebP using in-browser WASM encoders and generate complete multi-platform favicon bundles with manifest files.",
          metrics: [
            "libavif & libwebp in Web Worker",
            "Favicon ICO + Apple Touch + Manifest",
            "Real-time byte delta inspection",
          ],
        },
        {
          icon: ShieldAlert,
          tag: "Privacy & Publishing",
          title: "Metadata sanitization before sharing",
          description:
            "Inspect embedded EXIF tags—including exact GPS coordinates, camera serials, and timestamps—and strip them locally before uploading to public platforms.",
          metrics: [
            "EXIF & GPS tag reader (exifr)",
            "Clean Canvas re-encoding",
            "Zero server file transfers",
          ],
        },
        {
          icon: Layers,
          tag: "Product Design & Social",
          title: "Brand palettes & social media layouts",
          description:
            "Extract dominant HEX/RGB palettes with ready-to-use CSS gradients from reference images, and adapt visuals to vertical and square formats.",
          metrics: [
            "Dominant HEX/RGB + CSS Gradient",
            "Blur-fill & custom canvas backdrops",
            "Instant one-click CSS copy",
          ],
        },
      ]
    : [
        {
          icon: ShoppingBag,
          tag: "E-commerce y Catálogos",
          title: "Preparación de fotografía de producto",
          description:
            "Aísla productos sobre fondo transparente o color sólido, adapta proporciones sin recortar y exporta en WebP para tiendas online rápidas.",
          metrics: [
            "Recorte IA + Pincel de retoque",
            "Formato cuadrado 1:1, 4:5 o 9:16",
            "Exportación directa en PNG y WebP",
          ],
        },
        {
          icon: Code2,
          tag: "Desarrollo Web y Rendimiento",
          title: "Optimización de recursos para producción",
          description:
            "Comprime imágenes en AVIF o WebP mediante codificadores WASM locales y genera paquetes completos de favicons con manifiesto web e integración HTML.",
          metrics: [
            "libavif y libwebp en Web Worker",
            "Favicon ICO + Apple Touch + Manifest",
            "Inspección de ahorro en tiempo real",
          ],
        },
        {
          icon: ShieldAlert,
          tag: "Privacidad y Publicación",
          title: "Limpieza de metadatos antes de compartir",
          description:
            "Inspecciona etiquetas EXIF ocultas —incluyendo coordenadas GPS exactas, modelo de cámara y fecha— y elimínalas localmente antes de publicar.",
          metrics: [
            "Lectura de etiquetas EXIF y GPS",
            "Re-codificación limpia en Canvas",
            "0 bytes enviados a servidores",
          ],
        },
        {
          icon: Layers,
          tag: "Diseño de Producto y Redes",
          title: "Paletas CSS y formatos para redes sociales",
          description:
            "Extrae colores dominantes en formato HEX/RGB con código CSS listo para producción y adapta composiciones a formatos verticales o cuadrados.",
          metrics: [
            "Extracción HEX/RGB + Degradado CSS",
            "Relleno desenfocado o color sólido",
            "Copiado instantáneo de código CSS",
          ],
        },
      ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            {isEn ? "Practical Workflows" : "Casos de uso reales"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4 font-heading tracking-tight">
            {isEn
              ? "Built for real design, development, and publishing workflows"
              : "Diseñado para flujos reales de diseño, desarrollo y publicación"}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {isEn
              ? "Combine ClearCut Studio utilities to prepare visual assets from raw capture to production deployment without leaving your browser."
              : "Combina las utilidades de ClearCut Studio para preparar activos visuales desde la captura original hasta su publicación en producción sin salir del navegador."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-2xs hover:border-primary/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-muted-foreground px-2.5 py-1 rounded-md bg-muted border border-border">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground font-heading mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <ul className="pt-4 border-t border-border space-y-2">
                  {item.metrics.map((metric, mIdx) => (
                    <li key={mIdx} className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
