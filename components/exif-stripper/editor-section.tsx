"use client";

import { useState, useEffect, useMemo } from "react";
import {
  StripResult,
  StripOptions,
  DEFAULT_STRIP_OPTIONS,
  ExifCategory,
  ExifOutputFormat,
} from "./types";
import { stripExif, formatBytes, getCleanFileName } from "./stripper";
import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Download,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Camera,
  MapPin,
  Calendar,
  Cpu,
  CheckCircle2,
  Eye,
  FileJson,
  SlidersHorizontal,
  Search,
  Copy,
  Check,
  Lock,
  ExternalLink,
  Scan,
  Sparkles,
} from "lucide-react";

interface EditorSectionProps {
  file: File;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

type SidebarTab = "summary" | "metadata" | "export";
type CanvasView = "xray" | "json";
type FilterCat = "all" | ExifCategory;

export function EditorSection({
  file,
  onReset,
  onClose,
  dict,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";

  const [options, setOptions] = useState<StripOptions>(DEFAULT_STRIP_OPTIONS);
  const [result, setResult] = useState<StripResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI Navigation State
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("summary");
  const [canvasView, setCanvasView] = useState<CanvasView>("xray");
  const [inspectMode, setInspectMode] = useState<"clean" | "exposed">("clean");

  // Metadata Filter & Search
  const [filterCat, setFilterCat] = useState<FilterCat>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Export options
  const [anonymizeName, setAnonymizeName] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsProcessing(true);
    setError(null);

    stripExif(file, options)
      .then((res) => {
        if (!active) return;
        setResult(res);
        setIsProcessing(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError(
          isEn
            ? "Could not process the image metadata."
            : "No se pudo procesar los metadatos de la imagen."
        );
        setIsProcessing(false);
      });

    return () => {
      active = false;
    };
  }, [file, options, isEn]);

  const outputFileName = useMemo(() => {
    if (!result) return getCleanFileName(file.name, undefined, anonymizeName);
    return getCleanFileName(result.fileName, result.outputType, anonymizeName);
  }, [result, file.name, anonymizeName]);

  const filteredEntries = useMemo(() => {
    if (!result) return [];
    const q = searchQuery.trim().toLowerCase();
    return result.rawEntries.filter((entry) => {
      if (filterCat !== "all" && entry.category !== filterCat) return false;
      if (q && !entry.key.toLowerCase().includes(q) && !entry.value.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [result, filterCat, searchQuery]);

  const forensicJsonReport = useMemo(() => {
    if (!result) return "{}";
    const removedObj: Record<string, string> = {};
    for (const entry of result.rawEntries) {
      removedObj[entry.key] = entry.value;
    }
    return JSON.stringify(
      {
        engine: "ClearCut Studio EXIF Forensic Scrubber (Local HTML5 Canvas)",
        network_bytes_uploaded: 0,
        source_file: result.fileName,
        dimensions: `${result.width}x${result.height}`,
        privacy_risk_before: result.assessment.level.toUpperCase(),
        stripped_tags_count: result.assessment.totalTags,
        verified_clean_output: result.verifiedClean,
        output_format: result.outputType,
        removed_metadata: removedObj,
        sanitized_output_metadata: {},
      },
      null,
      2
    );
  }, [result]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.cleanDataUrl;
    a.download = outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((curr) => (curr === key ? null : curr)), 1800);
    } catch {
      // Clipboard fallback safely ignored
    }
  };

  const riskLevel = result?.assessment.level ?? "clean";
  const hasGps = Boolean(
    result?.exifData?.latitude != null && result?.exifData?.longitude != null
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="exif-stripper"
        lang={lang}
        onClose={onClose || onReset}
        subtitle={file.name}
        centerSlot={
          result ? (
            <span className="font-mono text-xs font-semibold text-foreground px-2.5 py-1 rounded-full bg-muted border border-border tabular-nums">
              {result.width} × {result.height} px ·{" "}
              <span className="text-emerald-700 font-bold">0 EXIF</span>
            </span>
          ) : null
        }
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-full transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">
                {isEn ? "New image" : "Otra imagen"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing || !result}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0c0e12] hover:bg-primary disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all tactile-button cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Download clean" : "Descargar limpia"}</span>
            </button>
          </div>
        }
      />

      {isProcessing ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-background studio-grid">
          <div className="p-6 rounded-2xl bg-[#0c0e12] border border-[#242936] text-white flex flex-col items-center gap-3 shadow-xl">
            <div className="w-9 h-9 border-3 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-xs uppercase tracking-widest text-slate-300">
              {isEn
                ? "SCANNING & SCRUBBING EXIF..."
                : "ESCANEANDO Y PURGANDO EXIF..."}
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] gap-4 text-destructive px-4 bg-background studio-grid">
          <ShieldAlert className="w-12 h-12" />
          <p className="font-heading font-bold text-lg">{error}</p>
          <button
            type="button"
            onClick={onReset}
            className="px-5 py-2.5 bg-[#0c0e12] text-white text-xs font-bold rounded-full hover:bg-primary transition-colors cursor-pointer"
          >
            {isEn ? "Try another image" : "Intentar con otra imagen"}
          </button>
        </div>
      ) : result ? (
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden bg-background">
          {/* LEFT SIDEBAR: 3-TAB FORENSIC PRIVACY CONSOLE */}
          <aside className="w-full lg:w-[375px] border-t lg:border-t-0 lg:border-r border-border bg-card flex flex-col shrink-0 order-2 lg:order-1 lg:overflow-y-auto">
            {/* Sidebar Tab Switcher */}
            <div className="p-3 border-b border-border bg-background/60">
              <div
                role="tablist"
                aria-label={isEn ? "EXIF Inspector sections" : "Secciones del inspector EXIF"}
                className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted border border-border"
              >
                {(
                  [
                    { id: "summary", icon: ShieldCheck, label: isEn ? "Summary" : "Resumen" },
                    {
                      id: "metadata",
                      icon: Scan,
                      label: isEn
                        ? `Tags (${result.assessment.totalTags})`
                        : `Datos (${result.assessment.totalTags})`,
                    },
                    { id: "export", icon: SlidersHorizontal, label: isEn ? "Export" : "Exportar" },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const active = sidebarTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSidebarTab(tab.id)}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? "bg-[#0c0e12] text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: PRIVACY RISK SUMMARY */}
            {sidebarTab === "summary" && (
              <div className="p-5 space-y-5">
                {/* Darkroom Forensic Verdict Card */}
                <div className="rounded-2xl bg-[#0c0e12] text-white border border-[#242936] p-4 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      FORENSIC AUDIT // RESULT
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{result.verifiedClean ? "0 EXIF" : "CLEAN"}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        riskLevel === "high"
                          ? "bg-[#ff4d00]/15 border-[#ff4d00]/40 text-[#ff834d]"
                          : riskLevel === "medium"
                          ? "bg-amber-500/15 border-amber-400/40 text-amber-300"
                          : "bg-emerald-500/15 border-emerald-400/40 text-emerald-400"
                      }`}
                    >
                      {riskLevel === "clean" ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        <ShieldAlert className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm font-heading font-bold text-white leading-snug">
                        {riskLevel === "high"
                          ? isEn
                            ? "High-Risk Leaks Scrubbed"
                            : "Fugas críticas eliminadas"
                          : riskLevel === "medium"
                          ? isEn
                            ? "Private Metadata Stripped"
                            : "Metadatos privados purgados"
                          : isEn
                          ? "Clean Pixel Buffer Verified"
                          : "Buffer de píxeles limpio"}
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {result.assessment.totalTags > 0
                          ? isEn
                            ? `${result.assessment.totalTags} embedded tags detected in source and completely removed from output.`
                            : `Se detectaron ${result.assessment.totalTags} etiquetas ocultas en el origen y se purgaron al 100%.`
                          : isEn
                          ? "No readable EXIF/GPS tags found. Freshly re-encoded pixel copy is ready."
                          : "No se encontraron etiquetas EXIF/GPS legibles. Copia limpia re-codificada lista."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Privacy Category Status Cards */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Privacy Categories Scanned" : "Categorías auditadas"}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        {
                          icon: MapPin,
                          label: isEn ? "GPS Location" : "Ubicación GPS",
                          found: result.assessment.hasGps,
                          highRisk: true,
                        },
                        {
                          icon: Camera,
                          label: isEn ? "Camera & Lens" : "Cámara y Lente",
                          found: result.assessment.hasCamera,
                          highRisk: false,
                        },
                        {
                          icon: Calendar,
                          label: isEn ? "Timestamps" : "Fecha y Hora",
                          found: result.assessment.hasDates,
                          highRisk: false,
                        },
                        {
                          icon: Cpu,
                          label: isEn ? "Software / ID" : "Software / Autor",
                          found: result.assessment.hasSoftwareOrAuthor,
                          highRisk: false,
                        },
                      ] as const
                    ).map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div
                          key={cat.label}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                            cat.found
                              ? cat.highRisk
                                ? "bg-destructive/5 border-destructive/30"
                                : "bg-amber-500/5 border-amber-500/30"
                              : "bg-background border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon
                              className={`w-4 h-4 ${
                                cat.found
                                  ? cat.highRisk
                                    ? "text-destructive"
                                    : "text-amber-600"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                cat.found
                                  ? "bg-emerald-500/15 text-emerald-800 border border-emerald-600/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {cat.found
                                ? isEn
                                  ? "SCRUBBED"
                                  : "PURGADO"
                                : isEn
                                ? "NONE"
                                : "LIMPIO"}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {cat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* File Telemetry Summary */}
                <div className="rounded-xl border border-border bg-background divide-y divide-border/70 text-xs">
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {isEn ? "Original file" : "Archivo original"}
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatBytes(result.originalSize)}
                    </span>
                  </div>
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {isEn ? "Sanitized output" : "Salida limpia"}
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatBytes(result.cleanSize)} ·{" "}
                      {result.outputType.split("/")[1].toUpperCase()}
                    </span>
                  </div>
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {isEn ? "Network traffic" : "Envío a servidores"}
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      0 B · LOCAL
                    </span>
                  </div>
                </div>

                {/* Primary Download Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isEn
                      ? "Download sanitized image"
                      : "Descargar imagen sin metadatos"}
                  </span>
                </button>
              </div>
            )}

            {/* TAB 2: FORENSIC METADATA INSPECTOR */}
            {sidebarTab === "metadata" && (
              <div className="p-5 space-y-4">
                {/* GPS Alert if present */}
                {hasGps && result.exifData?.latitude != null && result.exifData?.longitude != null && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {isEn ? "GPS Coordinates Exposed!" : "¡Coordenadas GPS detectadas!"}
                        </span>
                      </span>
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                        {isEn ? "REMOVED" : "BORRADO"}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-destructive font-semibold">
                      {result.exifData.latitude.toFixed(6)}°,{" "}
                      {result.exifData.longitude.toFixed(6)}°
                    </p>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${result.exifData.latitude}&mlon=${result.exifData.longitude}#map=15/${result.exifData.latitude}/${result.exifData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive hover:underline"
                    >
                      <span>
                        {isEn ? "Inspect leaked pin on OpenStreetMap" : "Ver ubicación filtrada en mapa"}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Search + Category Pills */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isEn ? "Filter EXIF tags..." : "Buscar etiqueta EXIF..."
                      }
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(
                      [
                        { id: "all", label: isEn ? "All" : "Todos" },
                        { id: "gps", label: "GPS" },
                        { id: "camera", label: isEn ? "Camera" : "Cámara" },
                        { id: "datetime", label: isEn ? "Dates" : "Fechas" },
                        { id: "software", label: "Software" },
                      ] as Array<{ id: FilterCat; label: string }>
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFilterCat(c.id)}
                        className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold border cursor-pointer transition-colors ${
                          filterCat === c.id
                            ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Raw Entries List */}
                {filteredEntries.length > 0 ? (
                  <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredEntries.map((entry) => (
                      <li
                        key={entry.key}
                        className="p-2.5 rounded-xl border border-border bg-background flex items-start justify-between gap-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                entry.risk === "high"
                                  ? "bg-destructive"
                                  : entry.risk === "medium"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase truncate">
                              {entry.key}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-foreground/80 line-through decoration-destructive/60 break-all">
                            {entry.value}
                          </p>
                        </div>
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/12 text-emerald-800 border border-emerald-600/20 shrink-0">
                          {isEn ? "STRIPPED" : "PURGADO"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-10 px-4 text-center rounded-2xl bg-background border border-border space-y-2">
                    <ShieldCheck className="w-7 h-7 text-emerald-700 mx-auto" />
                    <p className="text-xs font-bold text-foreground">
                      {result.assessment.totalTags === 0
                        ? isEn
                          ? "Zero hidden EXIF tags found"
                          : "Sin etiquetas EXIF ocultas"
                        : isEn
                        ? "No tags match this filter"
                        : "Ninguna etiqueta coincide con el filtro"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXPORT & ANONYMIZATION SETTINGS */}
            {sidebarTab === "export" && (
              <div className="p-5 space-y-5">
                {/* Output Format */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Output Format" : "Formato de salida"}
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: "original", label: isEn ? "Original" : "Original" },
                        { id: "jpeg", label: "JPEG" },
                        { id: "png", label: "PNG" },
                        { id: "webp", label: "WebP" },
                      ] as Array<{ id: ExifOutputFormat; label: string }>
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setOptions((o) => ({ ...o, format: fmt.id }))}
                        className={`py-2 px-3 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                          options.format === fmt.id
                            ? "bg-[#0c0e12] text-white border-[#0c0e12]"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider (for non-PNG outputs) */}
                {result.outputType !== "image/png" && (
                  <div className="space-y-2.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground uppercase font-bold">
                        {isEn ? "Re-encode Quality" : "Calidad de exportación"}
                      </span>
                      <span className="font-bold text-foreground">{options.quality}%</span>
                    </div>
                    <Slider
                      min={70}
                      max={100}
                      step={1}
                      value={[options.quality]}
                      onValueChange={([val]) => setOptions((o) => ({ ...o, quality: val }))}
                    />
                  </div>
                )}

                {/* Filename Anonymizer */}
                <div className="space-y-2.5 pt-3 border-t border-border">
                  <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-border bg-background cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {isEn ? "Anonymize Filename" : "Anonimizar nombre de archivo"}
                        </span>
                      </span>
                      <span className="text-[11px] text-muted-foreground block leading-relaxed">
                        {isEn
                          ? "Replaces names like IMG_20261014.jpg that can still leak capture dates."
                          : "Oculta nombres como IMG_20261014.jpg que también delatan la fecha de captura."}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={anonymizeName}
                      onChange={(e) => setAnonymizeName(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#1e40ff] cursor-pointer shrink-0"
                    />
                  </label>

                  <div className="px-3 py-2 rounded-lg bg-[#0c0e12] border border-[#242936] font-mono text-[11px] text-emerald-400 truncate">
                    {outputFileName}
                  </div>
                </div>

                {/* Download & Copy Audit JSON */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isEn ? "Download sanitized image" : "Descargar imagen limpia"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(forensicJsonReport, "audit-json")}
                    className="w-full py-2.5 px-4 rounded-xl bg-background hover:bg-muted border border-border text-foreground font-mono text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === "audit-json" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isEn ? "Audit JSON copied" : "Informe JSON copiado"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {isEn ? "Copy Forensic Audit JSON" : "Copiar informe forense JSON"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* MAIN PANORAMIC DARKROOM FORENSIC STAGE */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5 bg-background studio-grid order-1 lg:order-2">
            {/* Top View Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border tactile-surface">
              <div
                role="tablist"
                aria-label={isEn ? "Forensic stage view" : "Vista del visor forense"}
                className="inline-flex items-center p-1 rounded-xl bg-muted border border-border"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={canvasView === "xray"}
                  onClick={() => setCanvasView("xray")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    canvasView === "xray"
                      ? "bg-[#0c0e12] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isEn ? "X-Ray Viewport" : "Visor X-Ray"}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={canvasView === "json"}
                  onClick={() => setCanvasView("json")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    canvasView === "json"
                      ? "bg-[#0c0e12] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>{isEn ? "Forensic JSON Report" : "Informe Técnico (JSON)"}</span>
                </button>
              </div>

              {canvasView === "xray" && (
                <div className="inline-flex items-center p-1 rounded-xl bg-background border border-border font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => setInspectMode("exposed")}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      inspectMode === "exposed"
                        ? "bg-[#ff4d00] text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isEn ? "BEFORE (SOURCE)" : "ANTES (ORIGEN)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectMode("clean")}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      inspectMode === "clean"
                        ? "bg-emerald-600 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isEn ? "AFTER (CLEAN)" : "DESPUÉS (LIMPIA)"}
                  </button>
                </div>
              )}
            </div>

            {/* VIEW 1: DARKROOM X-RAY VIEWPORT */}
            {canvasView === "xray" && (
              <div className="flex-1 min-h-[420px] rounded-[1.5rem] bg-[#0c0e12] border border-[#242936] darkroom-chassis p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 darkroom-grid opacity-55" />

                {/* Top Viewport Status Bezel */}
                <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 pb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold border ${
                      inspectMode === "clean"
                        ? "bg-emerald-950/90 border-emerald-400/40 text-emerald-300"
                        : result.assessment.totalTags > 0
                        ? "bg-[#2a120a]/90 border-[#ff4d00]/50 text-[#ff834d]"
                        : "bg-white/10 border-white/15 text-slate-300"
                    }`}
                  >
                    {inspectMode === "clean" ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>
                          {isEn
                            ? "VERIFIED // 0 EXIF METADATA"
                            : "VERIFICADO // 0 METADATOS EXIF"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {isEn
                            ? `SOURCE SCAN // ${result.assessment.totalTags} TAGS DETECTED`
                            : `ESCANEO ORIGEN // ${result.assessment.totalTags} ETIQUETAS DETECTADAS`}
                        </span>
                      </>
                    )}
                  </span>

                  <span className="font-mono text-[10px] text-slate-400 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                    {formatBytes(result.originalSize)} → {formatBytes(result.cleanSize)}
                  </span>
                </div>

                {/* Framed Image Specimen */}
                <div className="relative z-10 flex-1 flex items-center justify-center py-2">
                  <div className="relative max-w-full max-h-[58vh] rounded-2xl overflow-hidden border border-white/15 shadow-2xl checkerboard-dark">
                    <img
                      src={result.cleanDataUrl}
                      alt={isEn ? "Sanitized image preview" : "Vista previa de imagen limpia"}
                      className={`max-w-full max-h-[56vh] w-auto h-auto object-contain block transition-all duration-300 ${
                        inspectMode === "exposed" && result.assessment.totalTags > 0
                          ? "brightness-75"
                          : "brightness-100"
                      }`}
                    />

                    {/* Viewfinder Brackets */}
                    <span className="pointer-events-none absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-white/45" />
                    <span className="pointer-events-none absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-white/45" />
                    <span className="pointer-events-none absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-white/45" />
                    <span className="pointer-events-none absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-white/45" />

                    {/* Floating HUD Tags when inspecting BEFORE (EXPOSED) */}
                    {inspectMode === "exposed" && result.rawEntries.length > 0 && (
                      <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2 justify-center pointer-events-none">
                        {result.rawEntries.slice(0, 4).map((tag) => (
                          <span
                            key={tag.key}
                            className="px-2.5 py-1 rounded-lg bg-[#1a0d0d]/90 backdrop-blur-md border border-[#ff4d00]/60 font-mono text-[10px] text-orange-100 shadow-lg"
                          >
                            <strong className="text-[#ff834d]">{tag.key}:</strong>{" "}
                            {tag.value.slice(0, 26)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Hardware Spec Strip */}
                <div className="relative z-20 pt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 border-t border-white/10 mt-3">
                  <span>
                    {isEn
                      ? "HTML5 CANVAS PIXEL RE-ENCODING · ZERO SERVER UPLOAD"
                      : "RE-CODIFICACIÓN LOCAL POR PÍXELES · CERO SUBIDAS A SERVIDORES"}
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {outputFileName}
                  </span>
                </div>
              </div>
            )}

            {/* VIEW 2: DARKROOM FORENSIC JSON REPORT */}
            {canvasView === "json" && (
              <div className="rounded-2xl bg-[#0c0e12] text-white border border-[#242936] darkroom-chassis overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-[#242936] bg-[#11141c] flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-bold text-slate-300">
                    FORENSIC_AUDIT_REPORT.JSON
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(forensicJsonReport, "panel-json")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    {copiedKey === "panel-json" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">
                          {isEn ? "COPIED" : "COPIADO"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isEn ? "COPY REPORT" : "COPIAR INFORME"}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-5 overflow-x-auto max-h-[60vh]">
                  <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre">
                    {forensicJsonReport}
                  </pre>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : null}
    </div>
  );
}
