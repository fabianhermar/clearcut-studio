"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Scissors,
  Upload,
  Camera,
  Download,
  CloudUpload,
  Play,
  Pause,
  Loader2,
  CheckCircle2,
  Film,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  blobToDataUrl,
  downloadSingleAsset,
} from "@/lib/ai-studio/export-utils";
import type { GeneratedAsset, VideoEditConfig } from "@/lib/ai-studio/types";

interface EditVideoPanelProps {
  assets: GeneratedAsset[];
  initialVideo?: GeneratedAsset | null;
  onAddAsset: (asset: GeneratedAsset) => void;
  onSaveToDrive: (asset: GeneratedAsset) => Promise<void>;
  lang?: string;
}

const DEFAULT_VIDEO_CONFIG: VideoEditConfig = {
  trimStart: 0,
  trimEnd: 10,
  playbackRate: 1,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  preset: "none",
  overlayText: "",
  overlayPosition: "bottom-left",
  muted: false,
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(1).padStart(4, "0");
  return `${String(m).padStart(2, "0")}:${s}`;
}

function buildVideoFilter(cfg: VideoEditConfig): string {
  let b = cfg.brightness;
  let c = cfg.contrast;
  let s = cfg.saturation;
  const extra: string[] = [];

  if (cfg.preset === "cinema") {
    c = Math.round(c * 1.12);
    s = Math.round(s * 0.92);
    extra.push("sepia(12%)");
  } else if (cfg.preset === "noir") {
    c = Math.round(c * 1.25);
    extra.push("grayscale(100%)");
  } else if (cfg.preset === "warm") {
    extra.push("sepia(28%)", "hue-rotate(-8deg)");
  } else if (cfg.preset === "vivid") {
    c = Math.round(c * 1.1);
    s = Math.round(s * 1.35);
  }

  return [`brightness(${b}%)`, `contrast(${c}%)`, `saturate(${s}%)`, ...extra].join(" ");
}

