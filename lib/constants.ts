import {
  MoveIcon,
  BrushIcon,
  EraserIcon,
  CropIcon,
  SunIcon,
  ApertureIcon,
  ContrastIcon,
  DropletIcon,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

// ---- Types ----

export type ToolId = "move" | "recover" | "erase" | "crop";
export type ExportFormat = "png" | "webp" | "avif" | "jpg";
export type AdjustmentKey = "brightness" | "contrast" | "saturation" | "exposure";

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
}

export interface ToolDefinition {
  id: ToolId;
  icon: React.ComponentType<IconProps>;
  label: string;
  desc: string;
}

export interface AdjustmentControl {
  key: AdjustmentKey;
  icon: React.ComponentType<IconProps>;
  label: string;
  min: number;
  max: number;
}

export interface ExportFormatDefinition {
  id: ExportFormat;
  label: string;
  desc: string;
  badge: string | null;
}

// ---- Constants ----

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 100,
};

export const TOOLS: ToolDefinition[] = [
  { id: "move", icon: MoveIcon, label: "Mover", desc: "Desplazar vista" },
  { id: "recover", icon: BrushIcon, label: "Recuperar", desc: "Restaurar fondo" },
  { id: "erase", icon: EraserIcon, label: "Borrar", desc: "Eliminar areas" },
  { id: "crop", icon: CropIcon, label: "Recortar", desc: "Cortar imagen" },
];

export const ADJUSTMENT_CONTROLS: AdjustmentControl[] = [
  { key: "brightness", icon: SunIcon, label: "Brillo", min: 0, max: 200 },
  { key: "exposure", icon: ApertureIcon, label: "Exposicion", min: 50, max: 150 },
  { key: "contrast", icon: ContrastIcon, label: "Contraste", min: 50, max: 150 },
  { key: "saturation", icon: DropletIcon, label: "Saturacion", min: 0, max: 200 },
];

export const EXPORT_FORMATS: ExportFormatDefinition[] = [
  { id: "png", label: "PNG", desc: "Transparencia perfecta", badge: "Recomendado" },
  { id: "webp", label: "WebP", desc: "30% mas ligero", badge: "Optimizado" },
  { id: "avif", label: "AVIF", desc: "Maxima compresion", badge: "Moderno" },
  { id: "jpg", label: "JPG", desc: "Fondo blanco", badge: null },
];

// ---- Landing page data ----

export const SAMPLE_IMAGES = [
  { id: 1, src: "/demos/demo-original.png", category: "Retrato", name: "Persona" },
  { id: 2, src: "/demos/shoes.jpg", category: "Producto", name: "Tenis" },
  { id: 3, src: "/demos/coffee.jpg", category: "Objeto", name: "Taza" },
  { id: 4, src: "/demos/car.jpg", category: "Vehiculo", name: "Auto" },
];

export const FEATURES = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Ultra rapido",
    description: "Elimina fondos en segundos gracias a nuestra IA optimizada que procesa localmente en tu navegador.",
  },
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "100% privado",
    description: "Tus imagenes nunca salen de tu dispositivo. Todo el procesamiento ocurre localmente.",
  },
  {
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    title: "Optimizador de imagenes",
    description: "Reduce el peso de tus imagenes hasta un 90% en WebP, AVIF o JPEG sin perder calidad visual.",
  },
  {
    icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    title: "Multiples formatos",
    description: "Exporta en PNG, WebP, AVIF o JPG con configuraciones optimizadas para cada formato.",
  },
  {
    icon: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
    title: "Edicion avanzada",
    description: "Corrige detalles con herramientas de pincel, recorta y ajusta colores antes de exportar.",
  },
  {
    icon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
    title: "Ajustes de imagen",
    description: "Modifica brillo, contraste, saturacion y exposicion para el acabado perfecto.",
  },
];

export const STEPS = [
  { number: "01", title: "Sube tu imagen", description: "Arrastra y suelta o selecciona una imagen desde tu dispositivo." },
  { number: "02", title: "Procesamiento IA", description: "Nuestra inteligencia artificial elimina el fondo automaticamente." },
  { number: "03", title: "Edita si necesitas", description: "Usa las herramientas para corregir detalles, recortar y ajustar." },
  { number: "04", title: "Descarga", description: "Exporta en el formato que prefieras con la maxima calidad." },
];

export const TESTIMONIALS = [
  {
    name: "Maria Garcia",
    role: "Diseñadora Gráfica",
    avatar: "MG",
    text: "Increible herramienta. La uso diariamente para mis proyectos de diseño. La calidad del recorte es impresionante.",
    rating: 5,
  },
  {
    name: "Carlos Rodriguez",
    role: "Fotografo Profesional",
    avatar: "CR",
    text: "Me ahorra horas de trabajo en Photoshop. Los bordes quedan perfectos incluso con cabello complicado.",
    rating: 5,
  },
  {
    name: "Ana Martinez",
    role: "E-commerce Manager",
    avatar: "AM",
    text: "Perfecta para fotos de productos. Exporto directamente en WebP optimizado para mi tienda online.",
    rating: 5,
  },
  {
    name: "Luis Sanchez",
    role: "Content Creator",
    avatar: "LS",
    text: "La mejor herramienta gratuita que he encontrado. La privacidad de que todo se procese local es un plus enorme.",
    rating: 5,
  },
];

export const ABOUT_TAGS = ["E-commerce", "Diseno grafico", "Marketing", "Redes sociales", "Fotografia", "Presentaciones"];
