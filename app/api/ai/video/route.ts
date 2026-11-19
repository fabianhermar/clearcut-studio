import { NextRequest } from "next/server";
import {
  assertSafeExternalUrl,
  fetchRemoteMediaAsDataUrl,
  stripDataUrlPrefix,
} from "@/lib/ai-studio/server-providers";
import type { AiProviderId } from "@/lib/ai-studio/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface VideoRequestBody {
  action: "start" | "poll";
  provider: AiProviderId;
  model: string;
  prompt?: string;
  aspectRatio?: string;
  durationSec?: number;
  referenceImage?: string;
  operationId?: string;
  pollUrl?: string;
  customBaseUrl?: string;
  customModel?: string;
}

async function parseErr(res: Response): Promise<string> {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return `${res.status}: ${j?.error?.message || j?.message || j?.detail || txt.slice(0, 220)}`;
  } catch {
    return `${res.status}: ${txt.slice(0, 220) || res.statusText}`;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = (req.headers.get("x-api-key") || "").trim();
  if (!apiKey) {
    return Response.json({ error: "Missing x-api-key header." }, { status: 401 });
  }

  let body: VideoRequestBody;
  try {
    body = (await req.json()) as VideoRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    // ================= START VIDEO JOB =================
    if (body.action === "start") {
      if (!body.prompt?.trim()) {
        return Response.json({ error: "Prompt is required." }, { status: 400 });
      }

      // 1. GOOGLE AI STUDIO (GEMINI OMNI INTERACTIONS API & VEO 3.1)
      if (body.provider === "gemini") {
        // Gemini Omni models use the Google Interactions API (/v1beta/interactions)
        if (body.model.startsWith("gemini-omni-")) {
          const inputPayload: unknown = body.referenceImage
            ? [
                {
                  type: "image",
                  data: stripDataUrlPrefix(body.referenceImage).base64,
                  mime_type: stripDataUrlPrefix(body.referenceImage).mimeType,
                },
                {
                  type: "text",
                  text: `${body.prompt.trim()} (aspect ratio ${body.aspectRatio || "16:9"}, duration ~${body.durationSec || 5}s)`,
                },
              ]
            : `${body.prompt.trim()} (aspect ratio ${body.aspectRatio || "16:9"}, duration ~${body.durationSec || 5}s)`;

          const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              model: body.model,
              input: inputPayload,
            }),
            signal: AbortSignal.timeout(90_000),
          });
          if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
          const data = (await res.json()) as {
            id?: string;
            status?: string;
            output_video?: { data?: string; mime_type?: string; uri?: string };
            outputs?: Array<{
              type?: string;
              data?: string;
              mime_type?: string;
              uri?: string;
            }>;
          };

          const videoOutput =
            data.output_video ||
            data.outputs?.find(
              (o) => o.type === "video" || o.mime_type?.startsWith("video/")
            );

          if (videoOutput?.data) {
            const mimeType = videoOutput.mime_type || "video/mp4";
            return Response.json({
              status: "completed",
              dataUrl: `data:${mimeType};base64,${videoOutput.data}`,
              mimeType,
              sizeBytes: Math.round((videoOutput.data.length * 3) / 4),
            });
          }
          if (videoOutput?.uri) {
            const media = await fetchRemoteMediaAsDataUrl(
              videoOutput.uri,
              { "x-goog-api-key": apiKey },
              "video/mp4"
            );
            return Response.json({ status: "completed", ...media });
          }
          if (data.id) {
            return Response.json({
              status: "processing",
              operationId: data.id,
              pollUrl: `https://generativelanguage.googleapis.com/v1beta/interactions/${encodeURIComponent(data.id)}`,
            });
          }
          return Response.json({ error: "Gemini Omni returned no video output." }, { status: 502 });
        }

        // Veo 3.1 models use predictLongRunning
        const instance: Record<string, unknown> = { prompt: body.prompt.trim() };
        if (body.referenceImage) {
          const { mimeType, base64 } = stripDataUrlPrefix(body.referenceImage);
          instance.image = { bytesBase64Encoded: base64, mimeType };
        }
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          body.model
        )}:predictLongRunning`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            instances: [instance],
            parameters: {
              aspectRatio: body.aspectRatio || "16:9",
              durationSeconds: body.durationSec || 5,
            },
          }),
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as { name?: string };
        return Response.json({
          status: "processing",
          operationId: data.name,
          pollUrl: `https://generativelanguage.googleapis.com/v1beta/${data.name}`,
        });
      }

      // 2. OPENAI SORA
      if (body.provider === "openai") {
        const payload: Record<string, unknown> = {
          model: body.model,
          prompt: body.prompt.trim(),
          seconds: String(body.durationSec || 4),
          size: body.aspectRatio === "9:16" ? "720x1280" : "1280x720",
        };
        const res = await fetch("https://api.openai.com/v1/videos", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as { id?: string; status?: string };
        return Response.json({
          status: data.status || "processing",
          operationId: data.id,
          pollUrl: `https://api.openai.com/v1/videos/${data.id}`,
        });
      }

      // 3. xAI GROK VIDEO
      if (body.provider === "xai") {
        const payload: Record<string, unknown> = {
          model: body.model,
          prompt: body.prompt.trim(),
          duration: body.durationSec || 5,
          aspect_ratio: body.aspectRatio || "16:9",
        };
        if (body.referenceImage) {
          payload.image = { url: body.referenceImage };
        }
        const res = await fetch("https://api.x.ai/v1/videos/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as { request_id?: string; id?: string };
        const reqId = data.request_id || data.id;
        return Response.json({
          status: "processing",
          operationId: reqId,
          pollUrl: `https://api.x.ai/v1/videos/${reqId}`,
        });
      }

      // 4. FAL.AI QUEUE (Kling / Luma)
      if (body.provider === "fal") {
        const payload: Record<string, unknown> = {
          prompt: body.prompt.trim(),
          aspect_ratio: body.aspectRatio || "16:9",
          duration: String(body.durationSec || 5),
        };
        if (body.referenceImage) {
          payload.image_url = body.referenceImage;
        }
        const res = await fetch(`https://queue.fal.run/${body.model}`, {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as {
          request_id?: string;
          status_url?: string;
          response_url?: string;
        };
        return Response.json({
          status: "processing",
          operationId: data.request_id,
          pollUrl: data.status_url || data.response_url,
        });
      }

      // 5. CUSTOM ENDPOINT
      if (body.provider === "custom") {
        if (!body.customBaseUrl?.trim()) {
          return Response.json({ error: "Custom Base URL missing." }, { status: 400 });
        }
        const cleanBase = body.customBaseUrl.trim().replace(/\/+$/, "");
        const url = cleanBase.endsWith("/videos") ? cleanBase : `${cleanBase}/videos`;
        assertSafeExternalUrl(url);
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: body.customModel?.trim() || body.model,
            prompt: body.prompt.trim(),
            aspect_ratio: body.aspectRatio || "16:9",
            duration: body.durationSec || 5,
          }),
          signal: AbortSignal.timeout(45_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as {
          id?: string;
          url?: string;
          video_url?: string;
          poll_url?: string;
        };
        if (data.url || data.video_url) {
          const media = await fetchRemoteMediaAsDataUrl(
            (data.url || data.video_url)!,
            undefined,
            "video/mp4"
          );
          return Response.json({
            status: "completed",
            ...media,
          });
        }
        return Response.json({
          status: "processing",
          operationId: data.id,
          pollUrl: data.poll_url || `${url}/${data.id}`,
        });
      }

      return Response.json(
        { error: `Provider ${body.provider} does not support video generation.` },
        { status: 400 }
      );
    }

    // ================= POLL VIDEO JOB =================
    if (body.action === "poll") {
      if (!body.pollUrl) {
        return Response.json({ error: "Missing pollUrl." }, { status: 400 });
      }
      assertSafeExternalUrl(body.pollUrl);

      if (body.provider === "gemini") {
        const res = await fetch(body.pollUrl, {
          headers: { "x-goog-api-key": apiKey },
          signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as {
          done?: boolean;
          status?: string;
          error?: { message?: string };
          output_video?: { data?: string; mime_type?: string; uri?: string };
          outputs?: Array<{ type?: string; data?: string; mime_type?: string; uri?: string }>;
          response?: {
            generateVideoResponse?: {
              generatedSamples?: Array<{ video?: { uri?: string } }>;
            };
          };
        };

        // Handle Interactions API poll response (Gemini Omni)
        if (body.pollUrl.includes("/interactions/")) {
          if (data.status === "failed" || data.error) {
            return Response.json({
              status: "failed",
              error: data.error?.message || "Gemini Omni video failed",
            });
          }
          const vidOut =
            data.output_video ||
            data.outputs?.find((o) => o.type === "video" || o.mime_type?.startsWith("video/"));
          if (vidOut?.data) {
            const mimeType = vidOut.mime_type || "video/mp4";
            return Response.json({
              status: "completed",
              dataUrl: `data:${mimeType};base64,${vidOut.data}`,
              mimeType,
              sizeBytes: Math.round((vidOut.data.length * 3) / 4),
            });
          }
          if (vidOut?.uri) {
            const media = await fetchRemoteMediaAsDataUrl(
              vidOut.uri,
              { "x-goog-api-key": apiKey },
              "video/mp4"
            );
            return Response.json({ status: "completed", ...media });
          }
          return Response.json({ status: "processing" });
        }

        // Handle Veo predictLongRunning poll response
        if (!data.done) return Response.json({ status: "processing" });
        if (data.error) return Response.json({ status: "failed", error: data.error.message });
        const videoUri =
          data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (!videoUri) {
          return Response.json({ status: "failed", error: "Veo returned no video URI" });
        }
        const media = await fetchRemoteMediaAsDataUrl(
          videoUri,
          { "x-goog-api-key": apiKey },
          "video/mp4"
        );
        return Response.json({ status: "completed", ...media });
      }

      if (body.provider === "openai") {
        const res = await fetch(body.pollUrl, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as {
          status?: string;
          progress?: number;
          error?: { message?: string };
        };
        if (data.status === "failed") {
          return Response.json({ status: "failed", error: data.error?.message || "Sora failed" });
        }
        if (data.status !== "completed") {
          return Response.json({ status: "processing", progress: data.progress });
        }
        const contentUrl = `${body.pollUrl}/content`;
        const media = await fetchRemoteMediaAsDataUrl(
          contentUrl,
          { Authorization: `Bearer ${apiKey}` },
          "video/mp4"
        );
        return Response.json({ status: "completed", ...media });
      }

      if (body.provider === "xai") {
        const res = await fetch(body.pollUrl, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as {
          status?: string;
          video?: { url?: string };
          url?: string;
        };
        const videoUrl = data.video?.url || data.url;
        if (videoUrl) {
          const media = await fetchRemoteMediaAsDataUrl(videoUrl, undefined, "video/mp4");
          return Response.json({ status: "completed", ...media });
        }
        if (data.status === "failed" || data.status === "expired") {
          return Response.json({ status: "failed", error: `xAI video status: ${data.status}` });
        }
        return Response.json({ status: "processing" });
      }

      if (body.provider === "fal") {
        const res = await fetch(body.pollUrl, {
          headers: { Authorization: `Key ${apiKey}` },
          signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
        const data = (await res.json()) as {
          status?: string;
          response_url?: string;
          video?: { url?: string };
        };
        if (data.video?.url) {
          const media = await fetchRemoteMediaAsDataUrl(data.video.url, undefined, "video/mp4");
          return Response.json({ status: "completed", ...media });
        }
        if (data.status === "COMPLETED" && data.response_url) {
          assertSafeExternalUrl(data.response_url);
          const finalRes = await fetch(data.response_url, {
            headers: { Authorization: `Key ${apiKey}` },
            signal: AbortSignal.timeout(20_000),
          });
          if (!finalRes.ok) {
            return Response.json({ error: await parseErr(finalRes) }, { status: finalRes.status });
          }
          const finalData = (await finalRes.json()) as { video?: { url?: string } };
          if (!finalData.video?.url) {
            return Response.json({ status: "failed", error: "Fal returned no video URL" });
          }
          const media = await fetchRemoteMediaAsDataUrl(
            finalData.video.url,
            undefined,
            "video/mp4"
          );
          return Response.json({ status: "completed", ...media });
        }
        if (data.status === "FAILED") {
          return Response.json({ status: "failed", error: "Fal video job failed" });
        }
        return Response.json({ status: "processing" });
      }

      // Custom poll
      const res = await fetch(body.pollUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) return Response.json({ error: await parseErr(res) }, { status: res.status });
      const data = (await res.json()) as { status?: string; url?: string; video_url?: string };
      if (data.url || data.video_url) {
        const media = await fetchRemoteMediaAsDataUrl(
          (data.url || data.video_url)!,
          undefined,
          "video/mp4"
        );
        return Response.json({ status: "completed", ...media });
      }
      return Response.json({ status: data.status === "failed" ? "failed" : "processing" });
    }

    return Response.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Video request error" },
      { status: 500 }
    );
  }
}
