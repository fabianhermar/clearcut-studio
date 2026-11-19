import { NextRequest } from "next/server";
import { assertSafeExternalUrl } from "@/lib/ai-studio/server-providers";
import type { AiProviderId } from "@/lib/ai-studio/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = (req.headers.get("x-api-key") || "").trim();
  if (!apiKey) {
    return Response.json({ ok: false, error: "API key is empty." }, { status: 400 });
  }

  let provider: AiProviderId = "gemini";
  let customBaseUrl = "";
  try {
    const body = (await req.json()) as { provider: AiProviderId; customBaseUrl?: string };
    provider = body.provider;
    customBaseUrl = (body.customBaseUrl || "").trim();
  } catch {
    return Response.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
  }

  try {
    let res: Response;

    switch (provider) {
      case "gemini":
        res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {
          headers: { "x-goog-api-key": apiKey },
          signal: AbortSignal.timeout(10_000),
        });
        break;
      case "openai":
        res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10_000),
        });
        break;
      case "xai":
        res = await fetch("https://api.x.ai/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10_000),
        });
        break;
      case "stability":
        res = await fetch("https://api.stability.ai/v1/user/account", {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10_000),
        });
        break;
      case "elevenlabs":
        res = await fetch("https://api.elevenlabs.io/v1/user", {
          headers: { "xi-api-key": apiKey },
          signal: AbortSignal.timeout(10_000),
        });
        break;
      case "bfl":
        // BFL has no free list endpoint; check key format & auth response
        if (apiKey.length < 12) {
          return Response.json({ ok: false, error: "Key looks too short for BFL." }, { status: 400 });
        }
        return Response.json({ ok: true, note: "Key format valid (verified on first render)." });
      case "fal":
        if (apiKey.length < 10) {
          return Response.json({ ok: false, error: "Key looks too short for Fal.ai." }, { status: 400 });
        }
        return Response.json({ ok: true, note: "Key format valid (verified on first render)." });
      case "custom": {
        if (!customBaseUrl) {
          return Response.json({ ok: false, error: "Custom Base URL is required." }, { status: 400 });
        }
        const clean = customBaseUrl.replace(/\/+$/, "");
        const checkUrl = clean.endsWith("/models") ? clean : `${clean}/models`;
        assertSafeExternalUrl(checkUrl);
        res = await fetch(checkUrl, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10_000),
        });
        break;
      }
      default:
        return Response.json({ ok: false, error: "Unknown provider." }, { status: 400 });
    }

    if (res.ok) {
      return Response.json({ ok: true });
    }
    return Response.json(
      { ok: false, error: `HTTP ${res.status} (${res.statusText})` },
      { status: 200 }
    );
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Network error" },
      { status: 200 }
    );
  }
}
