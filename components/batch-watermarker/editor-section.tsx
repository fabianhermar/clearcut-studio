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
import { Download, RefreshCw, Type, Image as ImageIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface EditorSectionProps {
  files: File[];
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
}

// ─── 3×3 Position Grid ─────────────────────────────────────────────────────

const POSITIONS: { pos: Position; label: string }[] = [
  { pos: "top-left", label: "↖" },
  { pos: "top-center", label: "↑" },
  { pos: "top-right", label: "↗" },
  { pos: "middle-left", label: "←" },
  { pos: "center", label: "·" },
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

// ─── Component ──────────────────────────────────────────────────────────────

export function EditorSection({ files, onReset, onClose }: EditorSectionProps) {
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; done: boolean; zipUrl: string | null } | null>(null);
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [, startTransition] = useTransition();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load scaled preview of the first file once
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

  // Repaint preview canvas whenever settings or previewDataUrl change
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
      startTransition(() => { repaintCanvas(); });
    }, 100);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [settings, previewDataUrl, repaintCanvas]);

  const update = (patch: Partial<WatermarkSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ logoSrc: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    setProgress({ current: 0, total: files.length, done: false, zipUrl: null });
    try {
      const zipBlob = await processAndZip(files, settings, (current) => {
        setProgress((prev) => prev ? { ...prev, current } : null);
      });
      const url = URL.createObjectURL(zipBlob);
      setProgress({ current: files.length, total: files.length, done: true, zipUrl: url });
    } catch (err) {
      console.error(err);
      setProgress(null);
      alert("Error al procesar las imágenes.");
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
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground" title="Volver al inicio">
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
              <p className="text-xs text-muted-foreground font-accent">{files.length} imagen{files.length !== 1 ? "es" : ""} en el lote</p>
            </div>
          </div>
        </div>
        <button onClick={onReset} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
          <RefreshCw size={14} />
          Cambiar archivos
        </button>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex-1 flex overflow-hidden bg-[#f8fafc]">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-72 xl:w-80 shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
          <div className="p-5 space-y-6">

            {/* Type toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Tipo de marca</Label>
              <div className="flex rounded-xl border border-border overflow-hidden">
                {(["text", "logo"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ type: t })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-colors ${
                      settings.type === t
                        ? "bg-foreground text-background"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t === "text" ? <Type size={13} /> : <ImageIcon size={13} />}
                    {t === "text" ? "Texto" : "Logo"}
                  </button>
                ))}
              </div>
            </div>

            {/* Text controls */}
            {settings.type === "text" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Texto</Label>
                  <textarea
                    value={settings.text}
                    onChange={(e) => update({ text: e.target.value })}
                    rows={2}
                    placeholder="© Mi Marca 2024"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Fuente</Label>
                  <div className="flex flex-col gap-1">
                    {FONTS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => update({ fontFamily: f.value })}
                        style={{ fontFamily: f.value }}
                        className={`px-3 py-2 text-sm text-left rounded-lg border transition-colors ${
                          settings.fontFamily === f.value
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background border-border hover:border-foreground/30"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(e) => update({ color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
                    />
                    <span className="text-sm font-mono text-muted-foreground">{settings.color}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logo controls */}
            {settings.type === "logo" && (
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Archivo de logo (PNG)</Label>
                {settings.logoSrc ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-background">
                    <img src={settings.logoSrc} alt="Logo preview" className="h-10 w-10 object-contain rounded-lg bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">Logo cargado</p>
                      <button
                        onClick={() => { update({ logoSrc: null }); setLogoInputKey((k) => k + 1); }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors font-accent"
                  >
                    + Subir logo PNG
                  </button>
                )}
                <input key={logoInputKey} ref={logoInputRef} type="file" accept="image/png,image/webp,image/svg+xml" className="hidden" onChange={handleLogoFile} />
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Position grid */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Posición</Label>
              <div className="grid grid-cols-3 gap-1.5 aspect-square w-full max-w-[140px] mx-auto">
                {POSITIONS.map(({ pos, label }) => (
                  <button
                    key={pos}
                    onClick={() => update({ position: pos })}
                    title={pos}
                    className={`flex items-center justify-center rounded-lg text-lg h-10 transition-all ${
                      settings.position === pos
                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-95"
                        : "bg-muted hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Opacidad</Label>
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{Math.round(settings.opacity * 100)}%</span>
                </div>
                <Slider min={10} max={100} step={1} value={[Math.round(settings.opacity * 100)]} onValueChange={([v]) => update({ opacity: v / 100 })} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Tamaño</Label>
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{settings.sizePercent}%</span>
                </div>
                <Slider min={3} max={40} step={1} value={[settings.sizePercent]} onValueChange={([v]) => update({ sizePercent: v })} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading">Margen</Label>
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{settings.marginPx}px</span>
                </div>
                <Slider min={0} max={120} step={4} value={[settings.marginPx]} onValueChange={([v]) => update({ marginPx: v })} />
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN AREA ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#f8fafc]">
            <div className="relative max-w-full max-h-full">
              {previewDataUrl ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[55vh] rounded-2xl shadow-xl ring-1 ring-border object-contain"
                  style={{ display: "block" }}
                />
              ) : (
                <div className="w-64 h-48 rounded-2xl bg-muted flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* File list + action area */}
          <div className="shrink-0 border-t border-border bg-card p-5 space-y-4">
            {/* File chips */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-heading mb-2">
                {files.length} imagen{files.length !== 1 ? "es" : ""} en el lote
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {files.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted border border-border rounded-full text-xs font-accent text-muted-foreground max-w-[140px] truncate"
                    title={f.name}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="m3 9 4-4 4 4 4-4 4 4" />
                    </svg>
                    {f.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {progress && !progress.done && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-accent text-muted-foreground">
                  <span>Procesando...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            {progress?.done ? (
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-success text-white font-bold text-sm rounded-2xl hover:bg-success/90 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <Download size={18} />
                Descargar ZIP ({files.length} imágenes listas)
              </button>
            ) : (
              <button
                onClick={handleProcess}
                disabled={isProcessing || (settings.type === "logo" && !settings.logoSrc) || !settings.text.trim() && settings.type === "text"}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-foreground text-background font-bold text-sm rounded-2xl hover:bg-foreground/90 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 relative overflow-hidden group"
              >
                {!isProcessing && (
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Procesando {progress?.current ?? 0}/{files.length}…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21l4-4m0 0L18 6a2 2 0 0 0-3-3L4 17m3 0L3 21" />
                      <path d="M14 4l6 6" />
                    </svg>
                    Aplicar marca de agua — {files.length} imagen{files.length !== 1 ? "es" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
