"use client";

import { useState, useRef, useCallback } from "react";
import { toPng, toJpeg, toBlob } from "html-to-image";
import {
  Download,
  RotateCcw,
  ChevronDown,
  Clipboard,
  Check,
  ImagePlus,
} from "lucide-react";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { FrameCanvas } from "./frame-canvas";
import { FramedSettings, BACKGROUNDS } from "./types";
import { WorkspaceHeader } from "@/components/studio/workspace-header";

interface EditorSectionProps {
  originalImage: string;
  onReset: () => void;
  onNewImage: () => void;
  lang?: string;
}

type ExportFormat = "png" | "jpg" | "webp";
type ExportScale = 1 | 2 | 3;

const DEFAULT_SETTINGS: FramedSettings = {
  frameStyle: "none",
  background: BACKGROUNDS[1].value,
  padding: 64,
  rounded: 16,
  shadow: 50,
  shadowType: "spread",
  shadowColor: "#000000",
  aspectRatio: "auto",
  zoom: 100,
  tiltX: 0,
  tiltY: 0,
  offsetX: 0,
  offsetY: 0,
  filterEffect: "none",
  deviceColor: "black",
  browserUrl: "https://studio.fabianh.me",
};

export function EditorSection({
  originalImage,
  onReset,
  onNewImage,
  lang = "es",
}: EditorSectionProps) {
  const isEn = lang === "en";
  const [settings, setSettings] = useState<FramedSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportScale, setExportScale] = useState<ExportScale>(2);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(
    async (format: ExportFormat = exportFormat, scale: ExportScale = exportScale) => {
      if (!canvasRef.current) return;
      setIsExporting(true);
      setShowExportMenu(false);
      try {
        let dataUrl: string;
        const opts = { pixelRatio: scale };
        if (format === "jpg") {
          dataUrl = await toJpeg(canvasRef.current, { ...opts, quality: 0.95 });
        } else {
          dataUrl = await toPng(canvasRef.current, opts);
        }
        const link = document.createElement("a");
        link.download = `framed-${Date.now()}.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Export error", err);
      } finally {
        setIsExporting(false);
      }
    },
    [exportFormat, exportScale]
  );

  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await toBlob(canvasRef.current, { pixelRatio: 2 });
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error", err);
    }
  }, []);

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-background flex flex-col text-foreground">
      <WorkspaceHeader
        slug="mockup-generator"
        lang={lang}
        onClose={onReset}
        centerSlot={
          <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md border border-border text-xs font-mono text-muted-foreground">
            <span className="capitalize">{settings.frameStyle}</span>
            <span>·</span>
            <span>{settings.aspectRatio}</span>
            <span>·</span>
            <span>{settings.padding}px</span>
          </div>
        }
        rightSlot={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onNewImage}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-lg transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "New image" : "Nueva imagen"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-card hover:bg-muted rounded-lg border border-border transition-colors cursor-pointer"
              title={isEn ? "Copy to clipboard" : "Copiar al portapapeles"}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <Clipboard className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {copied ? (isEn ? "Copied!" : "¡Copiado!") : isEn ? "Copy" : "Copiar"}
              </span>
            </button>

            {/* Export button + dropdown */}
            <div className="relative">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleExport()}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-l-lg transition-colors cursor-pointer"
                >
                  {isExporting ? (
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isEn ? "Export" : "Exportar"} {exportScale}x {exportFormat.toUpperCase()}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={isEn ? "Export options" : "Opciones de exportación"}
                  onClick={() => setShowExportMenu((v) => !v)}
                  className="flex items-center justify-center w-7 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-r-lg border-l border-white/20 transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 bg-card border border-border rounded-xl shadow-lg p-3 w-52 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {isEn ? "Format" : "Formato"}
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        {(["png", "jpg", "webp"] as ExportFormat[]).map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setExportFormat(f)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                              exportFormat === f
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {isEn ? "Resolution Scale" : "Escala de resolución"}
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        {([1, 2, 3] as ExportScale[]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setExportScale(s)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              exportScale === s
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExport()}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {isEn ? "Download Now" : "Descargar ahora"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full lg:w-72 shrink-0 lg:h-full border-t lg:border-t-0 lg:border-r border-border overflow-hidden order-2 lg:order-1">
          <LeftSidebar
            settings={settings}
            setSettings={setSettings}
            onNewImage={onNewImage}
          />
        </div>

        {/* Canvas Area */}
        <div className="w-full h-[50vh] lg:h-auto lg:flex-1 min-h-0 overflow-hidden relative flex items-center justify-center bg-canvas shrink-0 order-1 lg:order-2">
          <div className="absolute inset-0 pointer-events-none studio-grid opacity-70" />
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-6">
            <FrameCanvas
              ref={canvasRef}
              imageSrc={originalImage}
              settings={settings}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-64 shrink-0 lg:h-full border-t lg:border-t-0 lg:border-l border-border overflow-hidden order-3">
          <RightSidebar settings={settings} setSettings={setSettings} />
        </div>
      </main>
    </div>
  );
}
