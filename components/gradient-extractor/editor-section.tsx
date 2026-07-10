"use client";

import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, Copy, Check, Palette } from "lucide-react";
import { GradientSettings, DEFAULT_GRADIENT_SETTINGS, GradientType } from "./types";
import { extractColors, generateGradientCSS } from "./extractor";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EditorSectionProps {
  imageSrc: string;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
}

export function EditorSection({ imageSrc, onReset, onClose, dict }: EditorSectionProps) {
  const [settings, setSettings] = useState<GradientSettings>(DEFAULT_GRADIENT_SETTINGS);
  const [colors, setColors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    let active = true;
    const processImage = async () => {
      setIsProcessing(true);
      try {
        const extractedColors = await extractColors(imageSrc, settings.colorCount);
        if (active) {
          setColors(extractedColors);
        }
      } catch (err) {
        console.error("Failed to extract colors:", err);
      } finally {
        if (active) setIsProcessing(false);
      }
    };
    
    // Add small delay to prevent rapid processing when sliding color count
    const timeout = setTimeout(processImage, 150);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [imageSrc, settings.colorCount]);

  const cssString = generateGradientCSS(colors, settings.type, settings.angle);

  const handleCopy = useCallback(async () => {
    if (!cssString || cssString === "none") return;
    try {
      await navigator.clipboard.writeText(`background: ${cssString};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }, [cssString]);

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
                 <path d="M12 2L2 22h20L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Gradient Extractor</h1>
              <p className="text-xs text-muted-foreground font-accent">CSS Generator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main App */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8fafc]">
      {/* Left Sidebar */}
      <div className="w-full md:w-80 border-r border-border bg-card flex flex-col flex-shrink-0 h-[40vh] md:h-full overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-bold">Settings</h2>
          </div>
          <button onClick={onReset} className="text-xs font-medium text-muted-foreground hover:text-foreground">
            New Image
          </button>
        </div>
        
        <div className="p-5 space-y-8">
          {/* Gradient Type */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gradient Type</Label>
            <div className="flex gap-2">
              {(["linear", "radial"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSettings(s => ({ ...s, type }))}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md capitalize transition-colors border ${
                    settings.type === type
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground/30"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Angle (only for linear) */}
          {settings.type === "linear" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Angle</Label>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{settings.angle}°</span>
              </div>
              <Slider
                min={0}
                max={360}
                step={1}
                value={[settings.angle]}
                onValueChange={([val]) => setSettings(s => ({ ...s, angle: val }))}
              />
            </div>
          )}

          {/* Color Count */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Colors</Label>
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{settings.colorCount}</span>
            </div>
            <Slider
              min={2}
              max={5}
              step={1}
              value={[settings.colorCount]}
              onValueChange={([val]) => setSettings(s => ({ ...s, colorCount: val }))}
            />
          </div>
          
          <div className="space-y-3 pt-4 border-t border-border/50">
             <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original Image</Label>
             <div className="rounded-lg overflow-hidden border border-border shadow-sm max-h-[120px] flex items-center justify-center bg-black/5">
                <img src={imageSrc} alt="Original" className="max-w-full max-h-[120px] object-contain" />
             </div>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-[#e2e8f0] flex flex-col p-6 overflow-hidden">
        
        {/* CSS Code Snippet */}
        <div className="bg-card border border-border rounded-xl shadow-sm mb-6 flex-shrink-0 flex items-center overflow-hidden">
           <div className="flex-1 p-4 font-mono text-sm text-foreground overflow-x-auto whitespace-nowrap hide-scrollbar">
              <span className="text-blue-500">background</span>: {cssString};
           </div>
           <button 
             onClick={handleCopy}
             className="px-6 py-4 bg-foreground text-background font-bold text-sm h-full flex items-center gap-2 transition-colors hover:bg-foreground/90 shrink-0"
           >
             {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy CSS</>}
           </button>
        </div>
        
        {/* Extracted Colors Palette */}
        <div className="flex items-center gap-4 mb-6 shrink-0 justify-center">
           {isProcessing ? (
             <div className="flex gap-2 animate-pulse">
                {[...Array(settings.colorCount)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-black/10" />
                ))}
             </div>
           ) : (
             <div className="flex gap-3 bg-white p-2.5 rounded-full shadow-sm border border-border/50">
               <Palette className="w-5 h-5 text-muted-foreground ml-1 self-center" />
               <div className="w-px h-6 bg-border mx-1 self-center" />
               {colors.map((c, i) => (
                 <div 
                   key={i} 
                   className="w-10 h-10 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110 relative group"
                   style={{ backgroundColor: c }}
                   title={c}
                 >
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                     {c}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Big Preview */}
        <div 
          className="flex-1 rounded-3xl shadow-xl transition-all duration-300 relative border-4 border-white overflow-hidden"
          style={{
             background: cssString !== "none" ? cssString : "transparent"
          }}
        >
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
               <span className="text-foreground font-medium bg-background/80 px-4 py-2 rounded-full shadow-sm">Extracting Colors...</span>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
