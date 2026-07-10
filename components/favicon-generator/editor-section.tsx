"use client";

import { useState, useRef } from "react";
import { Download, SlidersHorizontal, Eye, ImagePlus, X } from "lucide-react";
import { FaviconSettings, DEFAULT_FAVICON_SETTINGS } from "./types";
import { generateFavicons } from "./generator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EditorSectionProps {
  imageSrc: string;
  onReset: () => void;
  onClose?: () => void;
  dict?: any;
}

export function EditorSection({ imageSrc, onReset, onClose, dict }: EditorSectionProps) {
  const [settings, setSettings] = useState<FaviconSettings>(DEFAULT_FAVICON_SETTINGS);
  const [darkImageSrc, setDarkImageSrc] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<{ zipBlob: Blob; htmlCode: string } | null>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  const handleDarkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDarkImageSrc(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generateFavicons(imageSrc, darkImageSrc, settings);
      setExportData(data);
      setShowExportModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate favicons.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadZip = () => {
    if (!exportData) return;
    const url = URL.createObjectURL(exportData.zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicons.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                 <path d="M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12" />
                 <path d="M4 22h16" />
                 <path d="M12 8v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-heading">Favicon Generator</h1>
              <p className="text-xs text-muted-foreground font-accent">Icon Creator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main App */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8fafc]">
      {/* Left Sidebar (Settings) */}
      <div className="w-full md:w-80 border-r border-border bg-card flex flex-col flex-shrink-0 h-[40vh] md:h-full overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-bold">Settings</h2>
        </div>
        
        <div className="p-5 space-y-8">
          {/* Padding */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Image Margin</Label>
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{settings.padding}%</span>
            </div>
            <Slider
              min={0}
              max={40}
              step={1}
              value={[settings.padding]}
              onValueChange={([val]) => setSettings((s) => ({ ...s, padding: val }))}
            />
          </div>

          {/* Dark Mode Icon */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dark Theme Icon</Label>
            </div>
            {darkImageSrc ? (
              <div className="flex items-center justify-between p-2 border border-border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-black/10 flex items-center justify-center overflow-hidden">
                    <img src={darkImageSrc} alt="Dark Icon" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Custom Dark Icon</span>
                </div>
                <button
                  onClick={() => setDarkImageSrc(null)}
                  className="p-1.5 hover:bg-black/5 rounded-full text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => darkFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium border border-dashed border-border rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <ImagePlus size={14} /> Add dark theme icon
                </button>
                <input
                  type="file"
                  ref={darkFileInputRef}
                  onChange={handleDarkFile}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                  Optional: Upload a different icon for users in Dark Mode.
                </p>
              </div>
            )}
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.backgroundColor === "transparent" ? "#ffffff" : settings.backgroundColor}
                onChange={(e) => setSettings((s) => ({ ...s, backgroundColor: e.target.value }))}
                className="w-8 h-8 rounded border-none cursor-pointer p-0"
              />
              <button
                onClick={() => setSettings((s) => ({ ...s, backgroundColor: "transparent" }))}
                className={`px-3 py-1.5 text-xs font-medium rounded border ${settings.backgroundColor === "transparent" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"}`}
              >
                Transparent
              </button>
            </div>
          </div>

          {/* App Name */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">App Name</Label>
            </div>
            <input
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings((s) => ({ ...s, appName: e.target.value }))}
              placeholder="My Awesome App"
              className="w-full text-xs font-medium bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Theme Color */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme Color (Android/Web)</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.themeColor}
                onChange={(e) => setSettings((s) => ({ ...s, themeColor: e.target.value }))}
                className="w-8 h-8 rounded border-none cursor-pointer p-0"
              />
              <span className="text-xs font-mono">{settings.themeColor}</span>
            </div>
          </div>

          {/* Favicon Path */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Favicon Path</Label>
            </div>
            <input
              type="text"
              value={settings.path}
              onChange={(e) => setSettings((s) => ({ ...s, path: e.target.value }))}
              placeholder="/assets/favicons/"
              className="w-full text-xs font-mono bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground leading-tight">
              Path where files will be hosted (e.g. <code>/</code> or <code>/assets/</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Center Previews */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye size={18} />
            <h2 className="text-lg font-bold text-foreground">Previews</h2>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-full transition-all hover:bg-foreground/90 active:scale-95 shadow-lg disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : <><Download size={16} /> Generate Favicons</>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Desktop Browser (Light & Dark) */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">Desktop Browser</h3>
              <p className="text-xs text-muted-foreground mt-1">Standard 16x16 favicon in Chrome.</p>
            </div>
            <div className="p-4 flex flex-col gap-6 bg-white">
              {/* Light Theme */}
              <div className="w-full">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Light Theme</p>
                <div className="bg-[#dee1e6] rounded-t-lg pt-2 px-2 flex items-end w-full overflow-hidden">
                  <div className="bg-white rounded-t-lg min-w-[140px] max-w-[220px] w-full px-3 py-1.5 flex items-center gap-2 shrink-0">
                    <PreviewIcon size={16} settings={settings} imageSrc={imageSrc} />
                    <span className="text-xs text-[#3c4043] font-medium truncate">{settings.appName}</span>
                    <div className="ml-auto shrink-0 w-4 h-4 rounded-full hover:bg-black/5 flex items-center justify-center text-black/50 text-[10px]">✕</div>
                  </div>
                  <div className="w-7 h-7 rounded-full ml-1.5 mb-[2px] flex items-center justify-center text-black/50 hover:bg-black/5 transition-colors shrink-0">
                    <span className="text-lg leading-none mt-[-2px]">+</span>
                  </div>
                </div>
              </div>
              
              {/* Dark Theme */}
              <div className="w-full">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Dark Theme</p>
                <div className="bg-[#202124] rounded-t-lg pt-2 px-2 flex items-end w-full overflow-hidden">
                  <div className="bg-[#323639] rounded-t-lg min-w-[140px] max-w-[220px] w-full px-3 py-1.5 flex items-center gap-2 shrink-0">
                    <PreviewIcon size={16} settings={settings} imageSrc={darkImageSrc || imageSrc} />
                    <span className="text-xs text-[#e8eaed] font-medium truncate">{settings.appName}</span>
                    <div className="ml-auto shrink-0 w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 text-[10px]">✕</div>
                  </div>
                  <div className="w-7 h-7 rounded-full ml-1.5 mb-[2px] flex items-center justify-center text-white/50 hover:bg-white/10 transition-colors shrink-0">
                    <span className="text-lg leading-none mt-[-2px]">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Google Search Result (Light & Dark) */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">Google Result</h3>
              <p className="text-xs text-muted-foreground mt-1">How it looks on search engines.</p>
            </div>
            <div className="flex flex-col h-full">
              {/* Light Theme */}
              <div className="w-full p-5 border-b border-border/50 bg-white">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Light Theme</p>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#f1f3f4] flex items-center justify-center p-1 border border-black/5 shrink-0">
                       <PreviewIcon size={18} settings={settings} imageSrc={imageSrc} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] text-[#202124] truncate">{settings.appName}</span>
                      <span className="text-[11px] text-[#4d5156] truncate">https://{settings.appName.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                  </div>
                  <h4 className="text-[16px] md:text-[18px] text-[#1a0dab] font-normal mt-1 hover:underline cursor-pointer truncate">Welcome to {settings.appName}</h4>
                  <p className="text-[13px] text-[#4d5156] leading-tight mt-1 line-clamp-2">This is a preview of how your website will appear in Google search results. The icon is prominently displayed next to the URL.</p>
                </div>
              </div>

              {/* Dark Theme */}
              <div className="w-full bg-[#202124] p-5 h-full">
                <p className="text-[10px] font-bold text-[#9aa0a6] uppercase tracking-widest mb-4">Dark Theme</p>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#303134] flex items-center justify-center p-1 border border-white/5 shrink-0">
                       <PreviewIcon size={18} settings={settings} imageSrc={darkImageSrc || imageSrc} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] text-[#e8eaed] truncate">{settings.appName}</span>
                      <span className="text-[11px] text-[#bdc1c6] truncate">https://{settings.appName.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                  </div>
                  <h4 className="text-[16px] md:text-[18px] text-[#8ab4f8] font-normal mt-1 hover:underline cursor-pointer truncate">Welcome to {settings.appName}</h4>
                  <p className="text-[13px] text-[#bdc1c6] leading-tight mt-1 line-clamp-2">This is a preview of how your website will appear in Google search results. The icon is prominently displayed next to the URL.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. iOS Home Screen */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">iOS Home Screen</h3>
              <p className="text-xs text-muted-foreground mt-1">Added to home screen on iPhone/iPad.</p>
            </div>
            <div className="p-6 bg-gradient-to-b from-[#74b9ff] to-[#0984e3] flex flex-col items-center justify-center min-h-[200px]">
              <PreviewIcon size={64} settings={{ ...settings, backgroundColor: settings.backgroundColor === "transparent" ? "#ffffff" : settings.backgroundColor, backgroundRadius: 22.5 }} imageSrc={imageSrc} forceSolidBg />
              <span className="text-[11px] text-white mt-2 font-medium tracking-wide shadow-black/20 drop-shadow-md">{settings.appName}</span>
            </div>
          </div>

          {/* 4. Android Home Screen */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">Android Home Screen</h3>
              <p className="text-xs text-muted-foreground mt-1">App drawer or home screen icon.</p>
            </div>
            <div className="p-6 bg-[#202124] flex flex-col items-center justify-center relative min-h-[200px] overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1/2 transition-colors duration-500" style={{ backgroundColor: settings.themeColor, opacity: 0.15 }} />
              <div className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center relative z-10 p-1 shadow-xl shadow-black/40 border border-white/10">
                <PreviewIcon size={64} settings={{ ...settings, backgroundRadius: 50 }} imageSrc={imageSrc} />
              </div>
              <span className="text-[11px] text-white mt-3 font-medium z-10 tracking-wide">{settings.appName}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-2">Favicons Generated!</h2>
            <p className="text-sm text-muted-foreground mb-6">Extract the ZIP file in your website's root directory, then copy this HTML code into the <code>&lt;head&gt;</code> section of your HTML document.</p>
            
            <div className="bg-muted p-4 rounded-lg relative group mb-6">
              <pre className="text-[11px] md:text-xs overflow-x-auto text-foreground font-mono">
                {exportData.htmlCode}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(exportData.htmlCode)}
                className="absolute top-2 right-2 p-1.5 bg-card border border-border rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Copy
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
              <button
                onClick={downloadZip}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Download favicons.zip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

// ─── Inline SVG/Canvas Preview Component ─────────────────────────────
function PreviewIcon({ size, settings, imageSrc, forceSolidBg }: { size: number; settings: FaviconSettings; imageSrc: string; forceSolidBg?: boolean }) {
  const paddingPx = (size * settings.padding) / 100;
  const drawAreaSize = size - paddingPx * 2;
  const radiusPx = (size * settings.backgroundRadius) / 100;

  let bg = settings.backgroundColor;
  if (forceSolidBg && bg === "transparent") bg = "#ffffff";

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg === "transparent" ? undefined : bg,
        borderRadius: radiusPx,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: paddingPx,
          left: paddingPx,
          width: drawAreaSize,
          height: drawAreaSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imageSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: settings.imageScaling,
            display: "block",
          }}
          alt=""
        />
      </div>
    </div>
  );
}
