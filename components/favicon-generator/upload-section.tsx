"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { StudioDropzone } from "@/components/studio/studio-dropzone";

interface UploadSectionProps {
  onUpload: (src: string) => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export function UploadSection({
  onUpload,
  onClose,
  dict,
  lang = "es",
}: UploadSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpload(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="favicon-generator"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Multi-platform web icons, ICO, Apple Touch, Android & manifest"
            : "Iconos web multiplataforma, ICO, Apple Touch, Android y manifest"
        }
      />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <StudioDropzone
          slug="favicon-generator"
          lang={lang}
          badgeText={isEn ? "Multi-Size Favicon Suite" : "Suite completa de Favicons"}
          title={
            isEn
              ? "Generate favicons and app icons for every platform"
              : "Genera favicons e iconos de aplicación para cada plataforma"
          }
          description={
            isEn
              ? "Upload your logo or symbol to preview how it appears on browser tabs, Google search results, iOS, and Android, and export a complete ZIP bundle with HTML tags."
              : "Sube tu logotipo o símbolo para previsualizar cómo luce en pestañas del navegador, Google, iOS y Android, y descarga el paquete ZIP con el código HTML."
          }
          formats={["PNG", "SVG", "WebP", "JPG"]}
          maxSizeLabel={isEn ? "Square 512×512px recommended" : "Recomendado 512×512 px cuadrado"}
          onFileSelect={handleFileSelect}
          samples={["/logos/ClearCut-logo.avif", "/demos/coffee.jpg"]}
          onSampleSelect={onUpload}
        />
      </main>
    </div>
  );
}
