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
        slug="aspect-ratio-fitter"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Fit images to 1:1, 4:5, 9:16, or 16:9 without cropping"
            : "Adapta imágenes a proporciones 1:1, 4:5, 9:16 o 16:9 sin recortar"
        }
      />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <StudioDropzone
          slug="aspect-ratio-fitter"
          lang={lang}
          badgeText={isEn ? "Non-Destructive Aspect Fitter" : "Ajuste de proporción sin recorte"}
          title={
            isEn
              ? "Fit your image to any aspect ratio"
              : "Adapta tus imágenes a cualquier formato y proporción"
          }
          description={
            isEn
              ? "Reframe photos for Instagram, Stories, Reels, YouTube, or e-commerce catalogs using ambient blur, solid color, or transparent backdrops."
              : "Adapta fotografías para Instagram, Stories, Reels, YouTube o catálogos usando relleno desenfocado, color sólido o transparencia."
          }
          formats={["JPG", "PNG", "WebP", "AVIF"]}
          maxSizeLabel={isEn ? "up to 25 MB" : "hasta 25 MB"}
          onFileSelect={handleFileSelect}
          samples={["/demos/shoes.jpg", "/demos/coffee.jpg", "/demos/car.jpg"]}
          onSampleSelect={onUpload}
        />
      </main>
    </div>
  );
}
