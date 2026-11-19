"use client";

import React, { useState } from "react";
import {
  Volume2,
  Sparkles,
  Download,
  CloudUpload,
  KeyRound,
  Loader2,
  AlertTriangle,
  Music,
} from "lucide-react";
import {
  AUDIO_VOICES,
  getModelsByKind,
  getProviderMeta,
  hasProviderKey,
} from "@/lib/ai-studio/providers";
import { downloadSingleAsset, formatFileSize } from "@/lib/ai-studio/export-utils";
import { ModelSelector } from "./model-selector";
import type { ApiKeyVault, GeneratedAsset } from "@/lib/ai-studio/types";

interface CreateAudioPanelProps {
  vault: ApiKeyVault;
  assets: GeneratedAsset[];
  onAddAsset: (asset: GeneratedAsset) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  onOpenApiVault: () => void;
  lang?: string;
}

export function CreateAudioPanel({
  vault,
  assets,
  onAddAsset,
  onSaveToDrive,
  onOpenApiVault,
  lang = "es",
}: CreateAudioPanelProps) {
  const isEn = lang === "en";
  const audioModels = getModelsByKind("audio");

  const [selectedModelId, setSelectedModelId] = useState(audioModels[0].id);
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState("Kore");
  const [durationSec, setDurationSec] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedModel = audioModels.find((m) => m.id === selectedModelId) || audioModels[0];
  const providerMeta = getProviderMeta(selectedModel.provider);
  const providerReady = hasProviderKey(vault, selectedModel.provider);
  const audioAssets = assets.filter((a) => a.kind === "audio");

  const availableVoices =
    selectedModel.provider === "openai"
      ? AUDIO_VOICES.openai
      : selectedModel.provider === "elevenlabs" && selectedModel.id !== "eleven_sound_effects"
      ? AUDIO_VOICES.elevenlabs
      : selectedModel.provider === "gemini"
      ? AUDIO_VOICES.gemini
      : [];

  const isMusicOrSfx =
    selectedModel.id === "eleven_sound_effects" || selectedModel.provider === "fal";

  const handleModelChange = (nextId: string) => {
    setSelectedModelId(nextId);
    const next = audioModels.find((m) => m.id === nextId);
    if (next?.provider === "openai") setVoice(AUDIO_VOICES.openai[0].id);
    if (next?.provider === "elevenlabs") setVoice(AUDIO_VOICES.elevenlabs[0].id);
    if (next?.provider === "gemini") setVoice(AUDIO_VOICES.gemini[0].id);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!providerReady) {
      onOpenApiVault();
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const entry = vault[selectedModel.provider];
      const res = await fetch("/api/ai/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": entry.apiKey.trim(),
        },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          prompt: prompt.trim(),
          voice: availableVoices.length > 0 ? voice : undefined,
          durationSec: isMusicOrSfx ? durationSec : undefined,
          customBaseUrl: entry.baseUrl,
          customModel: entry.customModel,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      onAddAsset({
        id: `audio-${Date.now()}`,
        kind: "audio",
        name: `clearcut-audio-${selectedModel.provider}`,
        dataUrl: data.dataUrl,
        mimeType: data.mimeType || "audio/mpeg",
        prompt: prompt.trim(),
        provider: selectedModel.provider,
        model: selectedModel.id,
        sizeBytes: data.sizeBytes,
        createdAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 tactile-surface space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-amber-800">
              <Volume2 className="w-3.5 h-3.5" />
              <span>ACOUSTIC LAB // {isEn ? "VOICE, SFX & MUSIC" : "VOZ, SFX Y MÚSICA IA"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mt-0.5">
              {isEn ? "AI Audio & Speech Studio" : "Estudio de Audio, Voz y Efectos IA"}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ModelSelector
              models={audioModels}
              selectedModelId={selectedModelId}
              onSelect={handleModelChange}
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
                <span>{isEn ? `Add ${providerMeta.shortName} Key` : `Añadir Key ${providerMeta.shortName}`}</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder={
            isMusicOrSfx
              ? isEn
                ? "Describe the sound effect or musical track (e.g. 'Warm ambient synth pad with subtle vinyl crackle')..."
                : "Describe el efecto de sonido o pista musical (ej. 'Ambiente electrónico cálido con textura cinematográfica')..."
              : isEn
              ? "Write the script to synthesize into natural voice narration..."
              : "Escribe el guion o locución para sintetizar con voz neuronal natural..."
          }
          className="w-full p-3.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
        />

        <div className="flex flex-wrap items-end justify-between gap-4">
          {availableVoices.length > 0 && (
            <div className="space-y-1.5">
              <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">
                {isEn ? "Voice Profile" : "Perfil de Voz"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableVoices.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoice(v.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      voice === v.id
                        ? "bg-foreground text-white border-foreground"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {v.label}{" "}
                    <span className="opacity-70 font-normal">
                      · {isEn ? v.toneEn : v.toneEs}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isMusicOrSfx && (
            <div className="w-60 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-muted-foreground">
                <span>{isEn ? "Duration" : "Duración"}</span>
                <span>{durationSec}s</span>
              </div>
              <input
                type="range"
                min={2}
                max={22}
                value={durationSec}
                onChange={(e) => setDurationSec(Number(e.target.value))}
              />
            </div>
          )}

          <button
            type="button"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
            className="h-10 px-6 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-45 text-white text-xs font-bold inline-flex items-center gap-2 tactile-button cursor-pointer ml-auto"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isEn ? "Synthesize Audio" : "Generar Audio"}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Audio Tracks List */}
      <section className="space-y-3">
        <h3 className="font-heading font-bold text-base text-foreground">
          {isEn ? `Generated Audio Clips (${audioAssets.length})` : `Pistas de Audio Generadas (${audioAssets.length})`}
        </h3>

        {audioAssets.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-2 studio-grid">
            <Music className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">
              {isEn ? "No audio clips generated yet" : "Aún no hay pistas de audio generadas"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {audioAssets.map((clip) => (
              <div
                key={clip.id}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-500/12 text-amber-900 font-mono text-[10px] font-bold uppercase">
                      {clip.model}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {formatFileSize(clip.sizeBytes)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{clip.prompt}</p>
                  <audio src={clip.dataUrl} controls className="w-full h-9" />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadSingleAsset(clip)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-foreground hover:bg-primary text-white text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEn ? "Download" : "Descargar"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveToDrive(clip)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-600/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>{clip.driveFileId ? "Drive ✓" : "Drive"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
