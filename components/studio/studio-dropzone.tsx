"use client";

import React, { useRef, useState } from "react";
import { Upload, ShieldCheck, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { ToolSlug, getToolBySlug } from "@/lib/tools-catalog";
import { ToolIcon } from "./tool-icon";

export interface SampleItem {
  src: string;
  label: string;
}

export interface StudioDropzoneProps {
  slug: ToolSlug;
  lang?: string;
  badgeText?: string;
  title?: string;
  description?: string;
  formats?: string[];
  maxSizeLabel?: string;
  privacyNote?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  accept?: string;
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  onMultiFileSelect?: (files: File[]) => void;
  onSampleSelect?: (src: string) => void;
  samples?: Array<string | SampleItem>;
  onClose?: () => void;
  highlights?: { title: string; desc: string }[];
  customNotice?: string;
}

export function StudioDropzone({
  slug,
  lang = "es",
  badgeText: badgeOverride,
  title: titleOverride,
  description: descriptionOverride,
  formats: formatsOverride,
  maxSizeLabel,
  privacyNote,
  multiple = false,
  maxSizeMB = 25,
  accept = "image/*",
  onFileSelect,
  onFilesSelect,
  onMultiFileSelect,
  onSampleSelect,
  samples,
  highlights,
  customNotice,
}: StudioDropzoneProps) {
  const isEs = lang === "es";
  const tool = getToolBySlug(slug);
  const copy = isEs ? tool.es : tool.en;
  const badgeText = badgeOverride || (isEs ? tool.executionBadge.es : tool.executionBadge.en);
  const displayTitle = titleOverride || copy.name;
  const displayDesc = descriptionOverride || copy.description;
  const displayFormats = formatsOverride || tool.formats;
  const displayNotice = privacyNote || customNotice;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateAndDispatch = (fileList: FileList | File[]) => {
    setErrorMsg(null);
    const arr = Array.from(fileList);
    if (arr.length === 0) return;

    const validFiles = arr.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      setErrorMsg(
        isEs
          ? "Formato de archivo no válido. Selecciona una imagen compatible (JPG, PNG, WebP, AVIF)."
          : "Invalid file format. Please select a supported image file (JPG, PNG, WebP, AVIF)."
      );
      return;
    }

    const oversized = validFiles.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (oversized) {
      setErrorMsg(
        isEs
          ? `El archivo "${oversized.name}" supera el límite recomendado de ${maxSizeMB} MB.`
          : `The file "${oversized.name}" exceeds the recommended ${maxSizeMB} MB limit.`
      );
      return;
    }

    if (multiple && (onFilesSelect || onMultiFileSelect)) {
      if (onFilesSelect) onFilesSelect(validFiles);
      else if (onMultiFileSelect) onMultiFileSelect(validFiles);
    } else if (onFileSelect) {
      onFileSelect(validFiles[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndDispatch(e.dataTransfer.files);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const defaultHighlights = isEs
    ? [
        {
          title: "Procesamiento en dispositivo",
          desc: "Tus imágenes se procesan localmente en la memoria de tu navegador.",
        },
        {
          title: "Calidad sin marcas de agua",
          desc: "Exporta tus resultados en resolución completa sin restricciones.",
        },
        {
          title: "Flujo directo y veloz",
          desc: "Sin registros, sin colas de servidor y con control técnico inmediato.",
        },
      ]
    : [
        {
          title: "On-device processing",
          desc: "Your images are processed locally inside your browser's memory.",
        },
        {
          title: "Watermark-free quality",
          desc: "Export full-resolution results without artificial restrictions.",
        },
        {
          title: "Fast, direct workflow",
          desc: "No sign-ups, no server queues, and immediate technical control.",
        },
      ];

  const displayHighlights = highlights || defaultHighlights;

  const normalizedSamples: SampleItem[] = (samples || []).map((s, idx) =>
    typeof s === "string"
      ? { src: s, label: isEs ? `Ejemplo ${idx + 1}` : `Sample ${idx + 1}` }
      : s
  );

  return (
    <div className="w-full max-w-2xl space-y-6 animate-slide-up">
      {/* Header block */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-foreground text-xs font-semibold shadow-2xs">
          <span className="text-primary">
            <ToolIcon slug={slug} className="w-3.5 h-3.5" />
          </span>
          <span>{badgeText}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold font-heading tracking-tight text-foreground">
          {displayTitle}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {/* Inline Error Alert */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm shadow-2xs"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">
              {isEs ? "No se pudo cargar el archivo" : "Could not load file"}
            </p>
            <p className="text-xs text-red-700 mt-0.5">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs font-semibold underline hover:text-red-950 cursor-pointer"
          >
            {isEs ? "Cerrar" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Accessible Dropzone Card */}
      <div
        role="button"
        tabIndex={0}
        aria-label={
          multiple
            ? isEs
              ? "Zona de carga de archivos. Presiona Enter o Espacio para seleccionar imágenes."
              : "File upload dropzone. Press Enter or Space to select images."
            : isEs
            ? "Zona de carga de archivo. Presiona Enter o Espacio para seleccionar una imagen."
            : "File upload dropzone. Press Enter or Space to select an image."
        }
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={`relative bg-card border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all shadow-2xs group ${
          isDragging
            ? "border-primary bg-blue-50/50 scale-[1.01] shadow-md"
            : "border-slate-300 hover:border-primary hover:bg-slate-50/70"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndDispatch(e.target.files);
            }
          }}
        />

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors border ${
            isDragging
              ? "bg-primary text-white border-primary shadow-md"
              : "bg-slate-100 text-primary border-border group-hover:bg-primary group-hover:text-white group-hover:border-primary"
          }`}
        >
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-foreground font-heading mb-1.5">
          {isDragging
            ? isEs
              ? "Suelta para abrir en el espacio de trabajo"
              : "Drop to open in workspace"
            : multiple
            ? isEs
              ? "Arrastra tus imágenes aquí o haz clic para seleccionar"
              : "Drag & drop your images here, or click to browse"
            : isEs
            ? "Arrastra tu imagen aquí o haz clic para seleccionar"
            : "Drag & drop your image here, or click to browse"}
        </h3>

        <p className="text-muted-foreground text-xs sm:text-sm mb-5">
          {multiple
            ? isEs
              ? "Puedes seleccionar múltiples archivos simultáneamente"
              : "You can select multiple files at once"
            : isEs
            ? "También puedes activar este control con Enter o Espacio"
            : "You can also activate this control with Enter or Space"}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono text-muted-foreground">
          {displayFormats.map((ext) => (
            <span
              key={ext}
              className="px-2.5 py-1 bg-muted rounded-md border border-border font-medium text-foreground"
            >
              {ext}
            </span>
          ))}
          <span className="px-2 py-1 text-muted-foreground font-sans">
            · {maxSizeLabel || (isEs ? `Hasta ${maxSizeMB} MB` : `Up to ${maxSizeMB} MB`)}
          </span>
        </div>
      </div>

      {displayNotice && (
        <p className="text-xs text-center text-muted-foreground bg-card border border-border rounded-xl px-4 py-2.5">
          {displayNotice}
        </p>
      )}

      {/* Optional Sample Images */}
      {normalizedSamples.length > 0 && onSampleSelect && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                {isEs ? "¿No tienes una imagen a mano?" : "Don't have an image handy?"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isEs
                  ? "Prueba el flujo real con una imagen de ejemplo:"
                  : "Test the live workflow with a sample image:"}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {normalizedSamples.map((s) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => onSampleSelect(s.src)}
                  className="group relative w-14 h-14 rounded-xl overflow-hidden border border-border hover:border-primary transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  title={s.label}
                >
                  <img
                    src={s.src}
                    alt={s.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="sr-only">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verifiable Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {displayHighlights.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-card border border-border shadow-2xs flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-foreground font-heading font-bold text-xs">
              {idx === 0 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : idx === 1 ? (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Cpu className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <span>{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
