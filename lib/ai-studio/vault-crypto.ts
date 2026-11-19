import { API_VAULT_STORAGE_KEY, createEmptyVault, PROVIDERS } from "./providers";
import type { ApiKeyVault } from "./types";

export const ENCRYPTED_VAULT_STORAGE_KEY = "clearcut_ai_vault_encrypted_v2";
export const RUNTIME_VAULT_STORAGE_KEY = "clearcut_ai_vault_runtime_v2";
const DEVICE_KEY_DB_NAME = "clearcut_ai_keystore_v1";
const DEVICE_KEY_STORE_NAME = "keys";
const DEVICE_KEY_ID = "runtime-aes-256";
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

function openKeyStoreDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DEVICE_KEY_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DEVICE_KEY_STORE_NAME)) {
        db.createObjectStore(DEVICE_KEY_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open keystore"));
  });
}

async function getOrCreateNonExtractableDeviceKey(): Promise<CryptoKey | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openKeyStoreDb();
    const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
      const tx = db.transaction(DEVICE_KEY_STORE_NAME, "readonly");
      const req = tx.objectStore(DEVICE_KEY_STORE_NAME).get(DEVICE_KEY_ID);
      req.onsuccess = () => resolve(req.result as CryptoKey | undefined);
      req.onerror = () => reject(req.error);
    });
    if (existing) {
      db.close();
      return existing;
    }

    const subtle = getSubtleCrypto();
    const generated = await subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false, // Non-extractable: raw key bytes can NEVER be read or exported
      ["encrypt", "decrypt"]
    );

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DEVICE_KEY_STORE_NAME, "readwrite");
      const req = tx.objectStore(DEVICE_KEY_STORE_NAME).put(generated, DEVICE_KEY_ID);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
    return generated;
  } catch {
    return null;
  }
}

async function saveRuntimeEncryptedVault(vault: ApiKeyVault): Promise<void> {
  if (typeof window === "undefined") return;
  const deviceKey = await getOrCreateNonExtractableDeviceKey();
  if (!deviceKey) return;

  const subtle = getSubtleCrypto();
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(vault));
  const cipherBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    deviceKey,
    plaintext
  );

  window.localStorage.setItem(
    RUNTIME_VAULT_STORAGE_KEY,
    JSON.stringify({
      v: 2,
      cipher: "AES-GCM-256-DEVICE",
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(cipherBuffer)),
      updatedAt: Date.now(),
    })
  );
}

/**
 * Silently decrypts the runtime AES-256-GCM envelope using the non-extractable IndexedDB device key
 * so saved API keys remain usable for AI generation even while the Vault management UI is locked.
 */
export async function loadRuntimeEncryptedVault(): Promise<ApiKeyVault | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RUNTIME_VAULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v?: number; iv?: string; ciphertext?: string };
    if (parsed?.v !== 2 || !parsed.iv || !parsed.ciphertext) return null;

    const deviceKey = await getOrCreateNonExtractableDeviceKey();
    if (!deviceKey) return null;

    const subtle = getSubtleCrypto();
    const decryptedBuffer = await subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(parsed.iv) as unknown as BufferSource },
      deviceKey,
      base64ToBytes(parsed.ciphertext) as unknown as BufferSource
    );
    const jsonStr = new TextDecoder().decode(decryptedBuffer);
    const data = JSON.parse(jsonStr) as Partial<ApiKeyVault>;
    const merged = createEmptyVault();
    for (const p of PROVIDERS) {
      if (data[p.id]) {
        merged[p.id] = { ...merged[p.id], ...data[p.id] };
      }
    }
    return merged;
  } catch {
    return null;
  }
}

export async function saveEncryptedVault(
  vault: ApiKeyVault,
  masterPassword: string
): Promise<EncryptedVaultEnvelope> {
  const envelope = await encryptVaultPayload(vault, masterPassword);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(API_VAULT_STORAGE_KEY);
    window.localStorage.setItem(ENCRYPTED_VAULT_STORAGE_KEY, JSON.stringify(envelope));
    await saveRuntimeEncryptedVault(vault);
  }
  return envelope;
}

export async function unlockEncryptedVault(masterPassword: string): Promise<ApiKeyVault> {
  const envelope = loadEncryptedVaultEnvelope();
  if (!envelope) {
    throw new Error("VAULT_NOT_FOUND");
  }
  const decrypted = await decryptVaultPayload(envelope, masterPassword);
  await saveRuntimeEncryptedVault(decrypted);
  return decrypted;
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
  window.localStorage.removeItem(RUNTIME_VAULT_STORAGE_KEY);
  if (typeof indexedDB !== "undefined") {
    try {
      indexedDB.deleteDatabase(DEVICE_KEY_DB_NAME);
    } catch {
      // Ignore cleanup error
    }
  }
}

export function maskApiKeyForDisplay(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 6) return "••••••••";
  return `••••••••••••••••${trimmed.slice(-4)}`;
}
