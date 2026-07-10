"use client";

import { useRef } from "react";
import { useFileDrop } from "@/hooks/use-file-drop";

interface UploadSectionProps {
  onUpload: (files: File[]) => void;
  onClose?: () => void;
  dict?: any;
}

export function UploadSection({ onUpload, onClose }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      alert("Por favor selecciona al menos un archivo de imagen válido.");
      return;
    }
    onUpload(images);
  };

  const handleSingleFile = (file: File) => handleFiles([file]);

  const { isDragging, handleDragOver, handleDragLeave } = useFileDrop(handleSingleFile);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

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
                <path d="M3 21l4-4m0 0L18 6a2 2 0 0 0-3-3L4 17m3 0L3 21" />
                <path d="M14 4l6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Batch Watermarker</h1>
              <p className="text-xs text-muted-foreground font-accent">Marca de Agua Masiva</p>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <path d="M7 12h10M12 7v10" />
              </svg>
              Procesamiento por lotes
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Marca de agua en{" "}
              <span className="gradient-text">todas tus fotos</span>
            </h2>
            <p className="text-muted-foreground font-accent max-w-lg mx-auto">
              Sube una o varias imágenes y aplícales tu texto o logo como marca de agua. Se procesan instantáneamente y se descargan como ZIP.
            </p>
          </div>

          {/* Drop zone */}
          <div
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
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) handleFiles(files);
              }}
            />
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
              {isDragging ? "Suelta las imágenes aquí" : "Arrastra tus imágenes aquí"}
            </h3>
            <p className="text-muted-foreground font-accent text-sm mb-4">
              o haz clic para explorar — puedes seleccionar varias a la vez
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground font-accent">
              {["JPEG", "PNG", "WebP"].map((ext) => (
                <span key={ext} className="px-2.5 py-1 bg-muted rounded-full border border-border">{ext}</span>
              ))}
              <span className="text-muted-foreground px-2">múltiples archivos</span>
            </div>
          </div>

          {/* Feature chips */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "✍️", label: "Texto", desc: "Escribe tu marca" },
              { icon: "🖼️", label: "Logo", desc: "Sube tu PNG" },
              { icon: "📦", label: "ZIP", desc: "Descarga todas" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 border border-border text-center">
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
