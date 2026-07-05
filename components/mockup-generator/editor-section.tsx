"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, RotateCcw } from "lucide-react";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { FrameCanvas } from "./frame-canvas";
import { FramedSettings, BACKGROUNDS } from "./types";

interface EditorSectionProps {
  originalImage: string;
  onReset: () => void;
  onNewImage: () => void;
}

export function EditorSection({ originalImage, onReset, onNewImage }: EditorSectionProps) {
  const [settings, setSettings] = useState<FramedSettings>({
    frameStyle: "macos",
    background: BACKGROUNDS[1].value, // Sunset Mesh
    padding: 64,
    rounded: 16,
    shadow: 40,
    shadowType: "spread",
    aspectRatio: "auto",
    zoom: 100,
    tiltX: 0,
    tiltY: 0,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2, // Export at high resolution
        backgroundColor: settings.background === 'transparent' ? 'transparent' : undefined,
        // Optional: filter out any nodes that might cause issues, but we removed backdrop-filter from frame-canvas already
      });
      
      const link = document.createElement("a");
      link.download = `framed-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error exportando imagen", err);
      alert("Hubo un error al exportar la imagen. Verifica que la imagen sea local y no tenga problemas de CORS.");
    } finally {
      setIsExporting(false);
    }
  }, [settings.background]);

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-background flex flex-col font-accent text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="px-4 py-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-semibold"
          >
            <RotateCcw size={16} />
            Start Over
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-foreground hover:bg-foreground/90 disabled:bg-foreground/50 text-background text-sm font-bold rounded-full transition-colors shadow-sm"
          >
            {isExporting ? (
              <RotateCcw size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting ? "Exporting..." : "Export HD"}
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 order-2 lg:order-1 h-64 lg:h-auto">
          <LeftSidebar settings={settings} setSettings={setSettings} onNewImage={onNewImage} />
        </div>

        {/* Editor Area (Center) */}
        <div className="flex-1 overflow-auto bg-muted/40 p-4 sm:p-8 flex items-center justify-center relative pattern-grid-lg order-1 lg:order-2 min-h-[50vh] lg:min-h-0">
          {/* Fondo cuadriculado global suave */}
          <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(#000 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #000 0 1px, transparent 1px 100%)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 w-full max-w-5xl flex items-center justify-center">
            <FrameCanvas ref={canvasRef} imageSrc={originalImage} settings={settings} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 order-3 lg:order-3 h-64 lg:h-auto">
          <RightSidebar settings={settings} setSettings={setSettings} />
        </div>
      </main>
    </div>
  );
}
