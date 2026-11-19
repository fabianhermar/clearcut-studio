import { NextRequest } from "next/server";
import {
  assertSafeExternalUrl,
  fetchRemoteMediaAsDataUrl,
} from "@/lib/ai-studio/server-providers";
import type { AiProviderId } from "@/lib/ai-studio/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface AudioRequestBody {
  provider: AiProviderId;
  model: string;
  prompt: string;
  voice?: string;
  durationSec?: number;
  customBaseUrl?: string;
  customModel?: string;
}

function pcmToWavBase64(pcmBase64: string, sampleRate = 24000, channels = 1): string {
  const pcmBuf = Buffer.from(pcmBase64, "base64");
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuf.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcmBuf.length, 40);
  return Buffer.concat([header, pcmBuf]).toString("base64");
}

export async function POST(req: NextRequest) {
  const apiKey = (req.headers.get("x-api-key") || "").trim();
  if (!apiKey) {
    return Response.json({ error: "Missing x-api-key header." }, { status: 401 });
  }

  let body: AudioRequestBody;
  try {
    body = (await req.json()) as AudioRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return Response.json({ error: "Text or audio prompt is required." }, { status: 400 });
  }

  try {
    // 1. OPENAI TTS
    if (body.provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.model,
          input: body.prompt.trim(),
          voice: body.voice || "nova",
          response_format: "mp3",
        }),
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        return Response.json({ error: `${res.status}: ${err.slice(0, 220)}` }, { status: res.status });
      }
      const buf = Buffer.from(await res.arrayBuffer());
      return Response.json({
        dataUrl: `data:audio/mpeg;base64,${buf.toString("base64")}`,
        mimeType: "audio/mpeg",
        sizeBytes: buf.byteLength,
      });
    }

    // 2. ELEVENLABS (TTS or SFX)
    if (body.provider === "elevenlabs") {
      const isSfx = body.model === "eleven_sound_effects";
      const endpoint = isSfx
        ? "https://api.elevenlabs.io/v1/sound-generation"
        : `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
            body.voice || "21m00Tcm4TlvDq8ikWAM"
          )}`;

      const payload = isSfx
        ? {
            text: body.prompt.trim(),
            duration_seconds: Math.max(1, Math.min(22, body.durationSec || 6)),
          }
        : {
            text: body.prompt.trim(),
            model_id: body.model || "eleven_multilingual_v2",
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        return Response.json({ error: `${res.status}: ${err.slice(0, 220)}` }, { status: res.status });
      }
      const buf = Buffer.from(await res.arrayBuffer());
      return Response.json({
        dataUrl: `data:audio/mpeg;base64,${buf.toString("base64")}`,
        mimeType: "audio/mpeg",
        sizeBytes: buf.byteLength,
      });
    }

    // 3. GOOGLE AI STUDIO (LYRIA MUSIC INTERACTIONS API & GEMINI TTS)
    if (body.provider === "gemini") {
      // Lyria music models use Google's Interactions API (/v1beta/interactions)
      if (body.model.startsWith("lyria-")) {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            model: body.model,
            input: body.prompt.trim(),
          }),
          signal: AbortSignal.timeout(55_000),
        });
        if (!res.ok) {
          const err = await res.text().catch(() => res.statusText);
          return Response.json({ error: `${res.status}: ${err.slice(0, 220)}` }, { status: res.status });
        }
        const data = (await res.json()) as {
          output_audio?: { data?: string; mime_type?: string; uri?: string };
          outputs?: Array<{ type?: string; data?: string; mime_type?: string; uri?: string }>;
        };
        const audioOut =
          data.output_audio ||
          data.outputs?.find((o) => o.type === "audio" || o.mime_type?.startsWith("audio/"));

        if (audioOut?.data) {
          const mimeType = audioOut.mime_type || "audio/mpeg";
          return Response.json({
            dataUrl: `data:${mimeType};base64,${audioOut.data}`,
            mimeType,
            sizeBytes: Math.round((audioOut.data.length * 3) / 4),
          });
        }
        if (audioOut?.uri) {
          const fetched = await fetchRemoteMediaAsDataUrl(
            audioOut.uri,
            { "x-goog-api-key": apiKey },
            "audio/mpeg"
          );
          return Response.json(fetched);
        }
        return Response.json({ error: "Lyria returned no audio output." }, { status: 502 });
      }

      // Gemini TTS models use generateContent
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        body.model
      )}:generateContent`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: body.prompt.trim() }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: body.voice || "Kore",
                },
              },
            },
          },
        }),
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        return Response.json({ error: `${res.status}: ${err.slice(0, 220)}` }, { status: res.status });
      }
      const data = (await res.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              inlineData?: { mimeType?: string; data?: string };
            }>;
          };
        }>;
      };
      const audioPart = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!audioPart?.inlineData?.data) {
        return Response.json({ error: "Gemini returned no audio data" }, { status: 502 });
      }
      const rawMime = audioPart.inlineData.mimeType || "audio/L16";
      if (rawMime.includes("L16") || rawMime.includes("pcm")) {
        const wavB64 = pcmToWavBase64(audioPart.inlineData.data);
        return Response.json({
          dataUrl: `data:audio/wav;base64,${wavB64}`,
          mimeType: "audio/wav",
          sizeBytes: Math.round((wavB64.length * 3) / 4),
        });
      }
      return Response.json({
        dataUrl: `data:${rawMime};base64,${audioPart.inlineData.data}`,
        mimeType: rawMime,
        sizeBytes: Math.round((audioPart.inlineData.data.length * 3) / 4),
      });
    }

    // 4. FAL.AI STABLE AUDIO
    if (body.provider === "fal") {
      const res = await fetch(`https://fal.run/${body.model}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: body.prompt.trim(),
          seconds_total: Math.max(2, Math.min(30, body.durationSec || 10)),
        }),
        signal: AbortSignal.timeout(55_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        return Response.json({ error: `${res.status}: ${err.slice(0, 220)}` }, { status: res.status });
      }
      const data = (await res.json()) as { audio_file?: { url?: string }; audio?: { url?: string } };
      const audioUrl = data.audio_file?.url || data.audio?.url;
      if (!audioUrl) {
        return Response.json({ error: "Fal returned no audio URL" }, { status: 502 });
      }
      const fetched = await fetchRemoteMediaAsDataUrl(audioUrl, undefined, "audio/wav");
      return Response.json(fetched);
    }

    // 5. CUSTOM OPENAI-COMPATIBLE AUDIO
    if (body.provider === "custom") {
      if (!body.customBaseUrl?.trim()) {
        return Response.json({ error: "Custom Base URL missing." }, { status: 400 });
      }
      const cleanBase = body.customBaseUrl.trim().replace(/\/+$/, "");
      const url = cleanBase.endsWith("/audio/speech") ? cleanBase : `${cleanBase}/audio/speech`;
      assertSafeExternalUrl(url);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.customModel?.trim() || body.model,
          input: body.prompt.trim(),
          voice: body.voice || "alloy",
        }),
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        return Response.json({ error: `${res.status}: ${err.slice(0, 220)}` }, { status: res.status });
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = (res.headers.get("content-type") || "audio/mpeg").split(";")[0];
      return Response.json({
        dataUrl: `data:${mime};base64,${buf.toString("base64")}`,
        mimeType: mime,
        sizeBytes: buf.byteLength,
      });
    }

    return Response.json({ error: `Unsupported audio provider: ${body.provider}` }, { status: 400 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Audio generation failed" },
      { status: 500 }
    );
  }
}
