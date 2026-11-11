"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { StudioDropzone } from "@/components/studio/studio-dropzone";

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (src: string) => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
  errorMessage?: string | null;
}

export function UploadSection({
  onFileSelect,
  onSampleSelect,
  onClose,
  dict,
  lang = "es",
  errorMessage,
}: UploadSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="background-remover"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Automatic subject segmentation & brush refinement"
            : "Segmentación automática de sujetos y retoque con pincel"
        }
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {errorMessage && (
          <div
            role="alert"
            className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-sm font-medium"
          >
            {errorMessage}
          </div>
        )}

        <StudioDropzone
          slug="background-remover"
          lang={lang}
          badgeText={isEn ? "In-Browser AI Engine" : "Motor IA en navegador"}
          title={
            isEn
              ? "Remove image backgrounds with precision"
              : "Elimina el fondo de tus imágenes con precisión"
          }
          description={
            isEn
              ? "Drop your image to isolate subjects automatically using our local ONNX/WebAssembly model, then refine edges with the recovery brush."
              : "Sube tu imagen para aislar el sujeto automáticamente con nuestro modelo local ONNX/WebAssembly y retoca detalles con el pincel."
          }
          formats={["JPG", "PNG", "WebP", "AVIF"]}
          maxSizeLabel={isEn ? "up to 25 MB" : "hasta 25 MB"}
          privacyNote={
            isEn
              ? "First run caches the AI model (~40 MB) in your browser; your image never leaves your device."
              : "La primera ejecución guarda el modelo IA (~40 MB) en caché local; tu imagen nunca sale de tu dispositivo."
          }
          onFileSelect={onFileSelect}
          samples={["/demos/shoes.jpg", "/demos/coffee.jpg", "/demos/car.jpg", "/demos/cat.jpg"]}
          onSampleSelect={onSampleSelect}
        />
      </main>
    </div>
  );
}
