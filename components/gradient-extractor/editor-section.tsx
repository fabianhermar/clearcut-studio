"use client";

import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, Copy, Check, ImagePlus } from "lucide-react";
import { GradientSettings, DEFAULT_GRADIENT_SETTINGS } from "./types";
import {
  extractDetailedColors,
  generateGradientCSS,
  type ExtractedColor,
} from "./extractor";
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
  const [settings, setSettings] = useState<GradientSettings>(DEFAULT_GRADIENT_SETTINGS);
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const processImage = async () => {
      setIsProcessing(true);
      try {
        const extracted = await extractDetailedColors(imageSrc, settings.colorCount);
        if (active) {
          setPalette(extracted);
        }
      } catch (err) {
        console.error("Failed to extract colors:", err);
      } finally {
        if (active) setIsProcessing(false);
      }
    };

    const timeout = setTimeout(processImage, 120);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [imageSrc, settings.colorCount]);

  const hexColors = palette.map((c) => c.hex);
  const cssString = generateGradientCSS(hexColors, settings.type, settings.angle);

  const copyText = useCallback(async (text: string, tokenKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenKey);
      setTimeout(() => setCopiedToken(null), 1800);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="gradient-extractor"
        lang={lang}
        onClose={onClose || onReset}
        rightSlot={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-lg transition-colors cursor-pointer"
          >
            <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? "New image" : "Nueva imagen"}</span>
          </button>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-background">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-r border-border bg-card flex flex-col shrink-0 order-2 lg:order-1 overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold font-heading text-foreground">
              {isEn ? "Gradient Parameters" : "Parámetros del degradado"}
            </h2>
          </div>

          <div className="p-5 space-y-6">
            {/* Gradient Type */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Gradient Type" : "Tipo de degradado"}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(["linear", "radial"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, type }))}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg capitalize transition-colors border cursor-pointer ${
                      settings.type === type
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {type === "linear"
                      ? isEn
                        ? "Linear"
                        : "Lineal"
                      : isEn
                      ? "Radial"
                      : "Radial"}
                  </button>
                ))}
              </div>
            </div>

            {/* Angle */}
            {settings.type === "linear" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isEn ? "Angle" : "Ángulo"}
                  </Label>
                  <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                    {settings.angle}°
                  </span>
                </div>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[settings.angle]}
                  onValueChange={([val]) => setSettings((s) => ({ ...s, angle: val }))}
                />
              </div>
            )}

            {/* Color Count */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Extracted Stops" : "Número de colores"}
                </Label>
                <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                  {settings.colorCount}
                </span>
              </div>
              <Slider
                min={2}
                max={5}
                step={1}
                value={[settings.colorCount]}
                onValueChange={([val]) => setSettings((s) => ({ ...s, colorCount: val }))}
              />
            </div>

            {/* Source Image Preview */}
            <div className="space-y-2.5 pt-4 border-t border-border">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Source Image" : "Imagen de origen"}
              </Label>
              <div className="rounded-xl overflow-hidden border border-border bg-muted/40 p-2 flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt={isEn ? "Source" : "Origen"}
                  className="max-w-full max-h-[140px] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 bg-canvas flex flex-col p-4 sm:p-6 lg:p-8 gap-6 overflow-y-auto order-1 lg:order-2">
          {/* Gradient Preview Canvas */}
          <div
            className="w-full min-h-[240px] sm:min-h-[300px] flex-1 rounded-2xl shadow-md transition-all duration-200 relative border border-border overflow-hidden flex items-end p-5"
            style={{
              background: cssString !== "none" ? cssString : "#e2e8f0",
            }}
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-card/60 backdrop-blur-xs flex items-center justify-center">
                <span className="text-foreground text-xs font-semibold bg-card px-4 py-2 rounded-full border border-border shadow-xs">
                  {isEn ? "Sampling dominant colors..." : "Extrayendo colores dominantes..."}
                </span>
              </div>
            )}

            <div className="bg-slate-900/80 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/15 text-xs font-mono">
              {settings.type === "linear" ? `linear-gradient(${settings.angle}deg)` : "radial-gradient(circle)"} · {palette.length}{" "}
              {isEn ? "stops" : "colores"}
            </div>
          </div>

          {/* Dominant Colors Grid with HEX & RGB Copy */}
          <section aria-label={isEn ? "Extracted Color Swatches" : "Muestras de color extraídas"}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isEn
                  ? "Dominant Palette (Click HEX or RGB to copy)"
                  : "Paleta dominante (Haz clic en HEX o RGB para copiar)"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              {palette.map((color, i) => {
                const hexKey = `hex-${i}`;
                const rgbKey = `rgb-${i}`;
                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-card border border-border shadow-2xs flex items-center sm:flex-col sm:items-stretch gap-3"
                  >
                    <div
                      className="w-12 h-12 sm:w-full sm:h-16 rounded-lg border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Color ${i + 1}: ${color.hex}`}
                    />
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => copyText(color.hex, hexKey)}
                        className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/60 hover:bg-muted border border-border text-xs font-mono font-bold text-foreground transition-colors cursor-pointer"
                      >
                        <span>{color.hex}</span>
                        {copiedToken === hexKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(color.rgb, rgbKey)}
                        className="flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-md hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span className="truncate">{color.rgb}</span>
                        {copiedToken === rgbKey ? (
                          <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-60 shrink-0" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CSS Code Output */}
          <div className="bg-card border border-border rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center overflow-hidden">
            <div className="flex-1 p-4 font-mono text-xs sm:text-sm text-foreground overflow-x-auto whitespace-nowrap">
              <span className="text-primary font-semibold">background</span>: {cssString};
            </div>
            <button
              type="button"
              onClick={() => copyText(`background: ${cssString};`, "css")}
              className="px-5 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
            >
              {copiedToken === "css" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEn ? "Copied CSS!" : "¡CSS copiado!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isEn ? "Copy CSS" : "Copiar CSS"}</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
