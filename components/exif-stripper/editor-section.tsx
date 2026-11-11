"use client";

import { useState, useEffect } from "react";
import { StripResult, ExifData } from "./types";
import { stripExif, formatBytes, getCleanFileName } from "./stripper";
import { WorkspaceHeader } from "@/components/studio/workspace-header";
import {
  Download,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Aperture,
  MapPin,
  Calendar,
  Sliders,
  Focus,
  Cpu,
  User,
  Copyright,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

interface EditorSectionProps {
  file: File;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

interface MetaItem {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: "red" | "blue";
}

function buildMetaItems(exif: ExifData, isEn: boolean): MetaItem[] {
  const items: MetaItem[] = [];

  if (exif.Make || exif.Model) {
    items.push({
      icon: Camera,
      label: isEn ? "Camera" : "Cámara",
      value: [exif.Make, exif.Model].filter(Boolean).join(" "),
    });
  }
  if (exif.LensModel) {
    items.push({
      icon: Aperture,
      label: isEn ? "Lens" : "Lente",
      value: exif.LensModel,
    });
  }
  if (exif.latitude != null && exif.longitude != null) {
    const lat = exif.latitude.toFixed(5);
    const lon = exif.longitude.toFixed(5);
    items.push({
      icon: MapPin,
      label: isEn ? "GPS Location" : "Ubicación GPS",
      value: `${lat}°, ${lon}°`,
      highlight: "red",
    });
  }
  if (exif.DateTimeOriginal || exif.CreateDate) {
    const d = exif.DateTimeOriginal || exif.CreateDate;
    const dateStr =
      d instanceof Date
        ? d.toLocaleString(isEn ? "en-US" : "es-MX")
        : String(d);
    items.push({
      icon: Calendar,
      label: isEn ? "Capture Date" : "Fecha de captura",
      value: dateStr,
    });
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
      icon: Sliders,
      label: isEn ? "Exposure" : "Exposición",
      value: [f, ss, iso].filter(Boolean).join(" · "),
    });
  }
  if (exif.FocalLength) {
    items.push({
      icon: Focus,
      label: isEn ? "Focal Length" : "Distancia focal",
      value: `${exif.FocalLength} mm`,
    });
  }
  if (exif.Software) {
    items.push({
      icon: Cpu,
      label: "Software",
      value: exif.Software,
    });
  }
  if (exif.Artist) {
    items.push({
      icon: User,
      label: isEn ? "Author / Artist" : "Autor / Artista",
      value: exif.Artist,
    });
  }
  if (exif.Copyright) {
    items.push({
      icon: Copyright,
      label: "Copyright",
      value: exif.Copyright,
    });
  }

  return items;
}

export function EditorSection({
  file,
  onReset,
  onClose,
  dict,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";
  const [result, setResult] = useState<StripResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsProcessing(true);
    setError(null);
    stripExif(file)
      .then((res) => {
        setResult(res);
        setIsProcessing(false);
      })
      .catch((err) => {
        console.error(err);
        setError(
          isEn
            ? "Could not process the image metadata."
            : "No se pudo procesar los metadatos de la imagen."
        );
        setIsProcessing(false);
      });
  }, [file, isEn]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.cleanDataUrl;
    a.download = getCleanFileName(result.fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const metaItems = result?.exifData ? buildMetaItems(result.exifData, isEn) : [];
  const hasExif = metaItems.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="exif-stripper"
        lang={lang}
        onClose={onClose || onReset}
        subtitle={file.name}
        rightSlot={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? "Clean another image" : "Limpiar otra imagen"}</span>
          </button>
        }
      />

      <div className="flex-1 overflow-auto bg-background">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3 text-muted-foreground">
            <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">
              {isEn
                ? "Inspecting and stripping EXIF metadata locally..."
                : "Analizando y eliminando metadatos EXIF localmente..."}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4 text-destructive px-4">
            <ShieldAlert className="w-12 h-12" />
            <p className="font-heading font-bold text-lg">{error}</p>
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
            >
              {isEn ? "Try again" : "Intentar de nuevo"}
            </button>
          </div>
        ) : result ? (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)]">
            {/* Left: Image preview */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 gap-5 bg-canvas">
              <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-md border border-border bg-card checkerboard">
                <img
                  src={result.cleanDataUrl}
                  alt={isEn ? "Sanitized image preview" : "Vista previa de imagen limpia"}
                  className="relative w-full h-auto object-contain max-h-[54vh]"
                />
              </div>

              {/* File metrics */}
              <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-2.5 rounded-xl bg-card border border-border text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">
                    {isEn ? "Original:" : "Original:"}
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>
                <div className="w-px h-3.5 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">
                    {isEn ? "Clean output:" : "Salida limpia:"}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {formatBytes(result.cleanSize)}
                  </span>
                </div>
                <div className="w-px h-3.5 bg-border" />
                <span className="font-mono font-semibold px-2 py-0.5 bg-muted rounded-md border border-border text-foreground">
                  {result.outputType.split("/")[1].toUpperCase()}
                </span>
              </div>
            </div>

            {/* Right: Metadata Report Panel */}
            <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col justify-between">
              <div className="p-6 flex-1 overflow-auto">
                <h2 className="text-base font-bold font-heading text-foreground mb-1">
                  {isEn ? "Metadata Inspection Report" : "Informe de inspección de metadatos"}
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  {isEn
                    ? "Tags read from the source file and removed from the clean copy."
                    : "Etiquetas detectadas en el archivo original y eliminadas de la copia limpia."}
                </p>

                {hasExif ? (
                  <>
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-medium mb-4">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>
                        {isEn ? (
                          <>
                            Found and stripped <strong>{metaItems.length}</strong> private metadata{" "}
                            {metaItems.length === 1 ? "field" : "fields"}.
                          </>
                        ) : (
                          <>
                            Se detectaron y eliminaron <strong>{metaItems.length}</strong> campo
                            {metaItems.length !== 1 ? "s" : ""} de metadatos privados.
                          </>
                        )}
                      </span>
                    </div>

                    <ul className="space-y-2.5">
                      {metaItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                item.highlight === "red"
                                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                                  : "bg-primary/10 text-primary border border-primary/20"
                              }`}
                            >
                              <Icon className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                {item.label}
                              </p>
                              <p
                                className={`text-xs font-mono break-all ${
                                  item.highlight === "red"
                                    ? "text-destructive font-semibold"
                                    : "text-foreground"
                                }`}
                              >
                                {item.value}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                              {isEn ? "STRIPPED" : "ELIMINADO"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-background border border-border">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-foreground font-heading text-sm mb-1">
                      {isEn ? "No embedded EXIF metadata found" : "Sin metadatos EXIF incrustados"}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {isEn
                        ? "This file did not contain readable GPS or camera EXIF tags. We still generated a freshly re-encoded clean copy for you."
                        : "Este archivo no contenía etiquetas GPS o de cámara legibles. Aun así, generamos una copia re-codificada limpia lista para descargar."}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {isEn ? "Verified clean pixel buffer" : "Buffer de píxeles limpio verificado"}
                    </span>
                  </div>
                )}
              </div>

              {/* Download CTA */}
              <div className="p-5 border-t border-border bg-card">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {isEn ? "Download sanitized image" : "Descargar imagen sin metadatos"}
                  </span>
                </button>
                <p className="text-center text-[11px] text-muted-foreground mt-2">
                  {isEn
                    ? "Re-encoded locally via HTML5 Canvas · 0 bytes uploaded"
                    : "Re-codificada localmente mediante HTML5 Canvas · 0 bytes subidos"}
                </p>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
