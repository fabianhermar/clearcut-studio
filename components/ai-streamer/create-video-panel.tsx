"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Film,
  Sparkles,
  ImagePlus,
  Download,
  CloudUpload,
  Scissors,
  KeyRound,
  Loader2,
  X,
  AlertTriangle,
  Archive,
} from "lucide-react";
import {
  getModelsByKind,
  getProviderMeta,
  hasProviderKey,
} from "@/lib/ai-studio/providers";
import { blobToDataUrl, downloadSingleAsset } from "@/lib/ai-studio/export-utils";
import { ModelSelector } from "./model-selector";
import type { ApiKeyVault, GeneratedAsset } from "@/lib/ai-studio/types";

interface CreateVideoPanelProps {
  vault: ApiKeyVault;
  assets: GeneratedAsset[];
  initialReferenceAsset?: GeneratedAsset | null;
  onAddAsset: (asset: GeneratedAsset) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  onSendToEditVideo: (asset: GeneratedAsset) => void;
  onOpenApiVault: () => void;
  onDownloadBatchZip: (items: GeneratedAsset[]) => Promise<void>;
  lang?: string;
}

const VIDEO_DURATIONS = [4, 5, 6, 8, 10];
const VIDEO_RATIOS = ["16:9", "9:16", "1:1"];

