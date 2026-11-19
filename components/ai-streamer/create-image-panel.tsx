"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  ImagePlus,
  X,
  Download,
  CloudUpload,
  Maximize2,
  SlidersHorizontal,
  Film,
  Check,
  KeyRound,
  Square,
  Loader2,
  Dice5,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertTriangle,
  Archive,
} from "lucide-react";
import {
  ASPECT_RATIO_OPTIONS,
  BATCH_COUNTS,
  getModelsByKind,
  getProviderMeta,
  hasProviderKey,
  RESOLUTION_TIERS,
  STYLE_PRESETS,
} from "@/lib/ai-studio/providers";
import { blobToDataUrl, downloadSingleAsset } from "@/lib/ai-studio/export-utils";
import { ModelSelector } from "./model-selector";
import type {
  ApiKeyVault,
  AspectRatioPreset,
  BatchCount,
  GeneratedAsset,
  ResolutionTier,
  StreamingSlot,
} from "@/lib/ai-studio/types";

interface CreateImagePanelProps {
  vault: ApiKeyVault;
  assets: GeneratedAsset[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onAddAsset: (asset: GeneratedAsset) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  onOpenApiVault: () => void;
  onSendToResize: (asset: GeneratedAsset) => void;
  onSendToEditImage: (asset: GeneratedAsset) => void;
  onSendToVideoRef: (asset: GeneratedAsset) => void;
  onInspectAsset: (asset: GeneratedAsset) => void;
  onDownloadBatchZip: (items: GeneratedAsset[]) => Promise<void>;
  lang?: string;
}

const PROMPT_INSPIRATIONS_ES = [
  "Botella de perfume de vidrio ahumado sobre mármol travertino, iluminación de estudio calibrada",
  "Arquitectura minimalista suiza en concreto y madera cálida al atardecer, fotografía 35mm",
  "Auriculares de aluminio anodizado flotando con reflejos azul cobalto y naranja señal, render 3D",
  "Retrato editorial en estudio con iluminación rembrandt, fondo papel cálido, lente 85mm",
];

const PROMPT_INSPIRATIONS_EN = [
  "Smoked glass perfume bottle on travertine marble, calibrated studio lighting, sharp micro-contrast",
  "Minimalist Swiss concrete and warm timber architecture at golden hour, 35mm editorial photo",
  "Anodized aluminum studio headphones floating with cobalt blue and vermilion reflections, 3D render",
  "Editorial studio portrait with Rembrandt lighting, warm alabaster paper backdrop, 85mm lens",
];

export function CreateImagePanel({
  vault,
  assets,
  selectedIds,
  onToggleSelect,
  onAddAsset,
  onSaveToDrive,
  onOpenApiVault,
  onSendToResize,
  onSendToEditImage,
  onSendToVideoRef,
  onInspectAsset,
  onDownloadBatchZip,
  lang = "es",
}: CreateImagePanelProps) {
  const isEn = lang === "en";
  const imageModels = getModelsByKind("image");

  const [selectedModelId, setSelectedModelId] = useState<string>(imageModels[0].id);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>("1:1");
  const [resolution, setResolution] = useState<ResolutionTier>("1K");
  const [batchCount, setBatchCount] = useState<BatchCount>(4);
  const [stylePresetId, setStylePresetId] = useState<string>("none");
  const [seedInput, setSeedInput] = useState<string>("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [slots, setSlots] = useState<StreamingSlot[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const selectedModel = imageModels.find((m) => m.id === selectedModelId) || imageModels[0];
  const providerMeta = getProviderMeta(selectedModel.provider);
  const providerReady = hasProviderKey(vault, selectedModel.provider);
  const imageAssets = assets.filter((a) => a.kind === "image");

  const handleAttachReference = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: string[] = [...referenceImages];
    for (const file of Array.from(files).slice(0, 4 - next.length)) {
      if (!file.type.startsWith("image/")) continue;
      const url = await blobToDataUrl(file);
      next.push(url);
    }
    setReferenceImages(next);
  };

  const handleStopStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleGenerateBatch = async () => {
    if (!prompt.trim()) return;
    if (!providerReady) {
      onOpenApiVault();
      return;
    }

    setStreamError(null);
    setIsStreaming(true);
    setElapsedSec(0);

    const batchId = `batch-${Date.now()}`;
    const startTs = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSec(Number(((Date.now() - startTs) / 1000).toFixed(1)));
    }, 200);

