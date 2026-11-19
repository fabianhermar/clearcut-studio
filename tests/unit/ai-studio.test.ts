import { describe, it, expect } from "vitest";
import {
  AI_MODELS,
  PROVIDERS,
  countConfiguredKeys,
  createEmptyVault,
  getDimensionsForRatio,
  getEditCapableModels,
  getModelsByKind,
  groupModelsByFamily,
  hasProviderKey,
} from "@/lib/ai-studio/providers";
import { assertSafeExternalUrl } from "@/lib/ai-studio/server-providers";
import {
  buildCssFilterFromAdjustments,
  DEFAULT_IMAGE_ADJUSTMENTS,
  getExtensionForMime,
  sanitizeFilename,
} from "@/lib/ai-studio/export-utils";
import {
  decryptVaultPayload,
  encryptVaultPayload,
  evaluatePasswordStrength,
  maskApiKeyForDisplay,
} from "@/lib/ai-studio/vault-crypto";

describe("ai-studio providers & models", () => {
  it("registers all expected BYOK providers (Gemini, OpenAI, Grok, Flux, Fal, Stability, ElevenLabs, Custom)", () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(ids).toContain("gemini");
    expect(ids).toContain("openai");
    expect(ids).toContain("xai");
    expect(ids).toContain("bfl");
    expect(ids).toContain("fal");
    expect(ids).toContain("stability");
    expect(ids).toContain("elevenlabs");
    expect(ids).toContain("custom");
  });

  it("provides models across image, video, audio, and AI editing workflows", () => {
    expect(getModelsByKind("image").length).toBeGreaterThanOrEqual(8);
    expect(getModelsByKind("video").length).toBeGreaterThanOrEqual(4);
    expect(getModelsByKind("audio").length).toBeGreaterThanOrEqual(4);
    expect(getEditCapableModels().length).toBeGreaterThanOrEqual(4);

    const uniqueIds = new Set(AI_MODELS.map((m) => m.id));
    expect(uniqueIds.size).toBe(AI_MODELS.length);

    // Verify models are cleanly grouped by provider/family sections
    const imgFamilies = groupModelsByFamily(getModelsByKind("image")).map((g) => g.family);
    expect(imgFamilies).toContain("Google · Nano Banana");
    expect(imgFamilies).toContain("OpenAI · GPT Image");
    expect(imgFamilies).toContain("xAI · Grok");
    expect(imgFamilies).toContain("Black Forest Labs · FLUX");
    expect(imgFamilies).toContain("ByteDance · Seedream");
    expect(imgFamilies).toContain("Midjourney · Custom API");

    const vidFamilies = groupModelsByFamily(getModelsByKind("video")).map((g) => g.family);
    expect(vidFamilies).toContain("Google · Gemini Omni & Veo");
    expect(vidFamilies).toContain("ByteDance · Seedance");
    expect(vidFamilies).toContain("Kling · Motion Pro");

    const audFamilies = groupModelsByFamily(getModelsByKind("audio")).map((g) => g.family);
    expect(audFamilies).toContain("Google · Gemini Audio (Voz)");
    expect(audFamilies).toContain("Google · Lyria (Música)");
    expect(audFamilies).toContain("ElevenLabs · Voz & SFX");
    expect(audFamilies).toContain("Suno · Música & Custom Audio");
  });

  it("tracks BYOK vault configuration accurately including custom baseUrl requirement", () => {
    const vault = createEmptyVault();
    expect(countConfiguredKeys(vault)).toBe(0);
    expect(hasProviderKey(vault, "gemini")).toBe(false);

    vault.gemini.apiKey = "AIzaSyExampleKey";
    vault.custom.apiKey = "sk-custom-key";
    expect(countConfiguredKeys(vault)).toBe(2);
    expect(hasProviderKey(vault, "gemini")).toBe(true);
    expect(hasProviderKey(vault, "custom")).toBe(false);

    vault.custom.baseUrl = "https://api.together.xyz/v1";
    expect(hasProviderKey(vault, "custom")).toBe(true);
  });

  it("computes scaled pixel dimensions cleanly for aspect ratios and resolutions", () => {
    const sq1k = getDimensionsForRatio("1:1", "1K");
    const sq4k = getDimensionsForRatio("1:1", "4K");
    const wide = getDimensionsForRatio("16:9", "1K");
    expect(sq1k).toEqual({ width: 1024, height: 1024 });
    expect(sq4k).toEqual({ width: 2048, height: 2048 });
    expect(wide.width).toBeGreaterThan(wide.height);
  });
});

