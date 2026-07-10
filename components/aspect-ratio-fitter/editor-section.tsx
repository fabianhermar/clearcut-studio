"use client";

import { useState, useEffect, useRef } from "react";
import { Download, SlidersHorizontal, Image as ImageIcon } from "lucide-react";
import { AspectRatioSettings, DEFAULT_ASPECT_RATIO_SETTINGS, AspectRatioType } from "./types";
import { processFittedImage } from "./fitter";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EditorSectionProps {
  imageSrc: string;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
}

export function EditorSection({ imageSrc, onReset, onClose, dict }: EditorSectionProps) {
  const [settings, setSettings] = useState<AspectRatioSettings>(DEFAULT_ASPECT_RATIO_SETTINGS);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref for the preview container to scale the image down via CSS
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate preview whenever settings or image changes
    const updatePreview = async () => {
      try {
        const dataUrl = await processFittedImage(imageSrc, settings);
        setPreviewSrc(dataUrl);
      } catch (err) {
        console.error("Failed to generate preview:", err);
      }
    };
    
    // Simple debounce to avoid spamming canvas operations
    const timeout = setTimeout(() => {
      updatePreview();
    }, 100);
    return () => clearTimeout(timeout);
  }, [imageSrc, settings]);

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      // Re-generate in case preview is outdated or compressed, though dataUrl is exact
      const dataUrl = await processFittedImage(imageSrc, settings);
      const a = document.createElement("a");
      a.href = dataUrl;
      const format = settings.backgroundType === "transparent" ? "png" : "jpg";
      a.download = `fitted-image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to download image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const ratioOptions: { label: string; value: AspectRatioType }[] = [
    { label: "1:1 Square", value: "1:1" },
    { label: "4:5 Portrait", value: "4:5" },
    { label: "9:16 Story/Reels", value: "9:16" },
    { label: "16:9 Video", value: "16:9" },
    { label: "Original", value: "original" },
  ];

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
                 <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Aspect Ratio Fitter</h1>
              <p className="text-xs text-muted-foreground font-accent">Social Media Editor</p>
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
            <h2 className="text-sm font-bold">Adjustments</h2>
          </div>
          <button onClick={onReset} className="text-xs font-medium text-muted-foreground hover:text-foreground">
            New Image
          </button>
        </div>
        
        <div className="p-5 space-y-8">
          {/* Aspect Ratio */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aspect Ratio</Label>
            <div className="flex flex-col gap-2">
              {ratioOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSettings(s => ({ ...s, ratio: opt.value }))}
                  className={`px-3 py-2 text-sm font-medium rounded-md text-left transition-colors border ${
                    settings.ratio === opt.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Image Scale</Label>
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{settings.scale}%</span>
            </div>
            <Slider
              min={10}
              max={100}
              step={1}
              value={[settings.scale]}
              onValueChange={([val]) => setSettings(s => ({ ...s, scale: val }))}
            />
          </div>

          {/* Background Type */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Background</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["blur", "color", "transparent"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSettings(s => ({ ...s, backgroundType: type }))}
                  className={`px-2 py-1.5 text-xs font-medium rounded capitalize border ${
                    settings.backgroundType === type
                      ? "bg-muted text-foreground border-border shadow-sm"
                      : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Background Options */}
          {settings.backgroundType === "blur" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Blur Amount</Label>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{settings.blurAmount}px</span>
              </div>
              <Slider
                min={0}
                max={50}
                step={1}
                value={[settings.blurAmount]}
                onValueChange={([val]) => setSettings(s => ({ ...s, blurAmount: val }))}
              />
            </div>
          )}

          {settings.backgroundType === "color" && (
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Color</Label>
              <div className="flex gap-2">
                {["#ffffff", "#000000", "#f1f5f9", "#e2e8f0", "#94a3b8", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSettings(s => ({ ...s, backgroundColor: c }))}
                    className={`w-6 h-6 rounded-full border shadow-sm ${settings.backgroundColor === c ? "ring-2 ring-foreground ring-offset-1" : "border-border"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <input 
                   type="color" 
                   value={settings.backgroundColor}
                   onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                   className="w-8 h-8 rounded cursor-pointer"
                 />
                 <span className="text-xs text-muted-foreground uppercase font-mono">{settings.backgroundColor}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-[#e2e8f0] relative flex items-center justify-center p-8 overflow-hidden">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleDownload}
            disabled={isProcessing || !previewSrc}
            className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-full transition-all hover:bg-foreground/90 active:scale-95 shadow-lg disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : <><Download size={16} /> Download</>}
          </button>
        </div>

        {/* Checkerboard for transparent backgrounds */}
        {settings.backgroundType === "transparent" && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), repeating-linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%, #ccc)',
              backgroundPosition: '0 0, 10px 10px',
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {/* Canvas Preview Box */}
        <div 
          ref={containerRef}
          className="relative flex items-center justify-center w-full h-full"
        >
          {previewSrc ? (
            <img 
              src={previewSrc} 
              alt="Fitted Preview" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-all duration-200"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground animate-pulse">
              <ImageIcon size={48} className="opacity-20 mb-4" />
              <p className="text-sm">Generating preview...</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
