"use client";

import { useState, useRef, useCallback } from "react";
import { toPng, toJpeg, toBlob } from "html-to-image";
import {
  Download,
  RotateCcw,
  Copy,
  ChevronDown,
  Monitor,
  Clipboard,
  Check,
} from "lucide-react";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { FrameCanvas } from "./frame-canvas";
import { FramedSettings, BACKGROUNDS } from "./types";

interface EditorSectionProps {
  originalImage: string;
  onReset: () => void;
  onNewImage: () => void;
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
  browserUrl: "https://yourapp.com",
};

export function EditorSection({ originalImage, onReset, onNewImage }: EditorSectionProps) {
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
        alert("Export failed. Make sure the image doesn't have CORS issues.");
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
    <div className="h-screen max-h-screen overflow-hidden bg-background flex flex-col font-accent text-foreground">

      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0 h-14">
        {/* Left: Logo + Start Over */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Monitor size={14} />
            </div>
            <span className="text-sm font-bold text-foreground font-heading">Framed</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <RotateCcw size={12} />
            Start Over
          </button>
        </div>

        {/* Center: Frame info pill */}
        <div className="hidden lg:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-[10px] font-semibold text-muted-foreground">
          <span className="capitalize">{settings.frameStyle}</span>
          <span className="text-border">·</span>
          <span>{settings.aspectRatio}</span>
          <span className="text-border">·</span>
          <span>{settings.padding}px padding</span>
        </div>

        {/* Right: Copy + Export */}
        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-border transition-all"
            title="Copy to clipboard"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Clipboard size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>

          {/* Export button + dropdown */}
          <div className="relative">
            <div className="flex">
              <button
                onClick={() => handleExport()}
                disabled={isExporting}
                className="flex items-center gap-1.5 pl-4 pr-2 py-2 bg-foreground hover:bg-foreground/90 disabled:opacity-50 text-background text-xs font-bold rounded-l-full transition-colors"
              >
                {isExporting ? (
                  <RotateCcw size={12} className="animate-spin" />
                ) : (
                  <Download size={12} />
                )}
                Export {exportScale}x {exportFormat.toUpperCase()}
              </button>
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center justify-center w-8 py-2 bg-foreground hover:bg-foreground/90 text-background rounded-r-full border-l border-background/20 transition-colors"
              >
                <ChevronDown size={12} />
              </button>
            </div>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-20 bg-card border border-border rounded-2xl shadow-xl p-3 w-52 space-y-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Format</p>
                    <div className="grid grid-cols-3 gap-1">
                      {(["png", "jpg", "webp"] as ExportFormat[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => setExportFormat(f)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            exportFormat === f
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Scale</p>
                    <div className="grid grid-cols-3 gap-1">
                      {([1, 2, 3] as ExportScale[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setExportScale(s)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            exportScale === s
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleExport()}
                    className="w-full py-2 bg-foreground text-background text-xs font-bold rounded-xl transition-colors hover:bg-foreground/90"
                  >
                    Export Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

        {/* Left Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 lg:h-full border-b lg:border-b-0 lg:border-r border-border overflow-hidden order-2 lg:order-1">
          <LeftSidebar settings={settings} setSettings={setSettings} onNewImage={onNewImage} />
        </div>

        {/* Canvas Area — no scroll, clips overflow */}
        <div className="w-full h-[50vh] lg:h-auto lg:flex-1 min-h-0 overflow-hidden relative flex items-center justify-center bg-[#f8fafc] shrink-0 order-1 lg:order-2">
          {/* Dot grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: 0.6,
            }}
          />
          {/* Gradient vignette over the grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 50%, #f8fafc 100%)",
            }}
          />

          {/* Canvas — fixed size, no min-h-full so it doesn't force scroll */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
            <FrameCanvas ref={canvasRef} imageSrc={originalImage} settings={settings} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 lg:h-full border-t lg:border-t-0 lg:border-l border-border overflow-hidden order-3">
          <RightSidebar settings={settings} setSettings={setSettings} />
        </div>
      </main>
    </div>
  );
}
