"use client";

import { useState, useEffect } from "react";
import {
  Download,
  SlidersHorizontal,
  Image as ImageIcon,
  ImagePlus,
} from "lucide-react";
import {
  AspectRatioSettings,
  DEFAULT_ASPECT_RATIO_SETTINGS,
  AspectRatioType,
} from "./types";
import { processFittedImage } from "./fitter";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { WorkspaceHeader } from "@/components/studio/workspace-header";

interface EditorSectionProps {
  imageSrc: string;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export function EditorSection({
  imageSrc,
  onReset,
  onClose,
  dict,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";
  const [settings, setSettings] = useState<AspectRatioSettings>(DEFAULT_ASPECT_RATIO_SETTINGS);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [outputDims, setOutputDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const updatePreview = async () => {
      try {
        const dataUrl = await processFittedImage(imageSrc, settings);
        setPreviewSrc(dataUrl);
        const img = new Image();
        img.onload = () => setOutputDims({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = dataUrl;
      } catch (err) {
        console.error("Failed to generate preview:", err);
      }
    };

    const timeout = setTimeout(updatePreview, 90);
    return () => clearTimeout(timeout);
  }, [imageSrc, settings]);

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = await processFittedImage(imageSrc, settings);
      const a = document.createElement("a");
      a.href = dataUrl;
      const format = settings.backgroundType === "transparent" ? "png" : "jpg";
      a.download = `fitted-${settings.ratio.replace(":", "x")}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const ratioOptions: { label: string; useCase: string; value: AspectRatioType }[] = [
    {
      label: "1:1",
      useCase: isEn ? "Square · Feed & Catalog" : "Cuadrado · Feed y Catálogo",
      value: "1:1",
    },
    {
      label: "4:5",
      useCase: isEn ? "Portrait · Instagram Post" : "Vertical · Post Instagram",
      value: "4:5",
    },
    {
      label: "9:16",
      useCase: isEn ? "Vertical · Stories & Reels" : "Vertical · Stories y Reels",
      value: "9:16",
    },
    {
      label: "16:9",
      useCase: isEn ? "Widescreen · Video & Hero" : "Horizontal · Vídeo y Portada",
      value: "16:9",
    },
    {
      label: isEn ? "Original" : "Original",
      useCase: isEn ? "Preserve source ratio" : "Conservar proporción original",
      value: "original",
    },
  ];

  const bgTypes: { id: "blur" | "color" | "transparent"; label: string }[] = [
    { id: "blur", label: isEn ? "Blur Fill" : "Desenfoque" },
    { id: "color", label: isEn ? "Solid Color" : "Color sólido" },
    { id: "transparent", label: isEn ? "Transparent" : "Transparente" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="aspect-ratio-fitter"
        lang={lang}
        onClose={onClose || onReset}
        centerSlot={
          outputDims.w > 0 ? (
            <span className="font-mono text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-md bg-muted border border-border">
              {outputDims.w} × {outputDims.h} px ({settings.ratio})
            </span>
          ) : null
        }
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-lg transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isEn ? "New image" : "Nueva imagen"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing || !previewSrc}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Download" : "Descargar"}</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-background">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-r border-border bg-card flex flex-col shrink-0 order-2 lg:order-1 overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold font-heading text-foreground">
              {isEn ? "Frame & Backdrop" : "Encuadre y relleno"}
            </h2>
          </div>

          <div className="p-5 space-y-6">
            {/* Aspect Ratio */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Target Aspect Ratio" : "Proporción de salida"}
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {ratioOptions.map((opt) => {
                  const active = settings.ratio === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, ratio: opt.value }))}
                      className={`px-3.5 py-2.5 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                        active
                          ? "bg-primary/10 text-primary border-primary shadow-2xs"
                          : "bg-background text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.useCase}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Scale */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Subject Scale (Padding)" : "Escala interior (Margen)"}
                </Label>
                <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                  {settings.scale}%
                </span>
              </div>
              <Slider
                min={10}
                max={100}
                step={1}
                value={[settings.scale]}
                onValueChange={([val]) => setSettings((s) => ({ ...s, scale: val }))}
              />
            </div>

            {/* Background Type */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Backdrop Fill Mode" : "Modo de relleno del lienzo"}
              </Label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-xl border border-border">
                {bgTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, backgroundType: type.id }))}
                    className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      settings.backgroundType === type.id
                        ? "bg-card text-foreground shadow-2xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blur Amount */}
            {settings.backgroundType === "blur" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Blur Intensity" : "Intensidad de desenfoque"}
                  </Label>
                  <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                    {settings.blurAmount}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[settings.blurAmount]}
                  onValueChange={([val]) => setSettings((s) => ({ ...s, blurAmount: val }))}
                />
              </div>
            )}

            {/* Color Picker */}
            {settings.backgroundType === "color" && (
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Backdrop Color" : "Color de fondo"}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "#ffffff",
                    "#0f172a",
                    "#f8fafc",
                    "#e2e8f0",
                    "#2563eb",
                    "#15803d",
                    "#b91c1c",
                    "#f59e0b",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      onClick={() => setSettings((s) => ({ ...s, backgroundColor: c }))}
                      className={`w-7 h-7 rounded-lg border shadow-2xs cursor-pointer ${
                        settings.backgroundColor === c
                          ? "ring-2 ring-primary ring-offset-1"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    aria-label={isEn ? "Custom color" : "Color personalizado"}
                    value={settings.backgroundColor}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, backgroundColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                  />
                  <span className="text-xs text-foreground uppercase font-mono font-semibold">
                    {settings.backgroundColor}
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 bg-canvas relative flex items-center justify-center p-4 sm:p-8 min-h-[46vh] order-1 lg:order-2">
          {settings.backgroundType === "transparent" && (
            <div className="absolute inset-0 pointer-events-none checkerboard opacity-60" />
          )}

          <div className="relative flex items-center justify-center w-full h-full max-h-[75vh]">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt={isEn ? "Fitted aspect ratio preview" : "Vista previa ajustada"}
                className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg border border-border"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs font-medium">
                  {isEn ? "Rendering canvas..." : "Renderizando lienzo..."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