describe("ai-studio SSRF defense & export helpers", () => {
  it("allows valid HTTPS external API endpoints and blocks private/internal SSRF targets", () => {
    expect(assertSafeExternalUrl("https://api.openai.com/v1/images/generations").hostname).toBe(
      "api.openai.com"
    );
    expect(() => assertSafeExternalUrl("http://api.openai.com/v1")).toThrow();
    expect(() => assertSafeExternalUrl("https://localhost:3000/secret")).toThrow();
    expect(() => assertSafeExternalUrl("https://127.0.0.1/admin")).toThrow();
    expect(() => assertSafeExternalUrl("https://169.254.169.254/latest/meta-data")).toThrow();
    expect(() => assertSafeExternalUrl("https://192.168.1.10/api")).toThrow();
    expect(() => assertSafeExternalUrl("https://10.0.0.5/api")).toThrow();
  });

  it("formats filenames, extensions, and optical CSS filters cleanly", () => {
    expect(getExtensionForMime("image/webp")).toBe("webp");
    expect(getExtensionForMime("video/mp4")).toBe("mp4");
    expect(getExtensionForMime("audio/mpeg")).toBe("mp3");
    expect(sanitizeFilename("Mi Foto IA #01 (Final)!.png")).toBe("mi-foto-ia-01-final-.png");
    expect(buildCssFilterFromAdjustments(DEFAULT_IMAGE_ADJUSTMENTS)).toBe(
      "brightness(100%) contrast(100%) saturate(100%)"
    );
  });
});

describe("ai-studio AES-256-GCM encrypted vault crypto", () => {
  it("enforces strong master password rules (10+ chars, upper, lower, number, symbol)", () => {
    expect(evaluatePasswordStrength("short1!A").isValid).toBe(false);
    expect(evaluatePasswordStrength("alllowercase123!").isValid).toBe(false);
    expect(evaluatePasswordStrength("NoNumbersHere!!").isValid).toBe(false);
    expect(evaluatePasswordStrength("NoSymbolsHere123").isValid).toBe(false);
    expect(evaluatePasswordStrength("ClearCut#Vault2026").isValid).toBe(true);
  });

  it("encrypts and decrypts API keys with AES-256-GCM + PBKDF2 without leaking plaintext", async () => {
    const secretKey = "AIzaSy-SUPER-SECRET-DEMO-KEY-987654";
    const vault = createEmptyVault();
    vault.gemini.apiKey = secretKey;

    const envelope = await encryptVaultPayload(vault, "ClearCut#Vault2026");
    expect(envelope.cipher).toBe("AES-GCM-256");
    expect(envelope.kdf).toBe("PBKDF2-SHA256");
    expect(envelope.iterations).toBeGreaterThanOrEqual(310_000);
    expect(envelope.configuredCount).toBe(1);
    expect(JSON.stringify(envelope)).not.toContain(secretKey);

    const decrypted = await decryptVaultPayload(envelope, "ClearCut#Vault2026");
    expect(decrypted.gemini.apiKey).toBe(secretKey);

    await expect(decryptVaultPayload(envelope, "Wrong#Password999")).rejects.toThrow(
      "INVALID_PASSWORD"
    );

    // Tampering with ciphertext must fail GCM integrity check
    const tampered = {
      ...envelope,
      ciphertext: envelope.ciphertext.slice(0, -4) + "AAAA",
    };
    await expect(decryptVaultPayload(tampered, "ClearCut#Vault2026")).rejects.toThrow(
      "INVALID_PASSWORD"
    );

    expect(maskApiKeyForDisplay(secretKey)).toBe("••••••••••••••••7654");
  });
});