    const initialSlots: StreamingSlot[] = Array.from({ length: batchCount }, (_, idx) => ({
      slotIndex: idx,
      status: "queued",
      startedAt: startTs,
    }));
    setSlots(initialSlots);

    const styleObj = STYLE_PRESETS.find((s) => s.id === stylePresetId);
    const composedPrompt =
      styleObj && styleObj.promptSuffix
        ? `${prompt.trim()}, ${styleObj.promptSuffix}`
        : prompt.trim();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const entry = vault[selectedModel.provider];
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": entry.apiKey.trim(),
        },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          prompt: composedPrompt,
          negativePrompt: negativePrompt.trim() || undefined,
          aspectRatio,
          resolution,
          count: batchCount,
          seed: seedInput.trim() ? Number(seedInput) : undefined,
          referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
          customBaseUrl: entry.baseUrl,
          customModel: entry.customModel,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
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
          const lines = frame.split("\n");
          let eventName = "message";
          let dataRaw = "";
          for (const line of lines) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            if (line.startsWith("data:")) dataRaw += line.slice(5).trim();
          }
          if (!dataRaw) continue;
          const payload = JSON.parse(dataRaw);

          if (eventName === "slot_start") {
            setSlots((prev) =>
              prev.map((s) =>
                s.slotIndex === payload.slotIndex
                  ? { ...s, status: "streaming", startedAt: payload.startedAt }
                  : s
              )
            );
          } else if (eventName === "item") {
            const createdAsset: GeneratedAsset = {
              id: `${batchId}-slot-${payload.slotIndex}`,
              kind: "image",
              name: `clearcut-${selectedModel.provider}-${payload.slotIndex + 1}`,
              dataUrl: payload.dataUrl,
              mimeType: payload.mimeType || "image/png",
              prompt: prompt.trim(),
              negativePrompt: negativePrompt.trim() || undefined,
              provider: selectedModel.provider,
              model:
                selectedModel.provider === "custom" && entry.customModel
                  ? entry.customModel
                  : selectedModel.id,
              aspectRatio,
              width: payload.width,
              height: payload.height,
              sizeBytes: payload.sizeBytes,
              createdAt: Date.now(),
              batchId,
              slotIndex: payload.slotIndex,
              latencyMs: payload.latencyMs,
            };

            onAddAsset(createdAsset);
            setSlots((prev) =>
              prev.map((s) =>
                s.slotIndex === payload.slotIndex
                  ? {
                      ...s,
                      status: "done",
                      asset: createdAsset,
                      finishedAt: Date.now(),
                    }
                  : s
              )
            );
          } else if (eventName === "slot_error") {
            setSlots((prev) =>
              prev.map((s) =>
                s.slotIndex === payload.slotIndex
                  ? {
                      ...s,
                      status: "error",
                      error: payload.error,
                      finishedAt: Date.now(),
                    }
                  : s
              )
            );
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setStreamError(err instanceof Error ? err.message : "Streaming error");
      }
    } finally {
      window.clearInterval(timer);
      setIsStreaming(false);
    }
  };

  const completedSlots = slots.filter((s) => s.status === "done");
  const inspirations = isEn ? PROMPT_INSPIRATIONS_EN : PROMPT_INSPIRATIONS_ES;

  return (
    <div className="space-y-6">
      {/* Optical Atelier Command Console */}
      <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 tactile-surface space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-primary">
              <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
              <span>STREAMING ENGINE // {isEn ? "BATCH IMAGE STUDIO" : "IMÁGENES POR LOTES"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mt-0.5">
              {isEn ? "Generate Real-Time Image Batches" : "Genera Lotes de Imágenes en Streaming"}
            </h2>
          </div>

          {/* Model Quick Picker (Grouped by Provider/Family) */}
          <div className="flex items-center gap-2 flex-wrap">
            <ModelSelector
              models={imageModels}
              selectedModelId={selectedModelId}
              onSelect={setSelectedModelId}
              vault={vault}
              onOpenApiVault={onOpenApiVault}
              lang={lang}
              align="right"
            />

            {!providerReady && (
              <button
                type="button"
                onClick={onOpenApiVault}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff4d00]/12 border border-[#ff4d00]/30 text-[#b83700] text-xs font-mono font-bold hover:bg-[#ff4d00]/20 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  {isEn ? `Add ${providerMeta.shortName} Key` : `Añadir Key de ${providerMeta.shortName}`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Prompt + Reference Input Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-9 space-y-2.5">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleGenerateBatch();
                  }
                }}
                rows={3}
                placeholder={
                  isEn
                    ? "Describe lighting, camera, subject, textures, and composition... (Ctrl+Enter to stream)"
                    : "Describe el sujeto, iluminación, lente, materiales y composición... (Ctrl+Enter para generar en streaming)"
                }
                className="w-full p-3.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary resize-y"
              />
            </div>

            {/* Quick Prompt Inspiration Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground shrink-0 mr-1">
                {isEn ? "Presets:" : "Ideas:"}
              </span>
              {inspirations.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-background hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors truncate max-w-[230px] shrink-0 cursor-pointer"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Image Uploader */}
          <div className="lg:col-span-3 flex flex-col justify-between p-3 rounded-xl bg-[#faf9f5] border border-dashed border-border">
            <input
              ref={refInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleAttachReference(e.target.files)}
              className="hidden"
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                {isEn ? "References (Optional)" : "Referencias (Opcional)"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {referenceImages.length}/4
              </span>
            </div>

            {referenceImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {referenceImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border bg-card"
                  >
                    <img src={src} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setReferenceImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
                <ImagePlus className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-[11px] text-muted-foreground">
                  {isEn ? "Style or subject guide" : "Guía visual o sujeto"}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => refInputRef.current?.click()}
              disabled={referenceImages.length >= 4}
              className="w-full py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-[11px] font-semibold text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            >
              + {isEn ? "Attach Image" : "Adjuntar imagen"}
            </button>
          </div>
        </div>

        {/* Optical Control Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-border/70 items-end">
          {/* Batch Size (1, 2, 4, 6, 8) */}
          <div className="md:col-span-3 space-y-1.5">
            <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">
              {isEn ? "Batch Size (Stream)" : "Lote (Streaming)"}
            </span>
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-background border border-border">
              {BATCH_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setBatchCount(count)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    batchCount === count
                      ? "bg-[#0c0e12] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {count}×
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="md:col-span-3 space-y-1.5">
            <label
              htmlFor="batch-aspect-ratio"
              className="block text-[10px] font-mono font-bold uppercase text-muted-foreground"
            >
              {isEn ? "Aspect Ratio" : "Proporción"}
            </label>
            <select
              id="batch-aspect-ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatioPreset)}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-mono font-semibold text-foreground cursor-pointer"
            >
              {ASPECT_RATIO_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} · {isEn ? r.labelEn : r.labelEs}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution */}
          <div className="md:col-span-2 space-y-1.5">
            <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">
              {isEn ? "Resolution" : "Resolución"}
            </span>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-background border border-border">
              {RESOLUTION_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setResolution(tier.id)}
                  className={`py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    resolution === tier.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Preset */}
          <div className="md:col-span-2 space-y-1.5">
            <label
              htmlFor="style-preset-select"
              className="block text-[10px] font-mono font-bold uppercase text-muted-foreground"
            >
              {isEn ? "Aesthetic Look" : "Dirección Visual"}
            </label>
            <select
              id="style-preset-select"
              value={stylePresetId}
              onChange={(e) => setStylePresetId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground cursor-pointer"
            >
              {STYLE_PRESETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {isEn ? s.labelEn : s.labelEs}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Action CTA */}
          <div className="md:col-span-2 flex items-center gap-1.5">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStream}
                className="w-full h-10 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isEn ? "Stop" : "Detener"}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!prompt.trim()}
                onClick={handleGenerateBatch}
                className="w-full h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-45 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 tactile-button transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isEn ? `Stream (${batchCount})` : `Generar (${batchCount})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Drawer Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>
              {isEn ? "Advanced: Negative prompt & Seed" : "Avanzado: Prompt negativo y Semilla (Seed)"}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-xl bg-background border border-border">
              <div className="md:col-span-9">
                <label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  {isEn ? "Negative Prompt (Elements to exclude)" : "Prompt Negativo (Qué evitar)"}
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder={
                    isEn
                      ? "blurry, watermark, low quality, distorted hands..."
                      : "borroso, marca de agua, baja calidad, texto deformado..."
                  }
                  className="w-full h-9 px-3 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  Seed
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    placeholder={isEn ? "Random" : "Aleatorio"}
                    className="w-full h-9 px-3 rounded-lg bg-card border border-border text-xs font-mono text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setSeedInput(String(Math.floor(Math.random() * 9999999)))}
                    aria-label="Random seed"
                    className="px-2.5 rounded-lg bg-card border border-border hover:border-primary text-foreground cursor-pointer"
                  >
                    <Dice5 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {streamError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{streamError}</span>
          </div>
        )}
      </section>

      {/* Active Streaming Lightbox */}
      {slots.length > 0 && (
        <section className="rounded-2xl border border-[#242936] bg-[#0c0e12] text-white p-5 space-y-4 darkroom-chassis">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#242936]">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isStreaming ? "bg-[#ff4d00] animate-ping" : "bg-emerald-400"
                }`}
              />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                {isStreaming
                  ? isEn
                    ? `STREAMING BATCH // ${completedSlots.length}/${slots.length} READY · ${elapsedSec}s`
                    : `STREAMING LOTE // ${completedSlots.length}/${slots.length} LISTAS · ${elapsedSec}s`
                  : isEn
                  ? `BATCH COMPLETE // ${completedSlots.length}/${slots.length} GENERATED`
                  : `LOTE COMPLETADO // ${completedSlots.length}/${slots.length} GENERADAS`}
              </span>
            </div>

            {completedSlots.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onDownloadBatchZip(
                    completedSlots.map((s) => s.asset!).filter(Boolean)
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e40ff] hover:bg-[#1530cc] text-white text-xs font-semibold cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>
                  {isEn
                    ? `Download Batch ZIP (${completedSlots.length})`
                    : `Descargar Lote ZIP (${completedSlots.length})`}
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {slots.map((slot) => (
              <div
                key={slot.slotIndex}
                className="rounded-xl border border-[#242936] bg-[#14171f] overflow-hidden flex flex-col"
              >
                <div className="aspect-square relative darkroom-grid flex items-center justify-center overflow-hidden">
                  {slot.status === "done" && slot.asset ? (
                    <>
                      <img
                        src={slot.asset.dataUrl}
                        alt={slot.asset.prompt}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => onInspectAsset(slot.asset!)}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white">
                        #{String(slot.slotIndex + 1).padStart(2, "0")} ·{" "}
                        {slot.asset.latencyMs ? `${(slot.asset.latencyMs / 1000).toFixed(1)}s` : "OK"}
                      </span>
                    </>
                  ) : slot.status === "error" ? (
                    <div className="p-4 text-center space-y-2">
                      <AlertTriangle className="w-6 h-6 text-[#ff4d00] mx-auto" />
                      <p className="text-[11px] font-mono text-red-300 line-clamp-4">
                        {slot.error}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 text-center space-y-2.5">
                      <Loader2 className="w-6 h-6 text-[#60a5fa] animate-spin mx-auto" />
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        SLOT {String(slot.slotIndex + 1).padStart(2, "0")} //{" "}
                        {slot.status === "streaming"
                          ? isEn
                            ? "RENDERING"
                            : "GENERANDO"
                          : isEn
                          ? "QUEUED"
                          : "EN COLA"}
                      </div>
                    </div>
                  )}
                </div>

                {slot.status === "done" && slot.asset && (
                  <div className="p-2 flex items-center justify-between gap-1 border-t border-[#242936]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => downloadSingleAsset(slot.asset!)}
                        title={isEn ? "Download" : "Descargar"}
                        className="p-1.5 rounded-lg bg-[#1d2230] hover:bg-[#1e40ff] text-slate-200 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveToDrive(slot.asset!)}
                        title={isEn ? "Save to Google Drive" : "Guardar en Google Drive"}
                        className="p-1.5 rounded-lg bg-[#1d2230] hover:bg-emerald-600 text-slate-200 transition-colors cursor-pointer"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSendToResize(slot.asset!)}
                        title={isEn ? "Resize" : "Redimensionar"}
                        className="p-1.5 rounded-lg bg-[#1d2230] hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSendToEditImage(slot.asset!)}
                        title={isEn ? "Edit Image" : "Editar Imagen"}
                        className="p-1.5 rounded-lg bg-[#1d2230] hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSendToVideoRef(slot.asset!)}
                        title={isEn ? "Animate to Video" : "Animar a Video"}
                        className="p-1.5 rounded-lg bg-[#1d2230] hover:bg-[#ff4d00] text-slate-200 transition-colors cursor-pointer"
                      >
                        <Film className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSelect(slot.asset!.id)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${
                        selectedIds.has(slot.asset.id)
                          ? "bg-[#1e40ff] border-[#1e40ff] text-white"
                          : "border-slate-600 text-slate-400 hover:border-white"
                      }`}
                    >
                      {selectedIds.has(slot.asset.id) && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Generated Images Gallery */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-foreground">
            {isEn
              ? `Session Image Stream (${imageAssets.length})`
              : `Historial de Imágenes de la Sesión (${imageAssets.length})`}
          </h3>
          {imageAssets.length > 0 && (
            <button
              type="button"
              onClick={() => onDownloadBatchZip(imageAssets)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-primary" />
              <span>{isEn ? "Download All ZIP" : "Descargar todas (.ZIP)"}</span>
            </button>
          )}
        </div>

        {imageAssets.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-2 studio-grid">
            <div className="w-11 h-11 rounded-2xl bg-foreground text-white flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground">
              {isEn ? "Ready to stream your first batch" : "Listo para generar tu primer lote"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {isEn
                ? "Add your Gemini, OpenAI, Grok, Flux, or Fal.ai API key in the Vault, pick a batch size (2, 4, 6, or 8), and watch every variation stream into this optical bench."
                : "Configura tu API key de Gemini, OpenAI, Grok, Flux o Fal.ai en la Bóveda, elige un lote de 2, 4, 6 u 8 imágenes y observa cómo llegan progresivamente en tiempo real."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {imageAssets.map((asset) => {
              const isSelected = selectedIds.has(asset.id);
              return (
                <article
                  key={asset.id}
                  className={`group bg-card border rounded-2xl overflow-hidden transition-all flex flex-col ${
                    isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="aspect-square relative bg-[#0c0e12] overflow-hidden">
                    <img
                      src={asset.dataUrl}
                      alt={asset.prompt}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
                      onClick={() => onInspectAsset(asset)}
                    />
                    <button
                      type="button"
                      onClick={() => onToggleSelect(asset.id)}
                      aria-label={isEn ? "Select image" : "Seleccionar imagen"}
                      className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "bg-black/55 border-white/40 text-white opacity-90 hover:bg-black/80"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onInspectAsset(asset)}
                      aria-label={isEn ? "Inspect" : "Ver grande"}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/55 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {asset.driveFileId && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9px] font-mono font-bold">
                        DRIVE ✓
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <p className="text-xs font-medium text-foreground line-clamp-2">
                        {asset.prompt || asset.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                        <span className="truncate">{asset.model}</span>
                        {asset.width && asset.height && (
                          <span className="shrink-0">
                            {asset.width}×{asset.height}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => downloadSingleAsset(asset)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-primary hover:text-white border border-border text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>{isEn ? "Save" : "Bajar"}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSaveToDrive(asset)}
                          title={isEn ? "Save to Google Drive" : "Guardar en Google Drive"}
                          className="p-1.5 rounded-lg bg-background hover:bg-emerald-600 hover:text-white border border-border text-muted-foreground transition-colors cursor-pointer"
                        >
                          <CloudUpload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendToResize(asset)}
                          title={isEn ? "Resize" : "Redimensionar"}
                          className="p-1.5 rounded-lg bg-background hover:bg-foreground hover:text-white border border-border text-muted-foreground transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendToEditImage(asset)}
                          title={isEn ? "Edit Image" : "Editar Imagen"}
                          className="p-1.5 rounded-lg bg-background hover:bg-foreground hover:text-white border border-border text-muted-foreground transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
