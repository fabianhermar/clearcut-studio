"use client";

import { useState, useEffect } from "react";
import { StripResult, ExifData } from "./types";
import { stripExif, formatBytes, getCleanFileName } from "./stripper";
import { Download, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

interface EditorSectionProps {
  file: File;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
}

interface MetaItem {
  icon: string;
  label: string;
  value: string;
  highlight?: "red" | "blue";
}

function buildMetaItems(exif: ExifData): MetaItem[] {
  const items: MetaItem[] = [];

  if (exif.Make || exif.Model) {
    items.push({
      icon: "📷",
      label: "Cámara",
      value: [exif.Make, exif.Model].filter(Boolean).join(" "),
    });
  }
  if (exif.LensModel) {
    items.push({ icon: "🔭", label: "Lente", value: exif.LensModel });
  }
  if (exif.latitude != null && exif.longitude != null) {
    const lat = exif.latitude.toFixed(5);
    const lon = exif.longitude.toFixed(5);
    items.push({
      icon: "📍",
      label: "Ubicación GPS",
      value: `${lat}°, ${lon}°`,
      highlight: "red",
    });
  }
  if (exif.DateTimeOriginal || exif.CreateDate) {
    const d = exif.DateTimeOriginal || exif.CreateDate;
    const dateStr = d instanceof Date ? d.toLocaleString("es-MX") : String(d);
    items.push({ icon: "📅", label: "Fecha de captura", value: dateStr });
  }
  if (exif.FNumber && exif.ISO) {
    const f = `f/${exif.FNumber}`;
    const iso = `ISO ${exif.ISO}`;
    const ss = exif.ExposureTime
      ? exif.ExposureTime < 1
        ? `1/${Math.round(1 / exif.ExposureTime)}s`
        : `${exif.ExposureTime}s`
      : null;
    items.push({
      icon: "⚙️",
      label: "Exposición",
      value: [f, ss, iso].filter(Boolean).join(" · "),
    });
  }
  if (exif.FocalLength) {
    items.push({ icon: "🔍", label: "Focal", value: `${exif.FocalLength}mm` });
  }
  if (exif.Software) {
    items.push({ icon: "💾", label: "Software", value: exif.Software });
  }
  if (exif.Artist) {
    items.push({ icon: "🎨", label: "Artista", value: exif.Artist });
  }
  if (exif.Copyright) {
    items.push({ icon: "©️", label: "Copyright", value: exif.Copyright });
  }

  return items;
}

export function EditorSection({ file, onReset, onClose, dict }: EditorSectionProps) {
  const [result, setResult] = useState<StripResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    // Show original image preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);

    // Process EXIF stripping
    setIsProcessing(true);
    stripExif(file)
      .then((res) => {
        setResult(res);
        setIsProcessing(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo procesar la imagen.");
        setIsProcessing(false);
      });

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.cleanDataUrl;
    a.download = getCleanFileName(result.fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const metaItems = result?.exifData ? buildMetaItems(result.exifData) : [];
  const hasExif = metaItems.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-xl shrink-0">
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
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <RefreshCw size={14} />
          Limpiar otra imagen
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-[#f8fafc]">
        {isProcessing ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="font-accent text-sm">Analizando y limpiando metadatos…</p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
            <ShieldAlert size={48} />
            <p className="font-heading font-bold">{error}</p>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-foreground text-background text-sm font-bold rounded-xl hover:bg-foreground/90 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : result ? (
          /* Results */
          <div className="flex flex-col lg:flex-row gap-0 h-full">
            {/* Left: Image preview */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 min-h-[300px]">
              <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl ring-1 ring-border bg-card">
                {/* Checkered background for transparency */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <img
                  src={result.cleanDataUrl}
                  alt="Imagen limpia"
                  className="relative w-full h-auto object-contain max-h-[50vh]"
                />
              </div>

              {/* File info */}
              <div className="flex items-center gap-6 text-sm font-accent text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Original:</span>
                  <span className="font-medium text-foreground">{formatBytes(result.originalSize)}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Limpia:</span>
                  <span className="font-medium text-foreground">{formatBytes(result.cleanSize)}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full border border-border font-mono">
                    {result.outputType.split("/")[1].toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Metadata panel */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
              <div className="p-6 flex-1 overflow-auto">
                {hasExif ? (
                  <>
                    {/* Danger badge */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium font-accent mb-5">
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>
                        Se encontraron <strong>{metaItems.length}</strong> tipo{metaItems.length !== 1 ? "s" : ""} de datos privados — eliminados.
                      </span>
                    </div>

                    {/* Metadata list */}
                    <ul className="space-y-2">
                      {metaItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background animate-slide-up"
                          style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                        >
                          <span className="text-lg leading-none mt-0.5 shrink-0">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-muted-foreground font-heading uppercase tracking-wide mb-0.5">
                              {item.label}
                            </p>
                            <p
                              className={`text-sm font-accent truncate ${
                                item.highlight === "red"
                                  ? "text-red-500 font-medium"
                                  : "text-foreground"
                              }`}
                            >
                              {item.value}
                            </p>
                          </div>
                          {/* Red dot for GPS */}
                          {item.highlight === "red" && (
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  /* No EXIF found */
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
                      <ShieldCheck size={32} className="text-success" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground font-heading mb-1">¡Ya estaba limpia!</h3>
                      <p className="text-sm text-muted-foreground font-accent">
                        No encontramos metadatos privados en esta imagen.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Download button */}
              <div className="p-5 border-t border-border bg-card/80 shrink-0">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-foreground text-background font-bold text-sm rounded-2xl hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg relative overflow-hidden group"
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <Download size={18} />
                  Descargar imagen limpia
                </button>
                <p className="text-center text-xs text-muted-foreground font-accent mt-2.5">
                  Sin marca de agua · Sin servidor · 100% privado
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
