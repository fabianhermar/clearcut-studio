"use client";

import { useState, useRef } from "react";
import {
  Download,
  SlidersHorizontal,
  Eye,
  ImagePlus,
  X,
  Copy,
  Check,
  PackageCheck,
} from "lucide-react";
import { FaviconSettings, DEFAULT_FAVICON_SETTINGS } from "./types";
import { generateFavicons } from "./generator";
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
  const [settings, setSettings] = useState<FaviconSettings>(DEFAULT_FAVICON_SETTINGS);
  const [darkImageSrc, setDarkImageSrc] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<{ zipBlob: Blob; htmlCode: string } | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
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

  const handleCopyHtml = async () => {
    if (!exportData) return;
    try {
      await navigator.clipboard.writeText(exportData.htmlCode);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader
        slug="favicon-generator"
        lang={lang}
        onClose={onClose || onReset}
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-lg transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isEn ? "New icon" : "Nuevo icono"}</span>
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {isGenerating
                  ? isEn
                    ? "Packaging..."
                    : "Empaquetando..."
                  : isEn
                  ? "Export Bundle"
                  : "Exportar paquete"}
              </span>
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
              {isEn ? "Icon Configuration" : "Configuración de iconos"}
            </h2>
          </div>

          <div className="p-5 space-y-6">
            {/* Padding */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isEn ? "Internal Margin" : "Margen interno"}
                </Label>
                <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded border border-border text-foreground">
                  {settings.padding}%
                </span>
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
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Dark Mode Variant" : "Variante para modo oscuro"}
              </Label>
              {darkImageSrc ? (
                <div className="flex items-center justify-between p-2.5 border border-border rounded-xl bg-muted/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                      <img src={darkImageSrc} alt="Dark Icon" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {isEn ? "Custom dark icon" : "Icono oscuro activo"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDarkImageSrc(null)}
                    aria-label={isEn ? "Remove dark icon" : "Quitar icono oscuro"}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => darkFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold border border-dashed border-border rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>{isEn ? "Add dark theme icon" : "Añadir icono para tema oscuro"}</span>
                  </button>
                  <input
                    type="file"
                    ref={darkFileInputRef}
                    onChange={handleDarkFile}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Background Color */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Background Fill" : "Fondo del icono"}
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={isEn ? "Select background color" : "Seleccionar color de fondo"}
                  value={settings.backgroundColor === "transparent" ? "#ffffff" : settings.backgroundColor}
                  onChange={(e) => setSettings((s) => ({ ...s, backgroundColor: e.target.value }))}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                />
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, backgroundColor: "transparent" }))}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    settings.backgroundColor === "transparent"
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {isEn ? "Transparent" : "Transparente"}
                </button>
              </div>
            </div>

            {/* App Name */}
            <div className="space-y-2">
              <Label
                htmlFor="favicon-app-name"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
              >
                {isEn ? "Application Name" : "Nombre de la aplicación"}
              </Label>
              <input
                id="favicon-app-name"
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings((s) => ({ ...s, appName: e.target.value }))}
                placeholder="My Web App"
                className="w-full text-xs font-medium bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Theme Color */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? "Manifest Theme Color" : "Color de tema (Manifest)"}
              </Label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  aria-label={isEn ? "Select theme color" : "Seleccionar color de tema"}
                  value={settings.themeColor}
                  onChange={(e) => setSettings((s) => ({ ...s, themeColor: e.target.value }))}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                />
                <span className="text-xs font-mono font-semibold text-foreground">
                  {settings.themeColor}
                </span>
              </div>
            </div>

            {/* Favicon Path */}
            <div className="space-y-2">
              <Label
                htmlFor="favicon-path-input"
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
              >
                {isEn ? "Public Path Prefix" : "Ruta pública de archivos"}
              </Label>
              <input
                id="favicon-path-input"
                type="text"
                value={settings.path}
                onChange={(e) => setSettings((s) => ({ ...s, path: e.target.value }))}
                placeholder="/"
                className="w-full text-xs font-mono bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </aside>

        {/* Center Live Previews */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 bg-canvas order-1 lg:order-2">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Eye className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-heading text-foreground">
                  {isEn ? "Real-Time Platform Previews" : "Previsualización multiplataforma en vivo"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isEn
                    ? "Includes 16×16, 32×32, favicon.ico, Apple 180×180, Android 192/512 & site.webmanifest"
                    : "Incluye 16×16, 32×32, favicon.ico, Apple 180×180, Android 192/512 y site.webmanifest"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>
                {isGenerating
                  ? isEn
                    ? "Generating..."
                    : "Generando..."
                  : isEn
                  ? "Generate Favicons (.ZIP)"
                  : "Generar Favicons (.ZIP)"}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 1. Desktop Browser */}
            <div className="bg-card border border-border rounded-2xl shadow-2xs flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-heading text-foreground">
                    {isEn ? "Browser Tab (16×16 & 32×32)" : "Pestaña de navegador (16×16 y 32×32)"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "Light and dark browser chrome" : "Tema claro y oscuro en escritorio"}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 bg-background rounded border border-border">
                  favicon.ico
                </span>
              </div>
              <div className="p-5 flex flex-col gap-5 bg-white">
                {/* Light Theme */}
                <div className="w-full">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {isEn ? "Light Mode" : "Modo Claro"}
                  </p>
                  <div className="bg-[#dee1e6] rounded-t-lg pt-2 px-2 flex items-end w-full overflow-hidden">
                    <div className="bg-white rounded-t-lg min-w-[140px] max-w-[220px] w-full px-3 py-1.5 flex items-center gap-2 shrink-0">
                      <PreviewIcon size={16} settings={settings} imageSrc={imageSrc} />
                      <span className="text-xs text-[#3c4043] font-medium truncate">
                        {settings.appName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dark Theme */}
                <div className="w-full">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {isEn ? "Dark Mode" : "Modo Oscuro"}
                  </p>
                  <div className="bg-[#202124] rounded-t-lg pt-2 px-2 flex items-end w-full overflow-hidden">
                    <div className="bg-[#323639] rounded-t-lg min-w-[140px] max-w-[220px] w-full px-3 py-1.5 flex items-center gap-2 shrink-0">
                      <PreviewIcon
                        size={16}
                        settings={settings}
                        imageSrc={darkImageSrc || imageSrc}
                      />
                      <span className="text-xs text-[#e8eaed] font-medium truncate">
                        {settings.appName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Google Search Result */}
            <div className="bg-card border border-border rounded-2xl shadow-2xs flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-heading text-foreground">
                    {isEn ? "Search Engine Result (SERP)" : "Resultado de búsqueda web (SERP)"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "Site identity icon next to URL" : "Icono de identidad junto al dominio"}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 bg-background rounded border border-border">
                  32×32 PNG
                </span>
              </div>
              <div className="p-5 bg-white flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f1f3f4] flex items-center justify-center p-1 border border-black/5 shrink-0">
                    <PreviewIcon size={18} settings={settings} imageSrc={imageSrc} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] text-[#202124] font-medium truncate">
                      {settings.appName}
                    </span>
                    <span className="text-[11px] text-[#4d5156] truncate">
                      https://{settings.appName.toLowerCase().replace(/\s+/g, "") || "example"}.com
                    </span>
                  </div>
                </div>
                <p className="text-[16px] text-[#1a0dab] font-medium mt-1.5 truncate">
                  {settings.appName} — Official Website
                </p>
                <p className="text-xs text-[#4d5156] leading-relaxed mt-1 line-clamp-2">
                  {isEn
                    ? "Preview how your website icon appears in search engine listings across desktop and mobile devices."
                    : "Previsualización de cómo se muestra el icono de tu sitio web en los motores de búsqueda en escritorio y móvil."}
                </p>
              </div>
            </div>

            {/* 3. iOS Home Screen */}
            <div className="bg-card border border-border rounded-2xl shadow-2xs flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-heading text-foreground">
                    iOS Apple Touch Icon
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "iPhone & iPad home screen" : "Pantalla de inicio en iPhone y iPad"}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 bg-background rounded border border-border">
                  180×180 PNG
                </span>
              </div>
              <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center min-h-[180px]">
                <PreviewIcon
                  size={64}
                  settings={{
                    ...settings,
                    backgroundColor:
                      settings.backgroundColor === "transparent"
                        ? "#ffffff"
                        : settings.backgroundColor,
                    backgroundRadius: 22.5,
                  }}
                  imageSrc={imageSrc}
                  forceSolidBg
                />
                <span className="text-xs text-white mt-2.5 font-medium tracking-wide">
                  {settings.appName}
                </span>
              </div>
            </div>

            {/* 4. Android Home Screen */}
            <div className="bg-card border border-border rounded-2xl shadow-2xs flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-heading text-foreground">
                    Android PWA & Chrome
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "Web manifest & adaptive launcher" : "Web manifest e icono de lanzador"}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 bg-background rounded border border-border">
                  192 / 512 PNG
                </span>
              </div>
              <div className="p-6 bg-slate-950 flex flex-col items-center justify-center relative min-h-[180px] overflow-hidden">
                <div
                  className="absolute inset-x-0 top-0 h-1/2"
                  style={{ backgroundColor: settings.themeColor, opacity: 0.18 }}
                />
                <div className="w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center relative z-10 p-1 shadow-lg border border-white/10">
                  <PreviewIcon
                    size={62}
                    settings={{ ...settings, backgroundRadius: 50 }}
                    imageSrc={imageSrc}
                  />
                </div>
                <span className="text-xs text-white mt-2.5 font-medium z-10 tracking-wide">
                  {settings.appName}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="favicon-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="favicon-modal-title" className="text-lg font-bold font-heading text-foreground">
                    {isEn ? "Favicon Package Ready" : "Paquete de Favicons generado"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEn
                      ? "Extract favicons.zip into your public directory and paste these tags inside <head>."
                      : "Extrae favicons.zip en tu carpeta pública y pega estas etiquetas dentro de <head>."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                aria-label={isEn ? "Close dialog" : "Cerrar ventana"}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-muted p-4 rounded-xl border border-border relative mb-6">
              <pre className="text-xs overflow-x-auto text-foreground font-mono leading-relaxed pr-20">
                {exportData.htmlCode}
              </pre>
              <button
                type="button"
                onClick={handleCopyHtml}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-background shadow-2xs cursor-pointer"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isEn ? "Copied" : "Copiado"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isEn ? "Copy HTML" : "Copiar HTML"}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                {isEn ? "Close" : "Cerrar"}
              </button>
              <button
                type="button"
                onClick={downloadZip}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isEn ? "Download favicons.zip" : "Descargar favicons.zip"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewIcon({
  size,
  settings,
  imageSrc,
  forceSolidBg,
}: {
  size: number;
  settings: FaviconSettings;
  imageSrc: string;
  forceSolidBg?: boolean;
}) {
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
