"use client";

import { useCallback, useRef } from "react";
import { Zap } from "lucide-react";

interface OptimizerUploadProps {
  onFileSelect: (file: File) => void;
  onClose?: () => void;
}

export function OptimizerUpload({ onFileSelect, onClose }: OptimizerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido.");
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
      if (dropRef.current) dropRef.current.classList.remove("border-primary", "bg-primary/5");
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropRef.current) {
      dropRef.current.classList.add("border-primary", "bg-primary/5");
    }
  };

  const handleDragLeave = () => {
    if (dropRef.current) {
      dropRef.current.classList.remove("border-primary", "bg-primary/5");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            title="Volver al inicio"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Optimizador de Imágenes</h1>
              <p className="text-xs text-muted-foreground font-accent">Comprime sin perder calidad</p>
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            WebP · AVIF · JPEG · PNG
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8 animate-slide-up">
          {/* Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium font-accent mb-2">
              <Zap className="w-4 h-4" />
              Optimización inteligente
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Optimiza tus <span className="gradient-text">imágenes</span>
            </h2>
            <p className="text-muted-foreground font-accent max-w-md mx-auto">
              Reduce el peso hasta un 90% sin perder calidad visual. Elige el formato perfecto para tu proyecto.
            </p>
          </div>

          {/* Drop zone */}
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className="relative border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/3 group"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/15 transition-colors">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-foreground font-heading mb-2">
              Arrastra tu imagen aquí
            </h3>
            <p className="text-muted-foreground font-accent text-sm mb-4">
              o haz clic para explorar archivos
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground font-accent">
              {["JPEG", "PNG", "WebP", "AVIF", "GIF", "BMP", "TIFF"].map((ext) => (
                <span key={ext} className="px-2.5 py-1 bg-muted rounded-full border border-border">
                  {ext}
                </span>
              ))}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
                label: "Hasta 90% más ligera",
                color: "#3b82f6",
              },
              {
                icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                label: "Sin subir a servidores",
                color: "#10b981",
              },
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                label: "Vista comparativa",
                color: "#8b5cf6",
              },
            ].map(({ icon, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border text-center"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                  >
                    <path d={icon} />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground font-accent leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
