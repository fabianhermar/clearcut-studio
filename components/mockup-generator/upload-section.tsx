"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { StudioDropzone } from "@/components/studio/studio-dropzone";
import { Layers, Sparkles, Palette, Download } from "lucide-react";

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (src: string) => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export function UploadSection({
  onFileSelect,
  onSampleSelect,
  onClose,
  dict,
  lang = "es",
}: UploadSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const capabilities = isEn
    ? [
        {
          icon: Layers,
          title: "Device Frames",
          desc: "iPhone, iPad, Android, macOS, and Browser window chrome.",
        },
        {
          icon: Sparkles,
          title: "3D Perspective & Shadows",
          desc: "Adjust X/Y tilt, ambient spread shadows, and padding.",
        },
        {
          icon: Palette,
          title: "Curated Backdrops",
          desc: "30+ mesh gradients, solid colors, and studio backgrounds.",
        },
        {
          icon: Download,
          title: "Up to 3× Export",
          desc: "High-DPI PNG, JPG, or direct clipboard copy.",
        },
      ]
    : [
        {
          icon: Layers,
          title: "Marcos de dispositivos",
          desc: "iPhone, iPad, Android, ventana macOS y navegador web.",
        },
        {
          icon: Sparkles,
          title: "Perspectiva 3D y sombras",
          desc: "Ajusta inclinación X/Y, sombras ambientales y márgenes.",
        },
        {
          icon: Palette,
          title: "Fondos curados",
          desc: "Más de 30 degradados mesh, colores sólidos y fondos de estudio.",
        },
        {
          icon: Download,
          title: "Exportación hasta 3×",
          desc: "Descarga en PNG, JPG de alta densidad o copia al portapapeles.",
        },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="mockup-generator"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Device frames, 3D tilt, studio backdrops & 3× export"
            : "Marcos de dispositivos, rotación 3D, fondos de estudio y exportación 3×"
        }
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-10">
        <StudioDropzone
          slug="mockup-generator"
          lang={lang}
          badgeText={isEn ? "Framed Mockup Studio" : "Estudio de Mockups Framed"}
          title={
            isEn
              ? "Frame screenshots in polished device mockups"
              : "Enmarca capturas en mockups de dispositivos profesionales"
          }
          description={
            isEn
              ? "Drop any UI screenshot or photograph, choose a device frame (iPhone, macOS, Browser, Android), customize 3D tilt and backdrops, and export at up to 3× resolution."
              : "Sube cualquier captura de interfaz o imagen, elige un marco de dispositivo (iPhone, macOS, Navegador, Android), personaliza fondos y exporta hasta en 3×."
          }
          formats={["PNG", "JPG", "WebP", "AVIF"]}
          maxSizeLabel={isEn ? "1x / 2x / 3x Retina export" : "Exportación Retina 1x / 2x / 3x"}
          onFileSelect={onFileSelect}
          samples={["/demos/car.jpg", "/demos/coffee.jpg", "/demos/shoes.jpg"]}
          onSampleSelect={onSampleSelect}
        />

        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-card border border-border flex flex-col gap-1.5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold font-heading text-foreground">
                  {cap.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
