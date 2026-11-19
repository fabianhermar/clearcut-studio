export type ToolSlug =
  | "background-remover"
  | "image-optimizer"
  | "exif-stripper"
  | "favicon-generator"
  | "gradient-extractor"
  | "aspect-ratio-fitter"
  | "batch-watermarker"
  | "mockup-generator"
  | "ai-image-streamer"
  | "magic-eraser"
  | "crop-upscale"
  | "svg-optimizer"
  | "heic-converter"
  | "raw-converter"
  | "responsive-images"
  | "color-palette";

export type ToolCategory = "core" | "privacy-compression" | "design-social";

export interface StudioTool {
  slug: ToolSlug;
  aliases: string[];
  category: ToolCategory;
  featured?: boolean;
  comingSoon?: boolean;
  isCloudAi?: boolean;
  executionBadge: {
    es: string;
    en: string;
  };
  formats: string[];
  es: {
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    benefit: string;
    cta: string;
  };
  en: {
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    benefit: string;
    cta: string;
  };
}

/**
 * Herramientas activas y disponibles públicamente (7 herramientas listas para producción).
 */
export const STUDIO_TOOLS: StudioTool[] = [
  {
    slug: "background-remover",
    aliases: ["remover", "bg-remover"],
    category: "core",
    featured: true,
    executionBadge: {
      es: "IA en navegador (ONNX/WASM)",
      en: "In-browser AI (ONNX/WASM)",
    },
    formats: ["PNG", "WebP", "AVIF", "JPG"],
    es: {
      name: "Eliminador de Fondos con IA",
      shortName: "Eliminar Fondo",
      tagline: "Recorte automático + editor de precisión",
      description:
        "Aísla sujetos complejos, cabello y productos automáticamente mediante redes neuronales ejecutadas en tu navegador, con pincel de retoque y ajustes integrados.",
      benefit: "Exportación transparente en PNG, WebP o AVIF sin subir archivos a servidores.",
      cta: "Abrir eliminador de fondos",
    },
    en: {
      name: "AI Background Remover",
      shortName: "Background Remover",
      tagline: "Automated cutout + precision brush editor",
      description:
        "Isolate complex subjects, hair, and products automatically using neural networks running in your browser, complete with refine brush and color adjustments.",
      benefit: "Transparent PNG, WebP, or AVIF exports without uploading files to servers.",
      cta: "Open background remover",
    },
  },
  {
    slug: "image-optimizer",
    aliases: ["optimizer"],
    category: "core",
    featured: true,
    executionBadge: {
      es: "Web Worker WASM local",
      en: "Local WASM Web Worker",
    },
    formats: ["WebP", "AVIF", "JPEG", "PNG"],
    es: {
      name: "Optimizador y Conversor WASM",
      shortName: "Optimizar Imagen",
      tagline: "libavif · libwebp · MozJPEG",
      description:
        "Comprime y convierte imágenes a formatos de próxima generación con comparación visual interactiva en tiempo real y cálculo exacto de ahorro en bytes.",
      benefit: "Reduce el peso de tus activos web manteniendo nitidez visual.",
      cta: "Abrir optimizador",
    },
    en: {
      name: "WASM Image Optimizer & Converter",
      shortName: "Image Optimizer",
      tagline: "libavif · libwebp · MozJPEG",
      description:
        "Compress and convert images into next-gen formats with interactive real-time visual comparison and exact byte-level savings metrics.",
      benefit: "Drastically reduce web asset payload while preserving visual fidelity.",
      cta: "Open image optimizer",
    },
  },
  {
    slug: "ai-image-streamer",
    aliases: ["ai-generator", "image-streamer", "ai-studio"],
    category: "core",
    featured: true,
    isCloudAi: true,
    executionBadge: {
      es: "BYOK · Streaming IA + Drive",
      en: "BYOK · Streaming AI + Drive",
    },
    formats: ["Lotes 2–8×", "Video", "Audio", "ZIP / Drive"],
    es: {
      name: "Generador IA Streaming",
      shortName: "Generador IA Streaming",
      tagline: "Imágenes por lotes, video, audio, edición y Google Drive",
      description:
        "Crea lotes de hasta 8 imágenes en streaming, genera videos y audio con tus propias API keys (Gemini, ChatGPT, Grok, Flux, Fal.ai y más), redimensiona, edita y descarga en ZIP o guarda en Google Drive.",
      benefit: "BYOK con control total: descarga 1 a 1, por lotes ZIP o sincroniza con tu Google Drive.",
      cta: "Abrir Generador IA",
    },
    en: {
      name: "AI Streaming Studio",
      shortName: "AI Streaming Studio",
      tagline: "Batch images, video, audio, editing & Google Drive",
      description:
        "Stream batches of up to 8 images in real time, generate AI video & audio using your own API keys (Gemini, ChatGPT, Grok, Flux, Fal.ai & more), resize, edit, and export via ZIP or Google Drive.",
      benefit: "Full BYOK control: download individually, in batch ZIPs, or save directly to Google Drive.",
      cta: "Open AI Studio",
    },
  },
  {
    slug: "exif-stripper",
    aliases: ["exif"],
    category: "privacy-compression",
    executionBadge: {
      es: "100% local · Canvas API",
      en: "100% local · Canvas API",
    },
    formats: ["JPEG", "PNG", "WebP"],
    es: {
      name: "Limpiador de Metadatos EXIF",
      shortName: "Limpiar EXIF",
      tagline: "Inspección y borrado de GPS y cámara",
      description:
        "Detecta coordenadas GPS ocultas, serie de cámara, lente y fecha de captura, y genera una copia limpia de píxeles puros antes de compartir tus fotos.",
      benefit: "Verifica qué metadatos contiene tu foto y elimínalos al instante.",
      cta: "Inspeccionar y limpiar EXIF",
    },
    en: {
      name: "EXIF Metadata Stripper",
      shortName: "EXIF Stripper",
      tagline: "Inspect & remove GPS and camera data",
      description:
        "Detect hidden GPS coordinates, camera model, lens, and capture timestamps, then generate a clean pixel-only copy before sharing your photos.",
      benefit: "Verify what metadata your photo exposes and strip it instantly.",
      cta: "Inspect & strip EXIF",
    },
  },
  {
    slug: "aspect-ratio-fitter",
    aliases: ["aspect-ratio"],
    category: "design-social",
    executionBadge: {
      es: "100% local · Canvas 2D",
      en: "100% local · Canvas 2D",
    },
    formats: ["JPG", "PNG"],
    es: {
      name: "Ajuste de Relación de Aspecto",
      shortName: "Aspect Ratio Fitter",
      tagline: "1:1 · 4:5 · 9:16 · 16:9 sin recortar",
      description:
        "Adapta cualquier imagen a formatos de redes sociales o vídeo sin mutilar la composición original, usando relleno desenfocado, color sólido o transparencia.",
      benefit: "Conserva el encuadre íntegro con control de escala y fondo.",
      cta: "Ajustar proporciones",
    },
    en: {
      name: "Aspect Ratio & Canvas Fitter",
      shortName: "Aspect Ratio Fitter",
      tagline: "1:1 · 4:5 · 9:16 · 16:9 without cropping",
      description:
        "Adapt any image to social media or video ratios without cutting off your original composition, using smart blur fill, solid colors, or transparency.",
      benefit: "Preserve the full frame with precise scale and backdrop controls.",
      cta: "Fit aspect ratio",
    },
  },
  {
    slug: "gradient-extractor",
    aliases: ["gradient"],
    category: "design-social",
    executionBadge: {
      es: "100% local · Cuantización RGB",
      en: "100% local · RGB Quantization",
    },
    formats: ["HEX", "RGB", "CSS"],
    es: {
      name: "Extractor de Degradados CSS",
      shortName: "Gradient Extractor",
      tagline: "Paleta dominante + generador CSS",
      description:
        "Extrae los colores dominantes de cualquier fotografía o diseño, copia valores en formato HEX o RGB y genera código CSS de degradados lineales o radiales.",
      benefit: "Copia cada color en HEX/RGB o el bloque CSS listo para producción.",
      cta: "Extraer degradado",
    },
    en: {
      name: "CSS Gradient Extractor",
      shortName: "Gradient Extractor",
      tagline: "Dominant palette + CSS generator",
      description:
        "Extract dominant colors from any photograph or design, copy individual HEX or RGB values, and generate linear or radial CSS gradient code.",
      benefit: "One-click copy for HEX/RGB swatches or production-ready CSS.",
      cta: "Extract gradient",
    },
  },
  {
    slug: "favicon-generator",
    aliases: ["favicon"],
    category: "design-social",
    executionBadge: {
      es: "100% local · Empaquetado ZIP",
      en: "100% local · ZIP Bundler",
    },
    formats: ["ICO", "PNG", "WebManifest", "ZIP"],
    es: {
      name: "Generador de Favicons y PWA",
      shortName: "Favicon Generator",
      tagline: "16×16 · 32×32 · Apple Touch · Android",
      description:
        "Previsualiza tu icono en pestañas de navegador (claro/oscuro), Google, iOS y Android, y descarga el paquete ZIP con todos los tamaños y el código HTML.",
      benefit: "Incluye soporte para icono en modo oscuro y archivo site.webmanifest.",
      cta: "Generar favicons",
    },
    en: {
      name: "Favicon & PWA Asset Generator",
      shortName: "Favicon Generator",
      tagline: "16×16 · 32×32 · Apple Touch · Android",
      description:
        "Preview your icon across light/dark browser tabs, Google search, iOS, and Android, then download a complete ZIP bundle with HTML head tags.",
      benefit: "Includes dark-mode icon support and a ready-to-use site.webmanifest.",
      cta: "Generate favicons",
    },
  },
];

