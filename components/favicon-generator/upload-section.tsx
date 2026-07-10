"use client";

import { useRef } from "react";
import { useFileDrop } from "@/hooks/use-file-drop";

interface UploadSectionProps {
  onUpload: (src: string) => void;
  onClose?: () => void;
  dict?: any;
}

export function UploadSection({ onUpload, onClose, dict }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  
  const handleFileSelectWrapper = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen valido.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpload(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const { isDragging, handleDrop, handleDragOver, handleDragLeave } = useFileDrop(handleFileSelectWrapper);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              title="Volver al inicio"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                 <path d="M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12" />
                 <path d="M4 22h16" />
                 <path d="M12 8v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Favicon Generator</h1>
              <p className="text-xs text-muted-foreground font-accent">Icon Creator</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-accent">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 border border-success/20 text-success rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            100% en tu dispositivo
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8 animate-slide-up">
          {/* Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium font-accent mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 4.2c.2.15.34.37.34.61v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8c0-.24.14-.46.34-.61L12 2.69zM12 1L4 7v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7l-8-6z" />
              </svg>
              Creación automática
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Crea íconos perfectos para tu <span className="gradient-text">web</span>
            </h2>
            <p className="text-muted-foreground font-accent max-w-md mx-auto">
              Sube tu logotipo y generaremos automáticamente todos los favicons e iconos necesarios para navegadores y móviles.
            </p>
          </div>

          {/* Drop zone */}
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer transition-all group ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "hover:border-primary/50 hover:bg-primary/3"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelectWrapper(file);
              }}
            />

            {/* Icon */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors ${
              isDragging ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-primary/10 text-primary group-hover:bg-primary/15"
            }`}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-foreground font-heading mb-2">
              {isDragging ? "Suelta la imagen aquí" : "Arrastra tu imagen aquí"}
            </h3>
            <p className="text-muted-foreground font-accent text-sm mb-4">
              o haz clic para explorar archivos
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground font-accent">
              {["JPEG", "PNG", "WebP", "AVIF"].map((ext) => (
                <span key={ext} className="px-2.5 py-1 bg-muted rounded-full border border-border">
                  {ext}
                </span>
              ))}
              <span className="text-muted-foreground px-2">hasta 10MB</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
