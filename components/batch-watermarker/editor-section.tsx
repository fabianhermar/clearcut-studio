"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from "react";
import {
  WatermarkSettings,
  DEFAULT_WATERMARK_SETTINGS,
  Position,
  FontFamily,
} from "./types";
import {
  paintWatermark,
  processAndZip,
  buildPreviewDataUrl,
} from "./watermarker";
import {
  Download,
  RefreshCw,
  Type,
  Image as ImageIcon,
  Stamp,
  FileImage,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { WorkspaceHeader } from "@/components/studio/workspace-header";

interface EditorSectionProps {
  files: File[];
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

const POSITIONS: { pos: Position; label: string }[] = [
  { pos: "top-left", label: "↖" },
  { pos: "top-center", label: "↑" },
  { pos: "top-right", label: "↗" },
  { pos: "middle-left", label: "←" },
  { pos: "center", label: "•" },
  { pos: "middle-right", label: "→" },
  { pos: "bottom-left", label: "↙" },
  { pos: "bottom-center", label: "↓" },
  { pos: "bottom-right", label: "↘" },
];

const FONTS: { label: string; value: FontFamily }[] = [
  { label: "Urbanist", value: "Urbanist Variable, sans-serif" },
  { label: "Albert Sans", value: "Albert Sans Variable, sans-serif" },
  { label: "Monospace", value: "monospace" },
  { label: "Serif", value: "serif" },
];

export function EditorSection({
  files,
  onReset,
  onClose,
  dict,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    done: boolean;
    zipUrl: string | null;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [, startTransition] = useTransition();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!files[0]) return;
    buildPreviewDataUrl(files[0], 800).then((url) => {
      const img = new Image();
      img.onload = () => {
        previewImgRef.current = img;
        setPreviewDataUrl(url);
      };
      img.src = url;
    });
  }, [files]);

  const repaintCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = previewImgRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    await paintWatermark(ctx, canvas.width, canvas.height, settings);
  }, [settings]);

  useEffect(() => {
    if (!previewDataUrl) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        repaintCanvas();
      });
    }, 90);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [settings, previewDataUrl, repaintCanvas]);

  const update = (patch: Partial<WatermarkSettings>) => {
    setProgress(null);
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ logoSrc: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    setErrorMsg(null);
    setProgress({ current: 0, total: files.length, done: false, zipUrl: null });
    try {
      const zipBlob = await processAndZip(files, settings, (current) => {
        setProgress((prev) => (prev ? { ...prev, current } : null));
      });
      const url = URL.createObjectURL(zipBlob);
      setProgress({
        current: files.length,
        total: files.length,
        done: true,
        zipUrl: url,
      });
    } catch (err) {
      console.error(err);
      setProgress(null);
      setErrorMsg(
        isEn
          ? "Error processing the image batch."
          : "Error al procesar el lote de imágenes."
      );
    }
  };

  const handleDownload = () => {
    if (!progress?.zipUrl) return;
    const a = document.createElement("a");
    a.href = progress.zipUrl;
    a.download = "watermarked-images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isProcessing = progress !== null && !progress.done;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="batch-watermarker"
        lang={lang}
        onClose={onClose || onReset}
        subtitle={
          isEn
            ? `${files.length} image${files.length !== 1 ? "s" : ""} loaded in batch`
            : `${files.length} imagen${files.length !== 1 ? "es" : ""} en el lote`
        }
        rightSlot={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? "Change files" : "Cambiar archivos"}</span>
          </button>
        }
      />

      {/* Body: responsive sidebar + main */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-background">
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-r border-border bg-card flex flex-col overflow-y-auto order-2 lg:order-1">
          <div className="p-5 space-y-6">
            {/* Type toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Watermark Mode" : "Tipo de marca"}
              </Label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted border border-border">
                {(["text", "logo"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update({ type: t })}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      settings.type === t
                        ? "bg-card text-foreground shadow-2xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "text" ? <Type className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    <span>{t === "text" ? (isEn ? "Text" : "Texto") : "Logo PNG"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text controls */}
            {settings.type === "text" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="watermark-text-input"
                    className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {isEn ? "Watermark Text" : "Texto de la marca"}
                  </Label>
                  <textarea
                    id="watermark-text-input"
                    value={settings.text}
                    onChange={(e) => update({ text: e.target.value })}
                    rows={2}
                    placeholder="© ClearCut Studio"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Typography" : "Tipografía"}
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FONTS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => update({ fontFamily: f.value })}
                        style={{ fontFamily: f.value }}
                        className={`px-3 py-2 text-xs font-medium text-left rounded-lg border transition-colors cursor-pointer ${
                          settings.fontFamily === f.value
                            ? "bg-primary/10 text-primary border-primary font-semibold"
                            : "bg-background border-border hover:border-primary/40"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Text Color" : "Color del texto"}
                  </Label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      aria-label={isEn ? "Watermark text color" : "Color del texto de marca de agua"}
                      value={settings.color}
                      onChange={(e) => update({ color: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
                    />
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {settings.color}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Logo controls */}
            {settings.type === "logo" && (
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Logo File (PNG / WebP / SVG)" : "Archivo de logo (PNG / WebP / SVG)"}
                </Label>
                {settings.logoSrc ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-background">
                    <img
                      src={settings.logoSrc}
                      alt="Logo preview"
                      className="h-10 w-10 object-contain rounded-lg bg-muted p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {isEn ? "Logo active" : "Logo cargado"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          update({ logoSrc: null });
                          setLogoInputKey((k) => k + 1);
                        }}
                        className="text-xs text-destructive hover:underline cursor-pointer"
                      >
                        {isEn ? "Remove" : "Eliminar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-3.5 border border-dashed border-border rounded-xl text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
                  >
                    {isEn ? "+ Upload transparent PNG logo" : "+ Subir logo PNG transparente"}
                  </button>
                )}
                <input
                  key={logoInputKey}
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoFile}
                />
              </div>
            )}

            <div className="border-t border-border" />

            {/* Position grid */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Anchor Position" : "Posición de anclaje"}
              </Label>
              <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto">
                {POSITIONS.map(({ pos, label }) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => update({ position: pos })}
                    aria-label={`Position ${pos}`}
                    title={pos}
                    className={`flex items-center justify-center rounded-lg text-sm font-bold h-10 transition-all cursor-pointer ${
                      settings.position === pos
                        ? "bg-primary text-white shadow-xs"
                        : "bg-muted hover:bg-border/60 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Opacity" : "Opacidad"}
                  </Label>
                  <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                    {Math.round(settings.opacity * 100)}%
                  </span>
                </div>
                <Slider
                  min={10}
                  max={100}
                  step={1}
                  value={[Math.round(settings.opacity * 100)]}
                  onValueChange={([v]) => update({ opacity: v / 100 })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Relative Scale" : "Tamaño relativo"}
                  </Label>
                  <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                    {settings.sizePercent}%
                  </span>
                </div>
                <Slider
                  min={3}
                  max={40}
                  step={1}
                  value={[settings.sizePercent]}
                  onValueChange={([v]) => update({ sizePercent: v })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Edge Offset" : "Margen al borde"}
                  </Label>
                  <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                    {settings.marginPx}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={120}
                  step={4}
                  value={[settings.marginPx]}
                  onValueChange={([v]) => update({ marginPx: v })}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col overflow-hidden order-1 lg:order-2">
          {/* Preview canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 bg-canvas min-h-[340px]">
            <div className="relative max-w-full max-h-full">
              {previewDataUrl ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[54vh] rounded-2xl shadow-md border border-border object-contain"
                  style={{ display: "block" }}
                />
              ) : (
                <div className="w-64 h-48 rounded-2xl bg-card border border-border flex items-center justify-center">
                  <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* File list + action bar */}
          <div className="shrink-0 border-t border-border bg-card p-5 space-y-4">
            {errorMsg && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-medium"
              >
                {errorMsg}
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {isEn
                  ? `${files.length} image${files.length !== 1 ? "s" : ""} queued for batch export`
                  : `${files.length} imagen${files.length !== 1 ? "es" : ""} en cola para exportar`}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {files.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded-md text-xs font-mono text-foreground max-w-[180px] truncate"
                    title={f.name}
                  >
                    <FileImage className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {progress && !progress.done && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>{isEn ? "Processing batch..." : "Procesando lote..."}</span>
                  <span>
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {progress?.done ? (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isEn
                    ? `Download ZIP (${files.length} watermarked images)`
                    : `Descargar ZIP (${files.length} imágenes marcadas)`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProcess}
                disabled={
                  isProcessing ||
                  (settings.type === "logo" && !settings.logoSrc) ||
                  (!settings.text.trim() && settings.type === "text")
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {isEn
                        ? `Processing ${progress?.current ?? 0}/${files.length}...`
                        : `Procesando ${progress?.current ?? 0}/${files.length}...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-4 h-4" />
                    <span>
                      {isEn
                        ? `Apply watermark & build ZIP (${files.length})`
                        : `Aplicar marca de agua y generar ZIP (${files.length})`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
