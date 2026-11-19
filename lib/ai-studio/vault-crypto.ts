import { API_VAULT_STORAGE_KEY, createEmptyVault, PROVIDERS } from "./providers";
import type { ApiKeyVault } from "./types";

export const ENCRYPTED_VAULT_STORAGE_KEY = "clearcut_ai_vault_encrypted_v2";
const PBKDF2_ITERATIONS = 310_000;

export interface EncryptedVaultEnvelope {
  v: 2;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  cipher: "AES-GCM-256";
  salt: string; // base64 (16 bytes)
  iv: string; // base64 (12 bytes)
  ciphertext: string; // base64
  updatedAt: number;
  configuredCount: number;
}

export interface PasswordStrengthResult {
  score: number; // 0..5
  isValid: boolean;
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 10,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return {
    score,
    isValid: score === 5,
    checks,
  };
}

function getSubtleCrypto(): SubtleCrypto {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error("Web Crypto API (SubtleCrypto) is unavailable in this environment.");
  }
  return cryptoObj.subtle;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKey(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptVaultPayload(
  vault: ApiKeyVault,
  masterPassword: string
): Promise<EncryptedVaultEnvelope> {
  const subtle = getSubtleCrypto();
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(masterPassword, salt, PBKDF2_ITERATIONS);

  const plaintext = new TextEncoder().encode(JSON.stringify(vault));
  const cipherBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    plaintext
  );

  const configuredCount = PROVIDERS.filter(
    (p) => Boolean(vault[p.id]?.apiKey?.trim())
  ).length;

  return {
    v: 2,
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    cipher: "AES-GCM-256",
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(cipherBuffer)),
    updatedAt: Date.now(),
    configuredCount,
  };
}

export async function decryptVaultPayload(
  envelope: EncryptedVaultEnvelope,
  masterPassword: string
): Promise<ApiKeyVault> {
  const subtle = getSubtleCrypto();
  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const ciphertext = base64ToBytes(envelope.ciphertext);
  const key = await deriveAesKey(
    masterPassword,
    salt,
    envelope.iterations || PBKDF2_ITERATIONS
  );

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      ciphertext as unknown as BufferSource
    );
  } catch {
    throw new Error("INVALID_PASSWORD");
  }

  const jsonStr = new TextDecoder().decode(decryptedBuffer);
  const parsed = JSON.parse(jsonStr) as Partial<ApiKeyVault>;
  const merged = createEmptyVault();
  for (const p of PROVIDERS) {
    if (parsed[p.id]) {
      merged[p.id] = { ...merged[p.id], ...parsed[p.id] };
    }
  }
  return merged;
}

export function loadEncryptedVaultEnvelope(): EncryptedVaultEnvelope | null {
  if (typeof window === "undefined") return null;
  // Purge any legacy plaintext storage key immediately
  try {
    if (window.localStorage.getItem(API_VAULT_STORAGE_KEY)) {
      window.localStorage.removeItem(API_VAULT_STORAGE_KEY);
    }
    const raw = window.localStorage.getItem(ENCRYPTED_VAULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EncryptedVaultEnvelope;
    if (parsed?.v !== 2 || !parsed.ciphertext || !parsed.salt || !parsed.iv) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function hasEncryptedVault(): boolean {
  return loadEncryptedVaultEnvelope() !== null;
}

export async function saveEncryptedVault(
  vault: ApiKeyVault,
  masterPassword: string
): Promise<EncryptedVaultEnvelope> {
  const envelope = await encryptVaultPayload(vault, masterPassword);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(API_VAULT_STORAGE_KEY);
    window.localStorage.setItem(ENCRYPTED_VAULT_STORAGE_KEY, JSON.stringify(envelope));
  }
  return envelope;
}

export async function unlockEncryptedVault(masterPassword: string): Promise<ApiKeyVault> {
  const envelope = loadEncryptedVaultEnvelope();
  if (!envelope) {
    throw new Error("VAULT_NOT_FOUND");
  }
  return decryptVaultPayload(envelope, masterPassword);
}

export async function verifyStoredMasterPassword(candidate: string): Promise<boolean> {
  const envelope = loadEncryptedVaultEnvelope();
  if (!envelope) return false;
  try {
    await decryptVaultPayload(envelope, candidate);
    return true;
  } catch {
    return false;
  }
}

export function purgeEncryptedVault(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(API_VAULT_STORAGE_KEY);
  window.localStorage.removeItem(ENCRYPTED_VAULT_STORAGE_KEY);
}

export function maskApiKeyForDisplay(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 6) return "••••••••";
  return `••••••••••••••••${trimmed.slice(-4)}`;
}
