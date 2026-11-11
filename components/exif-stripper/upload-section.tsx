"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { StudioDropzone } from "@/components/studio/studio-dropzone";

interface UploadSectionProps {
  onUpload: (file: File) => void;
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
        slug="exif-stripper"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Inspect and strip GPS, camera, and timestamp metadata"
            : "Inspecciona y elimina metadatos GPS, cámara y fecha de captura"
        }
      />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <StudioDropzone
          slug="exif-stripper"
          lang={lang}
          badgeText={isEn ? "EXIF & GPS Privacy Sanitizer" : "Limpiador de privacidad EXIF y GPS"}
          title={
            isEn
              ? "Remove hidden metadata from your photos"
              : "Elimina los metadatos ocultos de tus fotografías"
          }
          description={
            isEn
              ? "Photos often embed exact GPS coordinates, device serials, and capture dates. Inspect what your file reveals and export a clean copy locally."
              : "Las fotos suelen incluir coordenadas GPS exactas, modelo de dispositivo y fecha de captura. Inspecciona qué revela tu archivo y descarga una copia limpia localmente."
          }
          formats={["JPEG", "PNG", "WebP", "TIFF"]}
          maxSizeLabel={isEn ? "up to 25 MB" : "hasta 25 MB"}
          onFileSelect={onUpload}
          samples={["/demos/car.jpg", "/demos/coffee.jpg", "/demos/shoes.jpg"]}
          onSampleSelect={onSampleSelect}
        />
      </main>
    </div>
  );
}
