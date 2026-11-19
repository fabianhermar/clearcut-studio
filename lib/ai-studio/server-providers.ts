import type { AiProviderId, AspectRatioPreset, ResolutionTier } from "./types";
import { ASPECT_RATIO_OPTIONS, getDimensionsForRatio } from "./providers";

/**
 * Validates that an external URL is safe HTTPS and does not target internal/private networks (SSRF defense).
 */
export function assertSafeExternalUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are permitted");
  }

  const host = parsed.hostname.toLowerCase();
  const blockedHosts = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "[::1]",
    "metadata.google.internal",
    "169.254.169.254",
  ]);
  if (blockedHosts.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Blocked internal hostname");
  }

  // Block RFC1918 & link-local IPv4 ranges
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      throw new Error("Blocked private IP range");
    }
  }

  return parsed;
}

export async function fetchRemoteMediaAsDataUrl(
  remoteUrl: string,
  extraHeaders?: Record<string, string>,
  fallbackMime: string = "image/png"
): Promise<{ dataUrl: string; mimeType: string; sizeBytes: number }> {
  const safe = assertSafeExternalUrl(remoteUrl);
  const res = await fetch(safe.toString(), {
    headers: extraHeaders,
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    throw new Error(`Media download failed (${res.status})`);
  }
  const mimeType =
    (res.headers.get("content-type") || fallbackMime).split(";")[0].trim() || fallbackMime;
  const arrayBuf = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const base64 = buffer.toString("base64");
  return {
    dataUrl: `data:${mimeType};base64,${base64}`,
    mimeType,
    sizeBytes: buffer.byteLength,
  };
}

export function stripDataUrlPrefix(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }
  return { mimeType: "image/png", base64: dataUrl };
}

export function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const { mimeType, base64 } = stripDataUrlPrefix(dataUrl);
  return { buffer: Buffer.from(base64, "base64"), mimeType };
}

export interface SingleImageGenerationInput {
  provider: AiProviderId;
  apiKey: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatioPreset;
  resolution: ResolutionTier;
  seed?: number;
  referenceImages?: string[]; // base64 data URLs
  maskImage?: string; // base64 data URL for inpainting/editing
  customBaseUrl?: string;
  customModel?: string;
  slotIndex: number;
}

export interface SingleImageGenerationResult {
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
}

async function parseErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    const msg =
      json?.error?.message ||
      json?.message ||
      json?.detail ||
      (Array.isArray(json?.errors) ? json.errors.join(", ") : "");
    if (msg) return `${res.status}: ${msg}`;
  } catch {
    // Plain text
  }
  return `${res.status}: ${text.slice(0, 260) || res.statusText || "Upstream provider error"}`;
}

function getOpenAiSize(aspectRatio: AspectRatioPreset): "1024x1024" | "1536x1024" | "1024x1536" {
  const opt = ASPECT_RATIO_OPTIONS.find((r) => r.id === aspectRatio);
  return opt?.openAiSize || "1024x1024";
}

function getFalImageSize(aspectRatio: AspectRatioPreset): string {
  switch (aspectRatio) {
    case "1:1":
      return "square_hd";
    case "16:9":
    case "21:9":
      return "landscape_16_9";
    case "9:16":
      return "portrait_16_9";
    case "4:3":
    case "3:2":
      return "landscape_4_3";
    case "3:4":
    case "4:5":
    case "2:3":
      return "portrait_4_3";
    default:
      return "square_hd";
  }
}