/**
 * Herramientas en fase de pruebas e integración futura ("Pronto" / "Próximamente").
 */
export const UPCOMING_TOOLS: StudioTool[] = [
  {
    slug: "mockup-generator",
    aliases: ["mockup", "framed"],
    category: "design-social",
    comingSoon: true,
    executionBadge: {
      es: "En pruebas · Próximamente",
      en: "In testing · Coming soon",
    },
    formats: ["PNG", "JPG", "WebP"],
    es: {
      name: "Framed — Generador de Mockups",
      shortName: "Framed",
      tagline: "Marcos macOS, navegador, iPhone, iPad y 3D",
      description:
        "Generador de mockups y marcos de dispositivos para transformar capturas de pantalla en presentaciones profesionales.",
      benefit: "En fase de pruebas para su próxima incorporación al estudio.",
      cta: "Próximamente",
    },
    en: {
      name: "Framed — Mockup & Device Framer",
      shortName: "Framed",
      tagline: "macOS, browser, iPhone, iPad & 3D frames",
      description:
        "Mockup and device framer to turn raw screenshots into polished product presentations.",
      benefit: "Currently in testing for upcoming studio release.",
      cta: "Coming soon",
    },
  },
  {
    slug: "batch-watermarker",
    aliases: ["watermark"],
    category: "privacy-compression",
    comingSoon: true,
    executionBadge: {
      es: "En pruebas · Próximamente",
      en: "In testing · Coming soon",
    },
    formats: ["JPEG", "PNG", "WebP", "ZIP"],
    es: {
      name: "Marca de Agua por Lotes",
      shortName: "Batch Watermarker",
      tagline: "Texto o logotipo PNG masivamente",
      description:
        "Aplica firmas tipográficas o logotipos PNG a múltiples fotografías simultáneamente con exportación en paquete ZIP.",
      benefit: "En fase de pruebas para su próxima incorporación al estudio.",
      cta: "Próximamente",
    },
    en: {
      name: "Batch Watermarker",
      shortName: "Batch Watermarker",
      tagline: "Apply watermarks in bulk",
      description:
        "Apply custom text or PNG logos across multiple photographs simultaneously with single-click ZIP export.",
      benefit: "Currently in testing for upcoming studio release.",
      cta: "Coming soon",
    },
  },
  {
    slug: "magic-eraser",
    aliases: ["eraser"],
    category: "core",
    comingSoon: true,
    executionBadge: {
      es: "Próximamente",
      en: "Coming soon",
    },
    formats: ["PNG", "JPG", "WebP"],
    es: {
      name: "Borrador Mágico",
      shortName: "Borrador Mágico",
      tagline: "Eliminación inteligente de objetos",
      description:
        "Borra objetos, personas o elementos no deseados de tus fotografías reconstruyendo el fondo con naturalidad.",
      benefit: "Retoque limpio sin necesidad de software complejo.",
      cta: "Próximamente",
    },
    en: {
      name: "Magic Eraser",
      shortName: "Magic Eraser",
      tagline: "Smart object removal",
      description:
        "Erase unwanted objects, people, or distractions from your photographs with natural background reconstruction.",
      benefit: "Clean retouching without complex desktop software.",
      cta: "Coming soon",
    },
  },
  {
    slug: "crop-upscale",
    aliases: ["crop", "upscale"],
    category: "core",
    comingSoon: true,
    executionBadge: {
      es: "Próximamente",
      en: "Coming soon",
    },
    formats: ["PNG", "JPG", "WebP", "AVIF"],
    es: {
      name: "Recortar y Escalar",
      shortName: "Recortar & Escalar",
      tagline: "Recorte preciso y mejora de resolución",
      description:
        "Recorta tus imágenes con proporciones exactas y escala su resolución mejorando la definición de bordes y detalles.",
      benefit: "Preparación rápida de imágenes de alta densidad.",
      cta: "Próximamente",
    },
    en: {
      name: "Crop & Upscale",
      shortName: "Crop & Upscale",
      tagline: "Precision crop & resolution enhancer",
      description:
        "Crop images to exact ratios and upscale their resolution while enhancing edge clarity and fine details.",
      benefit: "Fast preparation for high-density displays.",
      cta: "Coming soon",
    },
  },
  {
    slug: "raw-converter",
    aliases: ["raw"],
    category: "privacy-compression",
    comingSoon: true,
    executionBadge: {
      es: "Próximamente",
      en: "Coming soon",
    },
    formats: ["CR2", "NEF", "ARW", "DNG"],
    es: {
      name: "RAW Converter",
      shortName: "RAW Converter",
      tagline: "Visor y conversor de fotos RAW",
      description:
        "Inspecciona y convierte archivos RAW de cámaras digitales directamente a formatos estándar listos para edición o web.",
      benefit: "Revelado rápido en el navegador.",
      cta: "Próximamente",
    },
    en: {
      name: "RAW Converter",
      shortName: "RAW Converter",
      tagline: "RAW photo viewer & converter",
      description:
        "Inspect and convert digital camera RAW files directly into standard formats ready for web or editing.",
      benefit: "Fast in-browser RAW development.",
      cta: "Coming soon",
    },
  },
  {
    slug: "heic-converter",
    aliases: ["heic"],
    category: "privacy-compression",
    comingSoon: true,
    executionBadge: {
      es: "Próximamente",
      en: "Coming soon",
    },
    formats: ["HEIC", "JPG", "PNG", "WebP"],
    es: {
      name: "Conversor HEIC por Lotes",
      shortName: "Conversor HEIC",
      tagline: "Convierte HEIC masivamente",
      description:
        "Transforma fotografías en formato HEIC/HEIF de dispositivos móviles a JPG, PNG o WebP por lotes.",
      benefit: "Compatibilidad universal instantánea.",
      cta: "Próximamente",
    },
    en: {
      name: "Bulk HEIC Converter",
      shortName: "Bulk HEIC Converter",
      tagline: "Batch convert HEIC files",
      description:
        "Convert mobile HEIC/HEIF photographs into universally compatible JPG, PNG, or WebP files in bulk.",
      benefit: "Instant universal compatibility.",
      cta: "Coming soon",
    },
  },
  {
    slug: "responsive-images",
    aliases: ["srcset", "responsive"],
    category: "design-social",
    comingSoon: true,
    executionBadge: {
      es: "Próximamente",
      en: "Coming soon",
    },
    formats: ["HTML srcset", "WebP", "AVIF", "ZIP"],
    es: {
      name: "Responsive Images",
      shortName: "Responsive Images",
      tagline: "Generador masivo de srcset",
      description:
        "Genera automáticamente múltiples puntos de ruptura (breakpoints) y el código HTML `srcset` óptimo para rendimiento web.",
      benefit: "Automatiza imágenes responsivas para frontend.",
      cta: "Próximamente",
    },
    en: {
      name: "Responsive Images",
      shortName: "Responsive Images",
      tagline: "Batch srcset generator",
      description:
        "Automatically generate multiple responsive breakpoints and ready-to-use HTML `srcset` markup for web performance.",
      benefit: "Automates responsive images for frontend teams.",
      cta: "Coming soon",
    },
  },
  {
    slug: "svg-optimizer",
    aliases: ["svg"],
    category: "privacy-compression",
    comingSoon: true,
    executionBadge: {
      es: "Próximamente",
      en: "Coming soon",
    },
    formats: ["SVG", "Código limpio"],
    es: {
      name: "Optimizador SVG",
      shortName: "Optimizar SVG",
      tagline: "Optimiza gráficos vectoriales",
      description:
        "Limpia nodos redundantes, metadatos de editores y atributos innecesarios de tus archivos vectoriales SVG.",
      benefit: "Vectores más ligeros y listos para incrustar en código.",
      cta: "Próximamente",
    },
    en: {
      name: "SVG Optimizer",
      shortName: "SVG Optimizer",
      tagline: "Optimize vector graphics",
      description:
        "Clean redundant nodes, editor metadata, and unnecessary attributes from your SVG vector files.",
      benefit: "Lighter vectors ready for inline code embedding.",
      cta: "Coming soon",
    },
  },
  {
    slug: "color-palette",
    aliases: ["palette"],
    category: "design-social",
    comingSoon: true,
    executionBadge: {
      es: "Próximamente",
      en: "Coming soon",
    },
    formats: ["HEX", "OKLCH", "JSON", "CSS"],
    es: {
      name: "Generador de Paletas",
      shortName: "Generador de Paletas",
      tagline: "Extrae paletas de colores",
      description:
        "Construye, armoniza y exporta sistemas de paletas cromáticas completas para interfaces y sistemas de diseño.",
      benefit: "Exportación directa a variables CSS y tokens.",
      cta: "Próximamente",
    },
    en: {
      name: "Color Palette Generator",
      shortName: "Color Palette Generator",
      tagline: "Extract color palettes",
      description:
        "Build, harmonize, and export complete color palette systems for user interfaces and design systems.",
      benefit: "Direct export to CSS variables and design tokens.",
      cta: "Coming soon",
    },
  },
];

export const ALL_STUDIO_TOOLS: StudioTool[] = [...STUDIO_TOOLS, ...UPCOMING_TOOLS];

const IMPLEMENTED_SLUGS: ToolSlug[] = [
  "ai-image-streamer",
  "background-remover",
  "image-optimizer",
  "exif-stripper",
  "favicon-generator",
  "gradient-extractor",
  "aspect-ratio-fitter",
  "batch-watermarker",
  "mockup-generator",
];

export function resolveToolSlug(param: string | null): ToolSlug | null {
  if (!param) return null;
  const normalized = param.trim().toLowerCase();
  for (const tool of ALL_STUDIO_TOOLS) {
    if (
      IMPLEMENTED_SLUGS.includes(tool.slug) &&
      (tool.slug === normalized || tool.aliases.includes(normalized))
    ) {
      return tool.slug;
    }
  }
  return null;
}

export function getToolBySlug(slug: ToolSlug): StudioTool {
  return ALL_STUDIO_TOOLS.find((t) => t.slug === slug) || STUDIO_TOOLS[0];
}
