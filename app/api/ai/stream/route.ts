import { NextRequest } from "next/server";
import { generateSingleImage } from "@/lib/ai-studio/server-providers";
import type { AiProviderId, AspectRatioPreset, ResolutionTier } from "@/lib/ai-studio/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface StreamRequestBody {
  provider: AiProviderId;
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: AspectRatioPreset;
  resolution?: ResolutionTier;
  count?: number;
  seed?: number;
  referenceImages?: string[];
  maskImage?: string;
  customBaseUrl?: string;
  customModel?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = (req.headers.get("x-api-key") || "").trim();
  if (!apiKey) {
    return Response.json(
      { error: "Missing API key header (x-api-key)." },
      { status: 401 }
    );
  }

  let body: StreamRequestBody;
  try {
    body = (await req.json()) as StreamRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return Response.json({ error: "Prompt is required." }, { status: 400 });
  }

  const count = Math.max(1, Math.min(8, Number(body.count || 1)));
  const aspectRatio: AspectRatioPreset = body.aspectRatio || "1:1";
  const resolution: ResolutionTier = body.resolution || "1K";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, payload: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // Stream closed by client
        }
      };

      sendEvent("batch_start", {
        count,
        provider: body.provider,
        model: body.model,
        startedAt: Date.now(),
      });

      // Concurrency cap of 4 so batches of 6 or 8 stream rapidly without hitting instant burst rate limits
      const concurrency = Math.min(4, count);
      let nextSlot = 0;

      const runWorker = async () => {
        while (nextSlot < count) {
          const slotIndex = nextSlot++;
          const slotStartedAt = Date.now();
          sendEvent("slot_start", { slotIndex, startedAt: slotStartedAt });

          try {
            const result = await generateSingleImage({
              provider: body.provider,
              apiKey,
              model: body.model,
              prompt: body.prompt,
              negativePrompt: body.negativePrompt,
              aspectRatio,
              resolution,
              seed: body.seed,
              referenceImages: body.referenceImages,
              maskImage: body.maskImage,
              customBaseUrl: body.customBaseUrl,
              customModel: body.customModel,
              slotIndex,
            });

            sendEvent("item", {
              slotIndex,
              dataUrl: result.dataUrl,
              mimeType: result.mimeType,
              width: result.width,
              height: result.height,
              sizeBytes: result.sizeBytes,
              latencyMs: Date.now() - slotStartedAt,
            });
          } catch (err) {
            sendEvent("slot_error", {
              slotIndex,
              error: err instanceof Error ? err.message : "Image generation failed",
              latencyMs: Date.now() - slotStartedAt,
            });
          }
        }
      };

      await Promise.all(Array.from({ length: concurrency }, () => runWorker()));
      sendEvent("done", { completedAt: Date.now() });
      try {
        controller.close();
      } catch {
        // Already closed
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