export function EditVideoPanel({
  assets,
  initialVideo,
  onAddAsset,
  onSaveToDrive,
  lang = "es",
}: EditVideoPanelProps) {
  const isEn = lang === "en";
  const videoAssets = assets.filter((a) => a.kind === "video");

  const [activeVideo, setActiveVideo] = useState<GeneratedAsset | null>(
    initialVideo || videoAssets[0] || null
  );
  const [config, setConfig] = useState<VideoEditConfig>({ ...DEFAULT_VIDEO_CONFIG });
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialVideo) {
      setActiveVideo(initialVideo);
      setConfig({ ...DEFAULT_VIDEO_CONFIG });
    }
  }, [initialVideo]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = config.playbackRate;
    v.muted = config.muted;
  }, [config.playbackRate, config.muted]);

  const handleUploadLocalVideo = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("video/")) return;
    const dataUrl = await blobToDataUrl(file);
    const created: GeneratedAsset = {
      id: `local-vid-${Date.now()}`,
      kind: "video",
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
    setActiveVideo(created);
    setConfig({ ...DEFAULT_VIDEO_CONFIG });
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    setDuration(v.duration);
    setConfig((prev) => ({
      ...prev,
      trimStart: 0,
      trimEnd: Number(v.duration.toFixed(2)),
    }));
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (config.trimEnd > 0 && v.currentTime >= config.trimEnd) {
      v.currentTime = config.trimStart;
      if (!isExporting) {
        v.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < config.trimStart || v.currentTime >= config.trimEnd) {
        v.currentTime = config.trimStart;
      }
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleExtractFrame = async () => {
    const v = videoRef.current;
    if (!v || !activeVideo || v.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.filter = buildVideoFilter(config);
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;

    const dataUrl = await blobToDataUrl(blob);
    const frameAsset: GeneratedAsset = {
      id: `frame-${Date.now()}`,
      kind: "image",
      name: `${activeVideo.name.replace(/\.[^.]+$/, "")}-frame-${formatTime(v.currentTime).replace(":", "m")}`,
      dataUrl,
      mimeType: "image/png",
      prompt: `Frame @ ${formatTime(v.currentTime)} · ${activeVideo.prompt}`,
      provider: activeVideo.provider,
      model: "frame-extract",
      width: canvas.width,
      height: canvas.height,
      sizeBytes: blob.size,
      createdAt: Date.now(),
    };
    onAddAsset(frameAsset);
    setFeedback(
      isEn
        ? `Frame captured (${canvas.width}×${canvas.height}) and saved to Library!`
        : `¡Fotograma capturado (${canvas.width}×${canvas.height}) y guardado en tu Biblioteca!`
    );
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExportEditedVideo = async () => {
    const v = videoRef.current;
    if (!v || !activeVideo || v.videoWidth === 0 || typeof MediaRecorder === "undefined") {
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setFeedback(null);

    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    const canvasStream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: 4_500_000,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const donePromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });

    const start = Math.max(0, config.trimStart);
    const end = Math.min(duration || v.duration, config.trimEnd || v.duration);
    const clipLen = Math.max(0.2, end - start);

    v.pause();
    v.currentTime = start;
    await new Promise<void>((r) => {
      const onSeeked = () => {
        v.removeEventListener("seeked", onSeeked);
        r();
      };
      v.addEventListener("seeked", onSeeked);
    });

    recorder.start();
    v.playbackRate = config.playbackRate;
    await v.play();
    setIsPlaying(true);

    let rafId = 0;
    const drawFrame = () => {
      ctx.filter = buildVideoFilter(config);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

      if (config.overlayText.trim()) {
        ctx.filter = "none";
        const fontSize = Math.max(18, Math.round(canvas.height * 0.042));
        ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
        const text = config.overlayText.trim();
        const metrics = ctx.measureText(text);
        const padX = 16;
        const padY = 10;
        const boxW = metrics.width + padX * 2;
        const boxH = fontSize + padY * 2;
        let x = 28;
        let y = canvas.height - boxH - 28;
        if (config.overlayPosition === "top-left") {
          x = 28;
          y = 28;
        } else if (config.overlayPosition === "bottom-center") {
          x = (canvas.width - boxW) / 2;
          y = canvas.height - boxH - 28;
        } else if (config.overlayPosition === "bottom-right") {
          x = canvas.width - boxW - 28;
          y = canvas.height - boxH - 28;
        }
        ctx.fillStyle = "rgba(12, 14, 18, 0.72)";
        ctx.fillRect(x, y, boxW, boxH);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, x + padX, y + fontSize + padY * 0.65);
      }

      const pct = Math.min(100, Math.round(((v.currentTime - start) / clipLen) * 100));
      setExportProgress(pct);

      if (v.currentTime >= end || v.ended) {
        v.pause();
        setIsPlaying(false);
        recorder.stop();
        return;
      }
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    const outBlob = await donePromise;
    cancelAnimationFrame(rafId);

    const outDataUrl = await blobToDataUrl(outBlob);
    const exportedAsset: GeneratedAsset = {
      id: `edited-vid-${Date.now()}`,
      kind: "video",
      name: `${activeVideo.name.replace(/\.[^.]+$/, "")}-edited`,
      dataUrl: outDataUrl,
      mimeType: "video/webm",
      prompt: activeVideo.prompt,
      provider: activeVideo.provider,
      model: `${activeVideo.model} (edited)`,
      durationSec: Number((clipLen / config.playbackRate).toFixed(1)),
      sizeBytes: outBlob.size,
      createdAt: Date.now(),
    };
    onAddAsset(exportedAsset);
    await downloadSingleAsset(exportedAsset);
    setIsExporting(false);
    setExportProgress(100);
    setFeedback(
      isEn
        ? "Edited video exported (.webm) and added to Library!"
        : "¡Video editado exportado (.webm) y añadido a tu Biblioteca!"
    );
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#0f766e]">
            MOTION SUITE // {isEn ? "TRIM, GRADE & FRAME EXTRACT" : "RECORTE, COLOR Y EXTRACTOR DE FOTOGRAMAS"}
          </span>
          <h2 className="text-xl font-heading font-bold text-foreground">
            {isEn ? "Video Editor & Frame Extractor" : "Editor de Video y Extractor de Fotogramas"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleUploadLocalVideo(e.target.files?.[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>{isEn ? "Upload Video" : "Subir Video"}</span>
          </button>
          {activeVideo && (
            <button
              type="button"
              onClick={() => onSaveToDrive(activeVideo)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-600/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Google Drive</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Video Darkroom Monitor + Timeline */}
        <section className="lg:col-span-8 rounded-2xl border border-[#242936] bg-[#0c0e12] text-white p-4 flex flex-col justify-between gap-4 darkroom-chassis">
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
            {!activeVideo ? (
              <div className="text-center space-y-3 p-6">
                <Film className="w-9 h-9 text-slate-500 mx-auto" />
                <p className="text-sm text-slate-300">
                  {isEn
                    ? "Upload a local MP4/WebM clip or generate an AI video to start editing."
                    : "Sube un video local MP4/WebM o genera un video con IA para comenzar a editar."}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-[#1e40ff] text-white text-xs font-semibold cursor-pointer"
                >
                  {isEn ? "Open Video File" : "Abrir Archivo de Video"}
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={activeVideo.dataUrl}
                  playsInline
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  style={{ filter: buildVideoFilter(config) }}
                  className="w-full h-full object-contain"
                />
                {config.overlayText.trim() && (
                  <div
                    className={`absolute px-3 py-1.5 rounded bg-black/70 text-white text-sm font-bold pointer-events-none ${
                      config.overlayPosition === "top-left"
                        ? "top-4 left-4"
                        : config.overlayPosition === "bottom-center"
                        ? "bottom-4 left-1/2 -translate-x-1/2"
                        : config.overlayPosition === "bottom-right"
                        ? "bottom-4 right-4"
                        : "bottom-4 left-4"
                    }`}
                  >
                    {config.overlayText}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Transport + Trim Timeline */}
          {activeVideo && (
            <div className="space-y-3 p-3.5 rounded-xl bg-[#14171f] border border-[#242936]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-[#1e40ff] hover:bg-[#1530cc] text-white flex items-center justify-center cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, muted: !c.muted }))}
                    className="p-2 rounded-lg bg-[#1d2230] text-slate-200 hover:text-white cursor-pointer"
                  >
                    {config.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="text-xs font-mono text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleExtractFrame}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d2230] hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isEn ? "Capture Frame PNG" : "Capturar Fotograma PNG"}</span>
                </button>
              </div>

              {/* Scrubber */}
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.05}
                value={currentTime}
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setCurrentTime(t);
                  if (videoRef.current) videoRef.current.currentTime = t;
                }}
              />

              {/* Trim IN / OUT */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>TRIM IN</span>
                    <span className="text-emerald-400">{formatTime(config.trimStart)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0.1, config.trimEnd - 0.1)}
                    step={0.1}
                    value={config.trimStart}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, trimStart: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>TRIM OUT</span>
                    <span className="text-[#ff4d00]">{formatTime(config.trimEnd)}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.min(duration, config.trimStart + 0.1)}
                    max={duration || 1}
                    step={0.1}
                    value={config.trimEnd}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, trimEnd: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Video Switcher Strip */}
          {videoAssets.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              {videoAssets.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveVideo(v)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border shrink-0 cursor-pointer ${
                    activeVideo?.id === v.id
                      ? "bg-[#1e40ff] border-[#1e40ff] text-white"
                      : "bg-[#14171f] border-[#242936] text-slate-300"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right Controls: Grade, Speed, Watermark & Export */}
        <section className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 tactile-surface flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1.5">
                {isEn ? "Cinematic Look" : "Filtro Cinematográfico"}
              </span>
              <div className="grid grid-cols-5 gap-1">
                {(["none", "cinema", "noir", "warm", "vivid"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, preset: p }))}
                    className={`py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase cursor-pointer ${
                      config.preset === p
                        ? "bg-foreground text-white border-foreground"
                        : "bg-background border-border"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1.5">
                {isEn ? "Playback Speed" : "Velocidad"}
              </span>
              <div className="grid grid-cols-6 gap-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, playbackRate: spd }))}
                    className={`py-1 rounded-lg border text-[11px] font-mono font-bold cursor-pointer ${
                      config.playbackRate === spd
                        ? "bg-primary text-white border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            {/* Color Sliders */}
            <div className="space-y-2.5">
              {[
                { key: "brightness", es: "Brillo", en: "Brightness" },
                { key: "contrast", es: "Contraste", en: "Contrast" },
                { key: "saturation", es: "Saturación", en: "Saturation" },
              ].map((s) => (
                <div key={s.key} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">{isEn ? s.en : s.es}</span>
                    <span className="font-bold">
                      {config[s.key as "brightness" | "contrast" | "saturation"]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={180}
                    value={config[s.key as "brightness" | "contrast" | "saturation"]}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, [s.key]: Number(e.target.value) }))
                    }
                  />
                </div>
              ))}
            </div>

            {/* Text Overlay */}
            <div className="space-y-2 pt-2 border-t border-border/70">
              <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">
                {isEn ? "Text / Watermark Overlay" : "Texto / Marca Superpuesta"}
              </label>
              <input
                type="text"
                value={config.overlayText}
                onChange={(e) => setConfig((c) => ({ ...c, overlayText: e.target.value }))}
                placeholder={isEn ? "Optional title or caption..." : "Título o marca opcional..."}
                className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground"
              />
              <select
                value={config.overlayPosition}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    overlayPosition: e.target.value as VideoEditConfig["overlayPosition"],
                  }))
                }
                className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs"
              >
                <option value="bottom-left">{isEn ? "Bottom Left" : "Abajo Izquierda"}</option>
                <option value="bottom-center">{isEn ? "Bottom Center" : "Abajo Centro"}</option>
                <option value="bottom-right">{isEn ? "Bottom Right" : "Abajo Derecha"}</option>
                <option value="top-left">{isEn ? "Top Left" : "Arriba Izquierda"}</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-2">
            {feedback && (
              <div className="p-2.5 rounded-lg bg-emerald-500/12 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {isExporting && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-primary font-bold">
                  <span>{isEn ? "RENDERING CLIP..." : "EXPORTANDO VIDEO..."}</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!activeVideo || isExporting}
              onClick={handleExportEditedVideo}
              className="w-full py-2.5 px-4 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold inline-flex items-center justify-center gap-2 tactile-button cursor-pointer"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Scissors className="w-4 h-4" />
              )}
              <span>{isEn ? "Export Edited Video (.WebM)" : "Exportar Video Editado (.WebM)"}</span>
            </button>

            {activeVideo && (
              <button
                type="button"
                onClick={() => downloadSingleAsset(activeVideo)}
                className="w-full py-2 px-4 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isEn ? "Download Original Clip" : "Descargar Clip Original"}</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
