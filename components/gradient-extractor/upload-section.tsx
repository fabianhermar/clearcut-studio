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
        slug="gradient-extractor"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Dominant HEX/RGB color extraction & CSS gradient builder"
            : "Extracción de colores dominantes HEX/RGB y generador CSS"
        }
      />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <StudioDropzone
          slug="gradient-extractor"
          lang={lang}
          badgeText={isEn ? "Palette & CSS Generator" : "Paleta y Generador CSS"}
          title={
            isEn
              ? "Extract dominant colors and CSS gradients"
              : "Extrae colores dominantes y degradados CSS"
          }
          description={
            isEn
              ? "Load any image to sample its primary color palette, copy individual HEX or RGB values, and generate linear or radial CSS gradients."
              : "Carga cualquier imagen para obtener su paleta cromática principal, copiar códigos HEX o RGB y generar degradados CSS lineales o radiales."
          }
          formats={["JPG", "PNG", "WebP", "AVIF"]}
          maxSizeLabel={isEn ? "up to 20 MB" : "hasta 20 MB"}
          onFileSelect={handleFileSelect}
          samples={["/demos/coffee.jpg", "/demos/shoes.jpg", "/demos/car.jpg", "/demos/cat.jpg"]}
          onSampleSelect={onUpload}
        />
      </main>
    </div>
  );
}
