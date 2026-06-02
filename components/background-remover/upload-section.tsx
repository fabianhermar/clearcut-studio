"use client";

import { useRef, useCallback } from "react";
import { useFileDrop } from "@/hooks/use-file-drop";

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
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Borrador de Fondos</h1>
              <p className="text-xs text-muted-foreground font-accent">Tecnología con IA</p>
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            JPG · PNG · WebP · AVIF
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Recorte perfecto
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Elimina el fondo de tus <span className="gradient-text">imágenes</span>
            </h2>
            <p className="text-muted-foreground font-accent max-w-md mx-auto">
              Sube tu imagen y nuestra IA eliminará el fondo automáticamente en segundos, manteniendo la máxima calidad.
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
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
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

          {/* Sample images */}
          <div className="text-center pt-2">
            <p className="text-muted-foreground text-sm mb-4 font-accent">O prueba con una imagen de ejemplo:</p>
            <div className="flex justify-center gap-4">
              {["/demos/shoes.jpg", "/demos/coffee.jpg", "/demos/car.jpg"].map((sample, i) => (
                <button
                  key={sample}
                  onClick={() => onSampleSelect(sample)}
                  className="relative group overflow-hidden rounded-xl border border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg w-16 h-16 sm:w-20 sm:h-20"
                >
                  <img
                    src={sample}
                    alt={`Ejemplo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-white text-xs font-medium font-accent">Probar</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            {[
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                label: "Súper Rápido",
                color: "#10b981",
              },
              {
                icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
                label: "Alta Calidad",
                color: "#3b82f6",
              },
              {
                icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                label: "100% Privado",
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
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
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
