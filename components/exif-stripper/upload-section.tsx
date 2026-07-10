"use client";

import { useRef } from "react";
import { useFileDrop } from "@/hooks/use-file-drop";

interface UploadSectionProps {
  onUpload: (file: File) => void;
  onClose?: () => void;
  dict?: any;
}

export function UploadSection({ onUpload, onClose, dict }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFileSelectWrapper = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    onUpload(file);
  };

  const { isDragging, handleDrop, handleDragOver, handleDragLeave } =
    useFileDrop(handleFileSelectWrapper);

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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">EXIF Stripper</h1>
              <p className="text-xs text-muted-foreground font-accent">Privacy Cleaner</p>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium font-accent mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Tu privacidad importa
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Elimina los metadatos{" "}
              <span className="gradient-text">ocultos</span> de tus fotos
            </h2>
            <p className="text-muted-foreground font-accent max-w-lg mx-auto">
              Tus fotos contienen datos invisibles: tu ubicación GPS, el modelo de tu cámara, la fecha exacta y más. Súbela y los eliminaremos al instante.
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
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors ${
                isDragging
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-primary/10 text-primary group-hover:bg-primary/15"
              }`}
            >
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
              {["JPEG", "PNG", "WebP", "TIFF"].map((ext) => (
                <span key={ext} className="px-2.5 py-1 bg-muted rounded-full border border-border">
                  {ext}
                </span>
              ))}
              <span className="text-muted-foreground px-2">hasta 20MB</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "📍", label: "GPS", desc: "Ubicación exacta" },
              { icon: "📷", label: "Cámara", desc: "Modelo y ajustes" },
              { icon: "📅", label: "Fecha", desc: "Cuándo se tomó" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 border border-border text-center"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-bold text-foreground font-heading">{item.label}</span>
                <span className="text-[11px] text-muted-foreground font-accent leading-tight">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