export function CreateVideoPanel({
  vault,
  assets,
  initialReferenceAsset,
  onAddAsset,
  onSaveToDrive,
  onSendToEditVideo,
  onOpenApiVault,
  onDownloadBatchZip,
  lang = "es",
}: CreateVideoPanelProps) {
  const isEn = lang === "en";
  const videoModels = getModelsByKind("video");

  const [selectedModelId, setSelectedModelId] = useState(videoModels[0].id);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [durationSec, setDurationSec] = useState(5);
  const [referenceImage, setReferenceImage] = useState<string | null>(
    initialReferenceAsset?.dataUrl || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusLabel, setStatusLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (initialReferenceAsset?.dataUrl) {
      setReferenceImage(initialReferenceAsset.dataUrl);
      if (!prompt && initialReferenceAsset.prompt) {
        setPrompt(`Smooth cinematic camera push-in on: ${initialReferenceAsset.prompt}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReferenceAsset?.id]);

  const selectedModel = videoModels.find((m) => m.id === selectedModelId) || videoModels[0];
  const providerMeta = getProviderMeta(selectedModel.provider);
  const providerReady = hasProviderKey(vault, selectedModel.provider);
  const videoAssets = assets.filter((a) => a.kind === "video");
  const sessionImages = assets.filter((a) => a.kind === "image");

  const handleUploadFrame = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setReferenceImage(await blobToDataUrl(file));
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;
    if (!providerReady) {
      onOpenApiVault();
      return;
    }

    setError(null);
    setIsGenerating(true);
    cancelledRef.current = false;
    setStatusLabel(isEn ? "Submitting video render job..." : "Enviando trabajo de render de video...");

    try {
      const entry = vault[selectedModel.provider];
      const startRes = await fetch("/api/ai/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": entry.apiKey.trim(),
        },
        body: JSON.stringify({
          action: "start",
          provider: selectedModel.provider,
          model: selectedModel.id,
          prompt: prompt.trim(),
          aspectRatio,
          durationSec,
          referenceImage: referenceImage || undefined,
          customBaseUrl: entry.baseUrl,
          customModel: entry.customModel,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || startData.error) {
        throw new Error(startData.error || `HTTP ${startRes.status}`);
      }

      if (startData.status === "completed" && startData.dataUrl) {
        const asset: GeneratedAsset = {
          id: `video-${Date.now()}`,
          kind: "video",
          name: `clearcut-video-${selectedModel.provider}`,
          dataUrl: startData.dataUrl,
          mimeType: startData.mimeType || "video/mp4",
          prompt: prompt.trim(),
          provider: selectedModel.provider,
          model: selectedModel.id,
          aspectRatio,
          durationSec,
          sizeBytes: startData.sizeBytes,
          createdAt: Date.now(),
        };
        onAddAsset(asset);
        setIsGenerating(false);
        return;
      }

      const pollUrl = startData.pollUrl;
      if (!pollUrl) {
        throw new Error(isEn ? "Provider did not return a status polling URL." : "El proveedor no devolvió URL de estado.");
      }

      for (let attempt = 1; attempt <= 60; attempt++) {
        if (cancelledRef.current) break;
        setStatusLabel(
          isEn
            ? `Rendering video on ${providerMeta.shortName}... (check ${attempt}/60)`
            : `Renderizando video en ${providerMeta.shortName}... (consulta ${attempt}/60)`
        );
        await new Promise((r) => setTimeout(r, 4000));
        if (cancelledRef.current) break;

        const pollRes = await fetch("/api/ai/video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": entry.apiKey.trim(),
          },
          body: JSON.stringify({
            action: "poll",
            provider: selectedModel.provider,
            model: selectedModel.id,
            operationId: startData.operationId,
            pollUrl,
          }),
        });

        const pollData = await pollRes.json();
        if (pollData.error) throw new Error(pollData.error);

        if (pollData.status === "completed" && pollData.dataUrl) {
          const asset: GeneratedAsset = {
            id: `video-${Date.now()}`,
            kind: "video",
            name: `clearcut-video-${selectedModel.provider}`,
            dataUrl: pollData.dataUrl,
            mimeType: pollData.mimeType || "video/mp4",
            prompt: prompt.trim(),
            provider: selectedModel.provider,
            model: selectedModel.id,
            aspectRatio,
            durationSec,
            sizeBytes: pollData.sizeBytes,
            createdAt: Date.now(),
          };
          onAddAsset(asset);
          setStatusLabel("");
          setIsGenerating(false);
          return;
        }
        if (pollData.status === "failed") {
          throw new Error(pollData.error || "Video rendering failed");
        }
      }

      if (!cancelledRef.current) {
        throw new Error(
          isEn
            ? "Video generation is taking longer than expected. Check your provider dashboard."
            : "La generación de video tardó más de lo esperado. Verifica el estado en tu proveedor."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video error");
    } finally {
      setIsGenerating(false);
      setStatusLabel("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 tactile-surface space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#0f766e]">
              <Film className="w-3.5 h-3.5" />
              <span>MOTION ENGINE // {isEn ? "TEXT & IMAGE TO VIDEO" : "TEXTO E IMAGEN A VIDEO"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mt-0.5">
              {isEn ? "AI Video Generator" : "Generador de Video con IA"}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ModelSelector
              models={videoModels}
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff4d00]/12 border border-[#ff4d00]/30 text-[#b83700] text-xs font-mono font-bold cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  {isEn ? `Add ${providerMeta.shortName} Key` : `Añadir Key ${providerMeta.shortName}`}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={
                isEn
                  ? "Describe camera motion, lighting transitions, subject action, and pacing..."
                  : "Describe el movimiento de cámara, acción del sujeto, atmósfera e iluminación cinematográfica..."
              }
              className="w-full p-3.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">
                  {isEn ? "Aspect Ratio" : "Formato"}
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-background border border-border">
                  {VIDEO_RATIOS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                        aspectRatio === r
                          ? "bg-[#0c0e12] text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">
                  {isEn ? "Duration" : "Duración"}
                </span>
                <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-background border border-border">
                  {VIDEO_DURATIONS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setDurationSec(sec)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                        durationSec === sec
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={() => {
                      cancelledRef.current = true;
                      setIsGenerating(false);
                    }}
                    className="w-full h-10 rounded-xl bg-destructive text-white text-xs font-bold cursor-pointer"
                  >
                    {isEn ? "Cancel Polling" : "Cancelar"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!prompt.trim()}
                    onClick={handleGenerateVideo}
                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-45 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 tactile-button cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isEn ? "Generate Video" : "Generar Video"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Starting Keyframe Picker (Image-to-Video) */}
          <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#faf9f5] border border-dashed border-border flex flex-col justify-between gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadFrame(e.target.files?.[0])}
              className="hidden"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                {isEn ? "Keyframe (Image-to-Video)" : "Fotograma Inicial (Opcional)"}
              </span>
              {referenceImage && (
                <button
                  type="button"
                  onClick={() => setReferenceImage(null)}
                  className="text-[10px] font-mono text-destructive hover:underline cursor-pointer"
                >
                  {isEn ? "Clear" : "Quitar"}
                </button>
              )}
            </div>

            {referenceImage ? (
              <div className="relative h-28 rounded-xl overflow-hidden border border-border bg-[#0c0e12]">
                <img src={referenceImage} alt="Keyframe" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setReferenceImage(null)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-3 text-center">
                <ImagePlus className="w-5 h-5 text-muted-foreground mb-1" />
                <p className="text-[11px] text-muted-foreground">
                  {isEn ? "Upload an image or pick one from session" : "Sube una foto o elige de tu sesión"}
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-[11px] font-semibold cursor-pointer"
              >
                + {isEn ? "Upload Frame" : "Subir imagen"}
              </button>
              {sessionImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReferenceImage(sessionImages[0].dataUrl)}
                  className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-[11px] font-semibold text-primary cursor-pointer"
                >
                  {isEn ? "Use latest" : "Última img"}
                </button>
              )}
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="p-3.5 rounded-xl bg-[#0c0e12] text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <Loader2 className="w-4 h-4 text-[#60a5fa] animate-spin shrink-0" />
              <span>{statusLabel}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">ASYNC JOB</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Generated Video Gallery */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-foreground">
            {isEn ? `Generated Videos (${videoAssets.length})` : `Videos Generados (${videoAssets.length})`}
          </h3>
          {videoAssets.length > 0 && (
            <button
              type="button"
              onClick={() => onDownloadBatchZip(videoAssets)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-primary" />
              <span>{isEn ? "Download All ZIP" : "Descargar videos (.ZIP)"}</span>
            </button>
          )}
        </div>

        {videoAssets.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-2 studio-grid">
            <Film className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">
              {isEn ? "No AI videos generated yet" : "Aún no hay videos generados en esta sesión"}
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {isEn
                ? "Connect Gemini (Veo), OpenAI (Sora), xAI Grok, or Fal.ai (Kling/Luma) to generate clips, then trim, color-grade, and extract frames in the Video Editor."
                : "Conecta Gemini (Veo), OpenAI (Sora), xAI Grok o Fal.ai (Kling/Luma) para generar clips; luego recórtalos, ajusta el color y extrae fotogramas en el Editor de Video."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoAssets.map((video) => (
              <div
                key={video.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft"
              >
                <div className="bg-[#0c0e12] aspect-video relative">
                  <video
                    src={video.dataUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground line-clamp-2">
                      {video.prompt || video.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {video.model} · {video.aspectRatio || "16:9"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/70">
                    <button
                      type="button"
                      onClick={() => downloadSingleAsset(video)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground hover:bg-primary text-white text-xs font-semibold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? "Download" : "Descargar"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendToEditVideo(video)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5 text-primary" />
                      <span>{isEn ? "Edit Video" : "Editar Video"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveToDrive(video)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-600/20 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>{video.driveFileId ? "Drive ✓" : "Google Drive"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
