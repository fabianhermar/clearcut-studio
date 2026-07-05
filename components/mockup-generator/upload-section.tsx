"use client";

import { useRef } from "react";
import { useFileDrop } from "@/hooks/use-file-drop";
import { Monitor } from "lucide-react";

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (src: string) => void;
  onClose?: () => void;
}

export function UploadSection({ onFileSelect, onSampleSelect, onClose }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const { isDragging, handleDrop, handleDragOver, handleDragLeave } = useFileDrop(onFileSelect);

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
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Monitor size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Framed</h1>
              <p className="text-xs text-muted-foreground font-accent">Generador de Mockups</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8 animate-slide-up">
          {/* Title */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Embellece tus <span className="gradient-text">capturas</span>
            </h2>
            <p className="text-muted-foreground font-accent max-w-md mx-auto">
              Sube tu imagen y envuélvela en un marco elegante con sombras y gradientes increíbles en segundos.
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
                if (file) onFileSelect(file);
              }}
            />

            {/* Icon */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors ${
              isDragging ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-primary/10 text-primary group-hover:bg-primary/15"
            }`}>
              <Monitor size={36} strokeWidth={1.5} />
            </div>

            <h3 className="text-lg font-semibold text-foreground font-heading mb-2">
              {isDragging ? "Suelta la imagen aquí" : "Arrastra tu captura aquí"}
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
