"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { StudioDropzone } from "@/components/studio/studio-dropzone";

interface UploadSectionProps {
  onUpload: (files: File[]) => void;
  onSampleSelect?: (src: string) => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export function UploadSection({
  onUpload,
  onSampleSelect,
  onClose,
  dict,
  lang = "es",
}: UploadSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="batch-watermarker"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Apply text or PNG logo watermarks to multiple photos and export as ZIP"
            : "Aplica marcas de agua de texto o logo PNG a múltiples fotos y exporta en ZIP"
        }
      />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <StudioDropzone
          slug="batch-watermarker"
          lang={lang}
          badgeText={isEn ? "Batch Watermark Engine" : "Motor de marca de agua por lotes"}
          title={
            isEn
              ? "Protect your images with batch watermarks"
              : "Protege tus fotografías con marca de agua por lotes"
          }
          description={
            isEn
              ? "Select one or multiple images at once, configure your custom text or PNG logo across a 9-point anchor grid, and download the entire batch as a ZIP archive."
              : "Selecciona una o varias imágenes a la vez, configura tu texto o logotipo PNG en una cuadrícula de 9 puntos y descarga todo el lote en un archivo ZIP."
          }
          formats={["JPG", "PNG", "WebP"]}
          maxSizeLabel={isEn ? "Multiple files supported" : "Soporta múltiples archivos simultáneos"}
          multiple
          onFileSelect={(file) => onUpload([file])}
          onFilesSelect={onUpload}
          samples={["/demos/shoes.jpg", "/demos/coffee.jpg", "/demos/car.jpg"]}
          onSampleSelect={onSampleSelect}
        />
      </main>
    </div>
  );
}
