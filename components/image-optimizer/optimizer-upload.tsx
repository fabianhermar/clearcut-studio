"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { StudioDropzone } from "@/components/studio/studio-dropzone";

interface OptimizerUploadProps {
  onFileSelect: (file: File) => void;
  onSampleSelect?: (src: string) => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export function OptimizerUpload({
  onFileSelect,
  onSampleSelect,
  onClose,
  dict,
  lang = "es",
}: OptimizerUploadProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="image-optimizer"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "WASM compression & format conversion (libavif, libwebp, MozJPEG)"
            : "Compresión WASM y conversión de formatos (libavif, libwebp, MozJPEG)"
        }
      />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <StudioDropzone
          slug="image-optimizer"
          lang={lang}
          badgeText={isEn ? "WASM Web Worker Codecs" : "Códecs WASM en Web Worker"}
          title={
            isEn
              ? "Optimize and convert images for the web"
              : "Optimiza y convierte tus imágenes para la web"
          }
          description={
            isEn
              ? "Compress images into AVIF, WebP, MozJPEG, or lossless PNG with real-time visual comparison and byte-level savings inspection."
              : "Comprime imágenes a AVIF, WebP, MozJPEG o PNG sin pérdida con comparador visual en tiempo real y control exacto de peso."
          }
          formats={["JPG", "PNG", "WebP", "AVIF", "GIF", "BMP"]}
          maxSizeLabel={isEn ? "Processed locally in RAM" : "Procesado localmente en RAM"}
          onFileSelect={onFileSelect}
          samples={["/demos/cat.jpg", "/demos/shoes.jpg", "/demos/coffee.jpg", "/demos/car.jpg"]}
          onSampleSelect={onSampleSelect}
        />
      </main>
    </div>
  );
}
