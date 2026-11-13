"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getToolBySlug, ToolSlug } from "@/lib/tools-catalog";
import { ToolIcon } from "@/components/studio/tool-icon";

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
  badgeText,
  title,
  description,
  formats = ["PNG", "JPG", "WebP", "AVIF"],
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
  onClose,
  highlights,
  customNotice,
}: StudioDropzoneProps) {
  const isEs = lang === "es";
  const tool = getToolBySlug(slug);
  const copy = tool ? (isEs ? tool.es : tool.en) : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const normalizedSamples: SampleItem[] = (samples || []).map((s, idx) =>
    typeof s === "string"
      ? { src: s, label: `${isEs ? "Muestra" : "Sample"} ${idx + 1}` }
      : s
  );

  const validateAndDispatch = (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    if (arr.length === 0) return;

    const validFiles = arr.filter(
      (f) => f.type.startsWith("image/") || /\.(avif|webp|png|jpe?g|svg|bmp|gif|ico)$/i.test(f.name)
    );

    if (validFiles.length === 0) {
      toast.error(
        isEs
          ? "Formato no admitido. Selecciona un archivo de imagen válido."
          : "Unsupported format. Please pick a valid image file."
      );
      return;
    }

    const oversized = validFiles.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (oversized) {
      toast.warning(
        isEs
          ? `El archivo "${oversized.name}" supera el límite recomendado de ${maxSizeMB} MB.`
          : `The file "${oversized.name}" exceeds the recommended ${maxSizeMB} MB limit.`
      );
    }

    if (multiple && (onFilesSelect || onMultiFileSelect)) {
      if (onFilesSelect) onFilesSelect(validFiles);
      else if (onMultiFileSelect) onMultiFileSelect(validFiles);
    } else if (onFileSelect) {
      onFileSelect(validFiles[0]);
    } else if (onFilesSelect) {
      onFilesSelect(validFiles);
    } else if (onMultiFileSelect) {
      onMultiFileSelect(validFiles);
    }
  };

  // Support Ctrl+V image paste inside dropzone view
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        validateAndDispatch(files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const resolvedTitle = title || copy?.name || slug;
  const resolvedDesc = description || copy?.description || "";
  const resolvedBadge = badgeText || (isEs ? "PROCESAMIENTO LOCAL // RAM" : "LOCAL PROCESSING // RAM");
  const resolvedPrivacy =
    privacyNote ||
    (isEs
      ? "Tus archivos se procesan en memoria local y nunca se suben a servidores."
      : "Your files are processed in local browser memory and never uploaded to servers.");

  const resolvedHighlights =
    highlights && highlights.length > 0
      ? highlights
      : isEs
        ? [
            {
              title: "Privacidad verificable",
              desc: "Sin peticiones de subida externa durante el procesamiento.",
            },
            {
              title: "Control de parámetros",
              desc: "Previsualiza cambios y calibra valores antes de descargar.",
            },
            {
              title: "Exportación limpia",
              desc: "Descarga resultados en resolución completa sin marcas de agua.",
            },
          ]
        : [
            {
              title: "Verifiable privacy",
              desc: "Zero external upload requests while editing or exporting.",
            },
            {
              title: "Precision controls",
              desc: "Preview results and calibrate output parameters live.",
            },
            {
              title: "Clean export",
              desc: "Export full-resolution assets without artificial restrictions.",
            },
          ];

  return (
    <div className="min-h-screen bg-background studio-grid px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Top instrument navigation bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-card hover:bg-muted border border-border text-xs font-mono font-semibold text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEs ? "Volver al estudio" : "Back to studio"}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-700/20 font-mono text-[11px] font-semibold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{resolvedBadge}</span>
          </div>
        </div>

        {/* Main Optical Atelier Frame */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-[0_28px_80px_-36px_rgba(12,14,18,0.22)]">
          {/* Header strip */}
          <div className="p-6 sm:p-9 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-darkroom text-white flex items-center justify-center shrink-0">
                <ToolIcon slug={slug} className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {resolvedTitle}
                </h1>
                {resolvedDesc && (
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl leading-relaxed font-accent">
                    {resolvedDesc}
                  </p>
                )}
              </div>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider shrink-0">
              {multiple
                ? isEs
                  ? "MODO: LOTE / MÚLTIPLE"
                  : "MODE: BATCH / MULTI"
                : isEs
                  ? "MODO: ARCHIVO ÚNICO"
                  : "MODE: SINGLE PLATE"}
            </div>
          </div>

          {/* Darkroom Optical Intake Viewport */}
          <div className="p-5 sm:p-8 bg-background/60">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  validateAndDispatch(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  validateAndDispatch(e.dataTransfer.files);
                }
              }}
              className={`group relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-8 sm:p-14 text-center overflow-hidden ${
                isDragging
                  ? "border-accent bg-darkroom text-white scale-[0.995]"
                  : "border-border hover:border-primary bg-darkroom text-white"
              }`}
            >
              {/* Viewfinder corner brackets */}
              <span className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white/25 group-hover:border-accent transition-colors" aria-hidden="true" />
              <span className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white/25 group-hover:border-accent transition-colors" aria-hidden="true" />
              <span className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white/25 group-hover:border-accent transition-colors" aria-hidden="true" />
              <span className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white/25 group-hover:border-accent transition-colors" aria-hidden="true" />

              <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-white" aria-hidden="true" />
                </div>

                <p className="font-heading font-bold text-lg sm:text-xl text-white mb-2">
                  {isDragging
                    ? isEs
                      ? "Suelta para cargar en el estudio"
                      : "Release to load into studio"
                    : multiple
                      ? isEs
                        ? "Arrastra tus imágenes o haz clic para seleccionar"
                        : "Drag your images here or click to browse"
                      : isEs
                        ? "Arrastra tu imagen o haz clic para cargar"
                        : "Drag your image here or click to load"}
                </p>

                <p className="text-xs sm:text-sm text-slate-400 font-accent mb-5">
                  {isEs
                    ? "También puedes pegar directamente desde el portapapeles (Ctrl+V)"
                    : "You can also paste directly from clipboard (Ctrl+V)"}
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-darkroom font-semibold text-xs sm:text-sm group-hover:bg-accent group-hover:text-white transition-colors">
                  <span>{isEs ? "Seleccionar archivo" : "Select file"}</span>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] text-slate-400">
                  {formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                    >
                      {fmt}
                    </span>
                  ))}
                  <span>
                    · {maxSizeLabel || (isEs ? `Hasta ${maxSizeMB} MB` : `Up to ${maxSizeMB} MB`)}
                  </span>
                </div>
              </div>
            </div>

            {customNotice && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-600/25 text-xs text-amber-900 font-accent">
                {customNotice}
              </div>
            )}

            {/* Quick Samples Strip if supplied */}
            {normalizedSamples.length > 0 && onSampleSelect && (
              <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span>{isEs ? "Muestras de prueba:" : "Quick studio plates:"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {normalizedSamples.map((s, idx) => (
                    <button
                      key={`${s.src}-${idx}`}
                      type="button"
                      onClick={() => onSampleSelect(s.src)}
                      className="inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-card hover:bg-muted border border-border text-xs font-medium text-foreground transition-colors cursor-pointer"
                    >
                      <img
                        src={s.src}
                        alt={s.label}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                      />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swiss Hairline Spec Highlights Footer */}
          <div className="border-t border-border grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border bg-card">
            {resolvedHighlights.map((h, i) => (
              <div key={i} className="p-5 sm:p-6">
                <div className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                  SPEC 0{i + 1}
                </div>
                <h2 className="font-heading font-bold text-sm text-foreground mb-1">
                  {h.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-accent">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom subtle verifiable note */}
        <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
          {resolvedPrivacy}
        </p>
      </div>
    </div>
  );
}