export async function generateSingleImage(
  input: SingleImageGenerationInput
): Promise<SingleImageGenerationResult> {
  const { width, height } = getDimensionsForRatio(input.aspectRatio, input.resolution);
  const fullPrompt = input.negativePrompt?.trim()
    ? `${input.prompt.trim()}\nAvoid: ${input.negativePrompt.trim()}`
    : input.prompt.trim();

  // --- 1. GOOGLE GEMINI ---
  if (input.provider === "gemini") {
    const isImagen = input.model.startsWith("imagen-");
    if (isImagen) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        input.model
      )}:predict`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": input.apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt: fullPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: input.aspectRatio === "21:9" ? "16:9" : input.aspectRatio,
            personGeneration: "allow_adult",
          },
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const data = (await res.json()) as {
        predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
      };
      const pred = data.predictions?.[0];
      if (!pred?.bytesBase64Encoded) {
        throw new Error("Gemini Imagen did not return image bytes");
      }
      const mimeType = pred.mimeType || "image/png";
      const sizeBytes = Math.round((pred.bytesBase64Encoded.length * 3) / 4);
      return {
        dataUrl: `data:${mimeType};base64,${pred.bytesBase64Encoded}`,
        mimeType,
        width,
        height,
        sizeBytes,
      };
    }

    // Gemini native multimodal generateContent (Nano Banana / Flash Image / Pro Image)
    const parts: Array<Record<string, unknown>> = [];
    if (input.referenceImages?.length) {
      for (const ref of input.referenceImages.slice(0, 4)) {
        const { mimeType, base64 } = stripDataUrlPrefix(ref);
        parts.push({
          inlineData: {
            mimeType,
            data: base64,
          },
        });
      }
    }
    if (input.maskImage) {
      const { mimeType, base64 } = stripDataUrlPrefix(input.maskImage);
      parts.push({
        inlineData: {
          mimeType,
          data: base64,
        },
      });
      parts.push({
        text: `Use the highlighted mask area to apply the following edit to the reference image: ${fullPrompt}`,
      });
    } else {
      parts.push({
        text:
          input.referenceImages && input.referenceImages.length > 0
            ? fullPrompt
            : `${fullPrompt} (aspect ratio ${input.aspectRatio})`,
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      input.model
    )}:generateContent`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": input.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: input.aspectRatio,
          },
        },
      }),
      signal: AbortSignal.timeout(70_000),
    });

    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { mimeType?: string; data?: string };
            text?: string;
          }>;
        };
      }>;
    };

    const candidateParts = data.candidates?.[0]?.content?.parts || [];
    const imgPart = candidateParts.find((p) => p.inlineData?.data);
    if (!imgPart?.inlineData?.data) {
      const textHint = candidateParts.find((p) => p.text)?.text;
      throw new Error(textHint || "Gemini returned no image in response");
    }
    const mimeType = imgPart.inlineData.mimeType || "image/png";
    const base64 = imgPart.inlineData.data;
    return {
      dataUrl: `data:${mimeType};base64,${base64}`,
      mimeType,
      width,
      height,
      sizeBytes: Math.round((base64.length * 3) / 4),
    };
  }

  // --- 2. OPENAI (CHATGPT) ---
  if (input.provider === "openai") {
    const size = getOpenAiSize(input.aspectRatio);
    const hasEditRef = Boolean(input.referenceImages && input.referenceImages.length > 0);

    if (hasEditRef && input.model !== "dall-e-3") {
      const form = new FormData();
      form.append("model", input.model);
      form.append("prompt", fullPrompt);
      form.append("size", size);
      const firstRef = dataUrlToBuffer(input.referenceImages![0]);
      form.append(
        "image",
        new Blob([new Uint8Array(firstRef.buffer)], { type: firstRef.mimeType }),
        "reference.png"
      );
      if (input.maskImage) {
        const maskBuf = dataUrlToBuffer(input.maskImage);
        form.append(
          "mask",
          new Blob([new Uint8Array(maskBuf.buffer)], { type: "image/png" }),
          "mask.png"
        );
      }

      const res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
        },
        body: form,
        signal: AbortSignal.timeout(75_000),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
      const first = data.data?.[0];
      if (first?.b64_json) {
        return {
          dataUrl: `data:image/png;base64,${first.b64_json}`,
          mimeType: "image/png",
          width,
          height,
          sizeBytes: Math.round((first.b64_json.length * 3) / 4),
        };
      }
      if (first?.url) {
        const fetched = await fetchRemoteMediaAsDataUrl(first.url);
        return { ...fetched, width, height };
      }
      throw new Error("OpenAI edit returned empty image payload");
    }

    const bodyPayload: Record<string, unknown> = {
      model: input.model,
      prompt: fullPrompt,
      n: 1,
      size:
        input.model === "dall-e-3"
          ? size === "1536x1024"
            ? "1792x1024"
            : size === "1024x1536"
            ? "1024x1792"
            : "1024x1024"
          : size,
    };

    if (input.model === "dall-e-3") {
      bodyPayload.response_format = "b64_json";
      bodyPayload.quality = input.resolution === "2K" || input.resolution === "4K" ? "hd" : "standard";
    } else {
      bodyPayload.quality =
        input.resolution === "0.5K"
          ? "low"
          : input.resolution === "2K" || input.resolution === "4K"
          ? "high"
          : "medium";
    }

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(75_000),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const first = data.data?.[0];
    if (first?.b64_json) {
      return {
        dataUrl: `data:image/png;base64,${first.b64_json}`,
        mimeType: "image/png",
        width,
        height,
        sizeBytes: Math.round((first.b64_json.length * 3) / 4),
      };
    }
    if (first?.url) {
      const fetched = await fetchRemoteMediaAsDataUrl(first.url);
      return { ...fetched, width, height };
    }
    throw new Error("OpenAI returned no image data");
  }

  // --- 3. xAI GROK ---
  if (input.provider === "xai") {
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        prompt: fullPrompt,
        n: 1,
        response_format: "b64_json",
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const first = data.data?.[0];
    if (first?.b64_json) {
      return {
        dataUrl: `data:image/jpeg;base64,${first.b64_json}`,
        mimeType: "image/jpeg",
        width,
        height,
        sizeBytes: Math.round((first.b64_json.length * 3) / 4),
      };
    }
    if (first?.url) {
      const fetched = await fetchRemoteMediaAsDataUrl(first.url, undefined, "image/jpeg");
      return { ...fetched, width, height };
    }
    throw new Error("xAI Grok returned no image");
  }

  // --- 4. BLACK FOREST LABS (FLUX) ---
  if (input.provider === "bfl") {
    const payload: Record<string, unknown> = {
      prompt: fullPrompt,
      aspect_ratio: input.aspectRatio,
      output_format: "png",
    };
    if (input.seed !== undefined) payload.seed = input.seed + input.slotIndex;
    if (input.model.includes("kontext") && input.referenceImages?.[0]) {
      payload.input_image = stripDataUrlPrefix(input.referenceImages[0]).base64;
    }

    const initRes = await fetch(`https://api.bfl.ai/v1/${encodeURIComponent(input.model)}`, {
      method: "POST",
      headers: {
        "x-key": input.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
    if (!initRes.ok) throw new Error(await parseErrorMessage(initRes));
    const initData = (await initRes.json()) as { id?: string; polling_url?: string };
    const pollUrl =
      initData.polling_url ||
      (initData.id ? `https://api.bfl.ai/v1/get_result?id=${encodeURIComponent(initData.id)}` : "");
    if (!pollUrl) throw new Error("BFL did not return a polling URL");

    assertSafeExternalUrl(pollUrl);

    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise((r) => setTimeout(r, 1200));
      const pollRes = await fetch(pollUrl, {
        headers: { "x-key": input.apiKey },
        signal: AbortSignal.timeout(15_000),
      });
      if (!pollRes.ok) throw new Error(await parseErrorMessage(pollRes));
      const pollData = (await pollRes.json()) as {
        status?: string;
        result?: { sample?: string };
      };
      if (pollData.status === "Ready" && pollData.result?.sample) {
        const fetched = await fetchRemoteMediaAsDataUrl(pollData.result.sample);
        return { ...fetched, width, height };
      }
      if (pollData.status === "Error" || pollData.status === "Request Moderated") {
        throw new Error(`Flux generation status: ${pollData.status}`);
      }
    }
    throw new Error("Flux generation timed out");
  }

  // --- 5. FAL.AI GATEWAY ---
  if (input.provider === "fal") {
    const payload: Record<string, unknown> = {
      prompt: fullPrompt,
      image_size: getFalImageSize(input.aspectRatio),
      num_images: 1,
      output_format: "png",
    };
    if (input.seed !== undefined) payload.seed = input.seed + input.slotIndex;
    if (input.referenceImages?.[0]) {
      payload.image_url = input.referenceImages[0];
    }

    const res = await fetch(`https://fal.run/${input.model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(75_000),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as {
      images?: Array<{ url?: string; width?: number; height?: number }>;
      image?: { url?: string };
    };
    const imgUrl = data.images?.[0]?.url || data.image?.url;
    if (!imgUrl) throw new Error("Fal.ai returned no image URL");
    const fetched = await fetchRemoteMediaAsDataUrl(imgUrl);
    return {
      ...fetched,
      width: data.images?.[0]?.width || width,
      height: data.images?.[0]?.height || height,
    };
  }

  // --- 6. STABILITY AI ---
  if (input.provider === "stability") {
    const endpoint =
      input.model === "ultra"
        ? "https://api.stability.ai/v2beta/stable-image/generate/ultra"
        : "https://api.stability.ai/v2beta/stable-image/generate/sd3";
    const form = new FormData();
    form.append("prompt", input.prompt.trim());
    if (input.negativePrompt?.trim()) form.append("negative_prompt", input.negativePrompt.trim());
    form.append("aspect_ratio", input.aspectRatio);
    form.append("output_format", "png");
    if (input.model !== "ultra") form.append("model", input.model);
    if (input.seed !== undefined) form.append("seed", String(input.seed + input.slotIndex));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        Accept: "image/*",
      },
      body: form,
      signal: AbortSignal.timeout(65_000),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      dataUrl: `data:image/png;base64,${buf.toString("base64")}`,
      mimeType: "image/png",
      width,
      height,
      sizeBytes: buf.byteLength,
    };
  }

  // --- 7. CUSTOM OPENAI-COMPATIBLE ---
  if (input.provider === "custom") {
    if (!input.customBaseUrl?.trim()) {
      throw new Error("Custom Base URL is required in API Keys Vault");
    }
    const cleanBase = input.customBaseUrl.trim().replace(/\/+$/, "");
    const targetUrl = cleanBase.endsWith("/images/generations")
      ? cleanBase
      : `${cleanBase}/images/generations`;
    assertSafeExternalUrl(targetUrl);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.customModel?.trim() || input.model,
        prompt: fullPrompt,
        n: 1,
        size: getOpenAiSize(input.aspectRatio),
        response_format: "b64_json",
      }),
      signal: AbortSignal.timeout(70_000),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const first = data.data?.[0];
    if (first?.b64_json) {
      return {
        dataUrl: `data:image/png;base64,${first.b64_json}`,
        mimeType: "image/png",
        width,
        height,
        sizeBytes: Math.round((first.b64_json.length * 3) / 4),
      };
    }
    if (first?.url) {
      const fetched = await fetchRemoteMediaAsDataUrl(first.url);
      return { ...fetched, width, height };
    }
    throw new Error("Custom endpoint returned no image");
  }

  throw new Error(`Unsupported image provider: ${input.provider}`);
}
