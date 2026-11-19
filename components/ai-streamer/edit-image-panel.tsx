"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  Sparkles,
  Upload,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  CloudUpload,
  Undo2,
  Eraser,
  Paintbrush,
  Loader2,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import {
  applyOpticalEditsToDataUrl,
  blobToDataUrl,
  buildCssFilterFromAdjustments,
  DEFAULT_IMAGE_ADJUSTMENTS,
  downloadSingleAsset,
} from "@/lib/ai-studio/export-utils";
import { getEditCapableModels, hasProviderKey } from "@/lib/ai-studio/providers";
import { ModelSelector } from "./model-selector";
import type {
  ApiKeyVault,
  GeneratedAsset,
  ImageEditAdjustments,
} from "@/lib/ai-studio/types";

interface EditImagePanelProps {
  vault: ApiKeyVault;
  assets: GeneratedAsset[];
  initialAsset?: GeneratedAsset | null;
  onAddAsset: (asset: GeneratedAsset) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  onOpenApiVault: () => void;
  lang?: string;
}

export function EditImagePanel({
  vault,
  assets,
  initialAsset,
  onAddAsset,
  onSaveToDrive,
  onOpenApiVault,
  lang = "es",
}: EditImagePanelProps) {
  const isEn = lang === "en";
  const imageAssets = assets.filter((a) => a.kind === "image");
  const aiEditModels = getEditCapableModels();

  const [activeAsset, setActiveAsset] = useState<GeneratedAsset | null>(
    initialAsset || imageAssets[0] || null
  );
  const [editTab, setEditTab] = useState<"optical" | "ai">("optical");
  const [adj, setAdj] = useState<ImageEditAdjustments>({ ...DEFAULT_IMAGE_ADJUSTMENTS });
  const [showOriginal, setShowOriginal] = useState(false);
  const [savingOptical, setSavingOptical] = useState(false);

  // AI Edit State
  const [aiModelId, setAiModelId] = useState(aiEditModels[0].id);
  const [aiPrompt, setAiPrompt] = useState("");
  const [brushSize, setBrushSize] = useState(32);
  const [isMaskDrawing, setIsMaskDrawing] = useState(false);
  const [hasMaskStrokes, setHasMaskStrokes] = useState(false);
  const [isRunningAiEdit, setIsRunningAiEdit] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (initialAsset) {
      setActiveAsset(initialAsset);
      setAdj({ ...DEFAULT_IMAGE_ADJUSTMENTS });
      clearMask();
    }
  }, [initialAsset]);

  const clearMask = () => {
    const c = maskCanvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      ctx?.clearRect(0, 0, c.width, c.height);
    }
    setHasMaskStrokes(false);
  };

  const handleUploadLocal = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await blobToDataUrl(file);
    const created: GeneratedAsset = {
      id: `local-edit-${Date.now()}`,
      kind: "image",
      name: file.name,
      dataUrl,
      mimeType: file.type,
      prompt: file.name,
      provider: "local",
      model: "local-upload",
      sizeBytes: file.size,
      createdAt: Date.now(),
    };
    onAddAsset(created);
    setActiveAsset(created);
    setAdj({ ...DEFAULT_IMAGE_ADJUSTMENTS });
    clearMask();
  };

  const handlePointerDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isMaskDrawing && e.type !== "pointerdown") return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgba(255, 77, 0, 0.55)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    setHasMaskStrokes(true);
  };

  const handleSaveOpticalEdit = async (downloadImmediately: boolean) => {
    if (!activeAsset) return;
    setSavingOptical(true);
    setSavedFeedback(null);
    try {
      const result = await applyOpticalEditsToDataUrl(activeAsset.dataUrl, adj, "png");
      const editedAsset: GeneratedAsset = {
        id: `edited-${Date.now()}`,
        kind: "image",
        name: `${activeAsset.name.replace(/\.[^.]+$/, "")}-edited`,
        dataUrl: result.dataUrl,
        mimeType: result.mimeType,
        prompt: activeAsset.prompt,
        provider: activeAsset.provider,
        model: `${activeAsset.model} (optical edit)`,
        width: result.width,
        height: result.height,
        sizeBytes: result.sizeBytes,
        createdAt: Date.now(),
      };
      onAddAsset(editedAsset);
      setActiveAsset(editedAsset);
      setAdj({ ...DEFAULT_IMAGE_ADJUSTMENTS });
      if (downloadImmediately) {
        await downloadSingleAsset(editedAsset);
      }
      setSavedFeedback(
        isEn ? "Edited image saved to your session!" : "¡Imagen editada guardada en tu sesión!"
      );
      setTimeout(() => setSavedFeedback(null), 2600);
    } finally {
      setSavingOptical(false);
    }
  };

  const handleRunAiEdit = async () => {
    if (!activeAsset || !aiPrompt.trim()) return;
    const model = aiEditModels.find((m) => m.id === aiModelId) || aiEditModels[0];
    if (!hasProviderKey(vault, model.provider)) {
      onOpenApiVault();
      return;
    }

    setAiError(null);
    setIsRunningAiEdit(true);

    try {
      const entry = vault[model.provider];
      let maskDataUrl: string | undefined;
      if (hasMaskStrokes && maskCanvasRef.current) {
        maskDataUrl = maskCanvasRef.current.toDataURL("image/png");
      }

      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": entry.apiKey.trim(),
        },
        body: JSON.stringify({
          provider: model.provider,
          model: model.id,
          prompt: aiPrompt.trim(),
          aspectRatio: "1:1",
          resolution: "1K",
          count: 1,
          referenceImages: [activeAsset.dataUrl],
          maskImage: maskDataUrl,
          customBaseUrl: entry.baseUrl,
          customModel: entry.customModel,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";

        for (const frame of frames) {
          let eventName = "";
          let dataRaw = "";
          for (const line of frame.split("\n")) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            if (line.startsWith("data:")) dataRaw += line.slice(5).trim();
          }
          if (!dataRaw) continue;
          const payload = JSON.parse(dataRaw);
          if (eventName === "item") {
            const edited: GeneratedAsset = {
              id: `ai-edit-${Date.now()}`,
              kind: "image",
              name: `${activeAsset.name.replace(/\.[^.]+$/, "")}-ai-edit`,
              dataUrl: payload.dataUrl,
              mimeType: payload.mimeType || "image/png",
              prompt: aiPrompt.trim(),
              provider: model.provider,
              model: model.id,
              width: payload.width,
              height: payload.height,
              sizeBytes: payload.sizeBytes,
              createdAt: Date.now(),
            };
            onAddAsset(edited);
            setActiveAsset(edited);
            clearMask();
            setSavedFeedback(
              isEn ? "AI edit applied and saved!" : "¡Edición IA aplicada y guardada!"
            );
            setTimeout(() => setSavedFeedback(null), 2600);
          } else if (eventName === "slot_error") {
            throw new Error(payload.error);
          }
        }
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI image edit failed");
    } finally {
      setIsRunningAiEdit(false);
    }
  };

  const selectedAiModel = aiEditModels.find((m) => m.id === aiModelId) || aiEditModels[0];
  const aiModelReady = hasProviderKey(vault, selectedAiModel.provider);

  return (
    <div className="space-y-5">
      {/* Top Bar: Asset Switcher & Mode Tabs */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-1 rounded-full bg-background border border-border">
            <button
              type="button"
              onClick={() => setEditTab("optical")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                editTab === "optical" ? "bg-foreground text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEn ? "Optical Darkroom (Local)" : "Laboratorio Óptico (Local)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setEditTab("ai")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                editTab === "ai" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? "Generative AI Edit" : "Edición Generativa IA"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleUploadLocal(e.target.files?.[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>{isEn ? "Load Local Image" : "Cargar Imagen"}</span>
          </button>
          {activeAsset && (
            <button
              type="button"
              onClick={() => onSaveToDrive(activeAsset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-600/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Google Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calibrated Darkroom Viewport */}
        <section className="lg:col-span-8 rounded-2xl border border-[#242936] bg-[#0c0e12] text-white p-4 flex flex-col justify-between min-h-[460px] darkroom-chassis">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-3 border-b border-[#242936]">
            <span>
              VIEWPORT //{" "}
              {editTab === "optical"
                ? isEn
                  ? "REAL-TIME CANVAS CALIBRATION"
                  : "CALIBRACIÓN EN VIVO"
                : isEn
                ? "AI MASK & INPAINTING CANVAS"
                : "LIENZO DE MÁSCARA IA"}
            </span>
            {activeAsset && editTab === "optical" && (
              <button
                type="button"
                onPointerDown={() => setShowOriginal(true)}
                onPointerUp={() => setShowOriginal(false)}
                onPointerLeave={() => setShowOriginal(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1a1f2c] hover:bg-[#242b3d] text-white cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>{isEn ? "Hold to Compare" : "Mantén para Ver Original"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-4 darkroom-grid relative overflow-hidden">
            {!activeAsset ? (
              <div className="text-center space-y-3">
                <SlidersHorizontal className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm text-slate-300">
                  {isEn
                    ? "Upload a photo or select a generated image from your session below."
                    : "Sube una fotografía o selecciona una imagen generada de tu sesión."}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-[#1e40ff] text-white text-xs font-semibold cursor-pointer"
                >
                  {isEn ? "Open Image" : "Abrir Imagen"}
                </button>
              </div>
            ) : (
              <div className="relative inline-block max-w-full max-h-[420px]">
                <img
                  src={activeAsset.dataUrl}
                  alt={activeAsset.name}
                  className="max-h-[400px] max-w-full object-contain rounded-lg select-none"
                  style={
                    editTab === "optical" && !showOriginal
                      ? {
                          filter: buildCssFilterFromAdjustments(adj),
                          transform: `rotate(${adj.rotation}deg) scaleX(${adj.flipH ? -1 : 1}) scaleY(${adj.flipV ? -1 : 1})`,
                        }
                      : undefined
                  }
                />
                {editTab === "ai" && (
                  <canvas
                    ref={maskCanvasRef}
                    width={640}
                    height={640}
                    onPointerDown={(e) => {
                      setIsMaskDrawing(true);
                      handlePointerDraw(e);
                    }}
                    onPointerMove={handlePointerDraw}
                    onPointerUp={() => setIsMaskDrawing(false)}
                    onPointerLeave={() => setIsMaskDrawing(false)}
                    className="absolute inset-0 w-full h-full cursor-crosshair rounded-lg touch-none"
                  />
                )}
              </div>
            )}
          </div>

          {/* Session Filmstrip */}
          {imageAssets.length > 0 && (
            <div className="pt-3 border-t border-[#242936] flex items-center gap-2 overflow-x-auto">
              {imageAssets.slice(0, 12).map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setActiveAsset(img);
                    setAdj({ ...DEFAULT_IMAGE_ADJUSTMENTS });
                    clearMask();
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                    activeAsset?.id === img.id ? "border-[#1e40ff]" : "border-[#242936] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right Controls Panel */}
        <section className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 tactile-surface flex flex-col justify-between gap-4">
          {editTab === "optical" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
                  {isEn ? "OPTICAL CONTROLS" : "AJUSTES ÓPTICOS"}
                </span>
                <button
                  type="button"
                  onClick={() => setAdj({ ...DEFAULT_IMAGE_ADJUSTMENTS })}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline cursor-pointer"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>{isEn ? "Reset" : "Restablecer"}</span>
                </button>
              </div>

              {/* Transform Row */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setAdj((a) => ({
                      ...a,
                      rotation: ((a.rotation + 90) % 360) as 0 | 90 | 180 | 270,
                    }))
                  }
                  className="py-2 rounded-xl bg-background hover:bg-muted border border-border text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdj((a) => ({ ...a, flipH: !a.flipH }))}
                  className={`py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer ${
                    adj.flipH ? "bg-foreground text-white border-foreground" : "bg-background border-border"
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdj((a) => ({ ...a, flipV: !a.flipV }))}
                  className={`py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer ${
                    adj.flipV ? "bg-foreground text-white border-foreground" : "bg-background border-border"
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>

              {/* Crop Aspect */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  {isEn ? "Crop Ratio" : "Recorte de Proporción"}
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {(["original", "1:1", "4:5", "16:9", "9:16", "3:2"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAdj((a) => ({ ...a, cropRatio: r }))}
                      className={`py-1 rounded-lg border text-[10px] font-mono font-bold cursor-pointer ${
                        adj.cropRatio === r
                          ? "bg-primary text-white border-primary"
                          : "bg-background border-border text-foreground"
                      }`}
                    >
                      {r === "original" ? "ORIG" : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                {[
                  { key: "brightness", es: "Brillo", en: "Brightness", min: 40, max: 180, unit: "%" },
                  { key: "contrast", es: "Contraste", en: "Contrast", min: 40, max: 180, unit: "%" },
                  { key: "saturation", es: "Saturación", en: "Saturation", min: 0, max: 200, unit: "%" },
                  { key: "warmth", es: "Temperatura", en: "Warmth", min: -50, max: 50, unit: "" },
                  { key: "vignette", es: "Viñeta", en: "Vignette", min: 0, max: 90, unit: "%" },
                  { key: "blur", es: "Suavizado / Blur", en: "Blur", min: 0, max: 8, unit: "px" },
                ].map((s) => (
                  <div key={s.key} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">{isEn ? s.en : s.es}</span>
                      <span className="font-bold text-foreground">
                        {adj[s.key as keyof ImageEditAdjustments] as number}
                        {s.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      value={adj[s.key as keyof ImageEditAdjustments] as number}
                      onChange={(e) =>
                        setAdj((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Quick Look Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAdj((a) => ({ ...a, grayscale: a.grayscale ? 0 : 100, contrast: 118 }))}
                  className="px-2.5 py-1 rounded-full bg-background hover:bg-muted border border-border text-[11px] font-semibold cursor-pointer"
                >
                  Noir B&W
                </button>
                <button
                  type="button"
                  onClick={() => setAdj((a) => ({ ...a, sepia: a.sepia ? 0 : 45, warmth: 18 }))}
                  className="px-2.5 py-1 rounded-full bg-background hover:bg-muted border border-border text-[11px] font-semibold cursor-pointer"
                >
                  Warm Film
                </button>
                <button
                  type="button"
                  onClick={() => setAdj((a) => ({ ...a, contrast: 122, saturation: 125 }))}
                  className="px-2.5 py-1 rounded-full bg-background hover:bg-muted border border-border text-[11px] font-semibold cursor-pointer"
                >
                  Vivid Punch
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-primary">
                  AI INPAINT & EDIT // BYOK
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {isEn
                    ? "Optionally paint over a region to mask it, then describe what to change or add."
                    : "Opcionalmente pinta una zona con el pincel para enmascararla y describe el cambio que deseas aplicar."}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">
                  {isEn ? "Edit Model" : "Modelo de Edición"}
                </span>
                <ModelSelector
                  models={aiEditModels}
                  selectedModelId={aiModelId}
                  onSelect={setAiModelId}
                  vault={vault}
                  onOpenApiVault={onOpenApiVault}
                  lang={lang}
                  align="right"
                  fullWidth
                />
              </div>

              {!aiModelReady && (
                <button
                  type="button"
                  onClick={onOpenApiVault}
                  className="w-full py-2 px-3 rounded-xl bg-[#ff4d00]/12 border border-[#ff4d00]/30 text-[#b83700] text-xs font-mono font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isEn ? "Configure API Key in Vault" : "Configurar API Key en Bóveda"}</span>
                </button>
              )}

              <div className="p-3 rounded-xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1 font-bold">
                    <Paintbrush className="w-3.5 h-3.5 text-[#ff4d00]" />
                    {isEn ? "Mask Brush" : "Pincel Máscara"}: {brushSize}px
                  </span>
                  <button
                    type="button"
                    onClick={clearMask}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>{isEn ? "Clear" : "Limpiar"}</span>
                  </button>
                </div>
                <input
                  type="range"
                  min={8}
                  max={80}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
              </div>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                placeholder={
                  isEn
                    ? "e.g., Replace background with warm minimalist concrete studio, add subtle window shadows..."
                    : "Ej.: Cambia el fondo por un estudio minimalista de concreto cálido con sombras suaves de ventana..."
                }
                className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />

              {aiError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-border space-y-2">
            {savedFeedback && (
              <div className="p-2 rounded-lg bg-emerald-500/12 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{savedFeedback}</span>
              </div>
            )}

            {editTab === "optical" ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!activeAsset || savingOptical}
                  onClick={() => handleSaveOpticalEdit(false)}
                  className="py-2.5 px-3 rounded-full bg-background hover:bg-muted border border-border text-xs font-bold cursor-pointer disabled:opacity-40"
                >
                  {isEn ? "Apply to Session" : "Guardar versión"}
                </button>
                <button
                  type="button"
                  disabled={!activeAsset || savingOptical}
                  onClick={() => handleSaveOpticalEdit(true)}
                  className="py-2.5 px-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 tactile-button cursor-pointer disabled:opacity-40"
                >
                  {savingOptical ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{isEn ? "Export PNG" : "Exportar PNG"}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!activeAsset || !aiPrompt.trim() || isRunningAiEdit}
                onClick={handleRunAiEdit}
                className="w-full py-2.5 px-4 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold inline-flex items-center justify-center gap-2 tactile-button cursor-pointer"
              >
                {isRunningAiEdit ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isEn ? "Apply AI Edit" : "Aplicar Edición IA"}</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
