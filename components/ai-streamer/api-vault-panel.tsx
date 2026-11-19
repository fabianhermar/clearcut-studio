"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Trash2,
  Lock,
  Unlock,
  Pencil,
  ShieldAlert,
  X,
  Save,
} from "lucide-react";
import { PROVIDERS, countConfiguredKeys } from "@/lib/ai-studio/providers";
import {
  evaluatePasswordStrength,
  maskApiKeyForDisplay,
} from "@/lib/ai-studio/vault-crypto";
import type { AiProviderId, ApiKeyVault } from "@/lib/ai-studio/types";

export type VaultStatus = "uninitialized" | "locked" | "unlocked";

interface PendingSensitiveAction {
  type: "reveal" | "replace" | "delete";
  providerId: AiProviderId;
  providerName: string;
}

interface ApiVaultPanelProps {
  vault: ApiKeyVault;
  vaultStatus: VaultStatus;
  encryptedKeyCount: number;
  onInitializeVault: (masterPassword: string) => Promise<void>;
  onUnlockVault: (masterPassword: string) => Promise<void>;
  onLockVault: () => void;
  onPurgeVault: () => void;
  onVerifyPassword: (candidate: string) => Promise<boolean>;
  onSaveProviderEntry: (
    providerId: AiProviderId,
    entry: ApiKeyVault[AiProviderId]
  ) => Promise<void>;
  onDeleteProviderEntry: (providerId: AiProviderId) => Promise<void>;
  lang?: string;
}

export function ApiVaultPanel({
  vault,
  vaultStatus,
  encryptedKeyCount,
  onInitializeVault,
  onUnlockVault,
  onLockVault,
  onPurgeVault,
  onVerifyPassword,
  onSaveProviderEntry,
  onDeleteProviderEntry,
  lang = "es",
}: ApiVaultPanelProps) {
  const isEn = lang === "en";

  // Setup state (uninitialized)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSetupPass, setShowSetupPass] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Unlock state (locked)
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  // Unlocked per-provider drafts & states
  const [drafts, setDrafts] = useState<
    Partial<Record<AiProviderId, { apiKey: string; baseUrl?: string; customModel?: string }>>
  >({});
  const [editingProviders, setEditingProviders] = useState<Partial<Record<AiProviderId, boolean>>>({});
  const [revealedProviders, setRevealedProviders] = useState<Partial<Record<AiProviderId, boolean>>>({});
  const [savingProvider, setSavingProvider] = useState<Partial<Record<AiProviderId, boolean>>>({});
  const [testing, setTesting] = useState<Partial<Record<AiProviderId, boolean>>>({});
  const [testMessages, setTestMessages] = useState<
    Partial<Record<AiProviderId, { ok: boolean; text: string }>>
  >({});

  // Re-authentication modal for view / replace / delete
  const [pendingAction, setPendingAction] = useState<PendingSensitiveAction | null>(null);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);

  const revealTimersRef = useRef<Partial<Record<AiProviderId, number>>>({});

  useEffect(() => {
    return () => {
      for (const timer of Object.values(revealTimersRef.current)) {
        if (timer) window.clearTimeout(timer);
      }
    };
  }, []);

  // Reset transient reveal/edit states whenever vault locks
  useEffect(() => {
    if (vaultStatus !== "unlocked") {
      setRevealedProviders({});
      setEditingProviders({});
      setDrafts({});
      setPendingAction(null);
    }
  }, [vaultStatus]);

  const strength = evaluatePasswordStrength(newPassword);
  const configuredCount = countConfiguredKeys(vault);

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    if (!strength.isValid) {
      setSetupError(
        isEn
          ? "Your master password must meet all 5 security requirements."
          : "Tu contraseña maestra debe cumplir los 5 requisitos de seguridad."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setSetupError(
        isEn ? "Passwords do not match." : "Las contraseñas no coinciden."
      );
      return;
    }
    setIsInitializing(true);
    try {
      await onInitializeVault(newPassword);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Encryption failed");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword) return;
    setUnlockError(null);
    setIsUnlocking(true);
    try {
      await onUnlockVault(unlockPassword);
      setUnlockPassword("");
    } catch {
      setUnlockError(
        isEn
          ? "Incorrect master password. Unable to decrypt vault."
          : "Contraseña maestra incorrecta. No se pudo descifrar la bóveda."
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const requestSensitiveAction = (
    type: PendingSensitiveAction["type"],
    providerId: AiProviderId,
    providerName: string
  ) => {
    if (type === "reveal" && revealedProviders[providerId]) {
      setRevealedProviders((prev) => ({ ...prev, [providerId]: false }));
      return;
    }
    setAuthPassword("");
    setAuthError(null);
    setPendingAction({ type, providerId, providerName });
  };

  const handleConfirmSensitiveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAction || !authPassword) return;
    setAuthError(null);
    setIsVerifyingAuth(true);

    try {
      const ok = await onVerifyPassword(authPassword);
      if (!ok) {
        setAuthError(
          isEn
            ? "Invalid master password. Permission denied."
            : "Contraseña maestra incorrecta. Permiso denegado."
        );
        return;
      }

      const { type, providerId } = pendingAction;
      if (type === "reveal") {
        setRevealedProviders((prev) => ({ ...prev, [providerId]: true }));
        if (revealTimersRef.current[providerId]) {
          window.clearTimeout(revealTimersRef.current[providerId]);
        }
        revealTimersRef.current[providerId] = window.setTimeout(() => {
          setRevealedProviders((prev) => ({ ...prev, [providerId]: false }));
        }, 20_000);
      } else if (type === "replace") {
        const current = vault[providerId];
        setDrafts((prev) => ({
          ...prev,
          [providerId]: {
            apiKey: "",
            baseUrl: current?.baseUrl || "",
            customModel: current?.customModel || "",
          },
        }));
        setEditingProviders((prev) => ({ ...prev, [providerId]: true }));
      } else if (type === "delete") {
        await onDeleteProviderEntry(providerId);
        setRevealedProviders((prev) => ({ ...prev, [providerId]: false }));
        setEditingProviders((prev) => ({ ...prev, [providerId]: false }));
        setTestMessages((prev) => ({ ...prev, [providerId]: undefined }));
      }

      setPendingAction(null);
      setAuthPassword("");
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  const handleSaveDraft = async (providerId: AiProviderId) => {
    const draft = drafts[providerId];
    const keyVal = draft?.apiKey?.trim() || "";
    if (!keyVal) return;

    setSavingProvider((prev) => ({ ...prev, [providerId]: true }));
    try {
      await onSaveProviderEntry(providerId, {
        apiKey: keyVal,
        baseUrl: draft?.baseUrl?.trim() || vault[providerId]?.baseUrl || "",
        customModel: draft?.customModel?.trim() || vault[providerId]?.customModel || "",
        verified: false,
      });
      setEditingProviders((prev) => ({ ...prev, [providerId]: false }));
      setDrafts((prev) => ({ ...prev, [providerId]: undefined }));
      setTestMessages((prev) => ({
        ...prev,
        [providerId]: {
          ok: true,
          text: isEn ? "Encrypted & saved (AES-256-GCM)." : "Cifrada y guardada (AES-256-GCM).",
        },
      }));
    } finally {
      setSavingProvider((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const handleTestConnection = async (providerId: AiProviderId) => {
    const entry = vault[providerId];
    if (!entry?.apiKey?.trim()) return;

    setTesting((prev) => ({ ...prev, [providerId]: true }));
    setTestMessages((prev) => ({ ...prev, [providerId]: undefined }));

    try {
      const res = await fetch("/api/ai/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": entry.apiKey.trim(),
        },
        body: JSON.stringify({
          provider: providerId,
          customBaseUrl: entry.baseUrl || "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; note?: string };
      if (data.ok) {
        await onSaveProviderEntry(providerId, {
          ...entry,
          verified: true,
          verifiedAt: Date.now(),
        });
        setTestMessages((prev) => ({
          ...prev,
          [providerId]: {
            ok: true,
            text:
              data.note ||
              (isEn ? "Connection verified successfully." : "Conexión verificada correctamente."),
          },
        }));
      } else {
        setTestMessages((prev) => ({
          ...prev,
          [providerId]: {
            ok: false,
            text: data.error || (isEn ? "Invalid API key." : "API Key inválida."),
          },
        }));
      }
    } catch (err) {
      setTestMessages((prev) => ({
        ...prev,
        [providerId]: {
          ok: false,
          text: err instanceof Error ? err.message : "Network error",
        },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const capabilityBadge = (cap: "image" | "edit" | "video" | "audio") => {
    const map = {
      image: { label: "IMG", cls: "bg-[#1e40ff]/10 text-[#1e40ff] border-[#1e40ff]/25" },
      edit: { label: "EDIT", cls: "bg-[#ff4d00]/10 text-[#c93d00] border-[#ff4d00]/25" },
      video: { label: "VIDEO", cls: "bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/25" },
      audio: { label: "AUDIO", cls: "bg-amber-500/12 text-amber-900 border-amber-600/25" },
    }[cap];
    return (
      <span
        key={cap}
        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${map.cls}`}
      >
        {map.label}
      </span>
    );
  };

  // =========================================================================
  // STATE 1: UNINITIALIZED — CREATE MASTER PASSWORD
  // =========================================================================
  if (vaultStatus === "uninitialized") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 tactile-surface space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0c0e12] text-white flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-[#60a5fa]" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-primary">
                AES-256-GCM // PBKDF2-SHA256 (310,000 ITER.)
              </span>
              <h2 className="text-2xl font-heading font-bold text-foreground">
                {isEn
                  ? "Create Your Encrypted Vault Master Password"
                  : "Crea tu Contraseña Maestra de la Bóveda"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isEn
                  ? "Your API keys are encrypted locally using AES-256-GCM before touching localStorage. You will need this password to unlock, reveal, replace, or delete any saved API key. ClearCut Studio never sends or stores this password."
                  : "Tus API keys se cifran localmente con AES-256-GCM antes de guardarse en tu navegador. Necesitarás esta contraseña maestra para desbloquear la bóveda y autorizar ver, reemplazar o eliminar cualquier API key. ClearCut Studio nunca almacena ni conoce esta contraseña."}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateVault} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="vault-master-password"
                className="block text-[11px] font-mono font-bold uppercase text-muted-foreground"
              >
                {isEn ? "Master Password" : "Contraseña Maestra Segura"}
              </label>
              <div className="relative">
                <input
                  id="vault-master-password"
                  type={showSetupPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isEn ? "Min. 10 chars, upper, lower, number & symbol" : "Mín. 10 caracteres, mayúscula, minúscula, número y símbolo"}
                  autoComplete="new-password"
                  className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowSetupPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showSetupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`h-1.5 rounded-full transition-colors ${
                      strength.score >= bar
                        ? strength.score === 5
                          ? "bg-emerald-600"
                          : strength.score >= 3
                          ? "bg-amber-500"
                          : "bg-destructive"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 text-[10px] font-mono">
                {[
                  { ok: strength.checks.length, label: "10+ chars" },
                  { ok: strength.checks.upper, label: "A–Z" },
                  { ok: strength.checks.lower, label: "a–z" },
                  { ok: strength.checks.number, label: "0–9" },
                  { ok: strength.checks.symbol, label: "!@#$%" },
                ].map((c) => (
                  <span
                    key={c.label}
                    className={`px-2 py-1 rounded-md border text-center font-semibold ${
                      c.ok
                        ? "bg-emerald-500/12 border-emerald-600/25 text-emerald-800"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {c.ok ? "✓ " : "○ "}
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="vault-confirm-password"
                className="block text-[11px] font-mono font-bold uppercase text-muted-foreground"
              >
                {isEn ? "Confirm Master Password" : "Confirmar Contraseña Maestra"}
              </label>
              <input
                id="vault-confirm-password"
                type={showSetupPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {setupError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{setupError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!strength.isValid || !confirmPassword || isInitializing}
              className="w-full py-3 px-5 rounded-full bg-[#0c0e12] hover:bg-primary disabled:opacity-40 text-white text-sm font-bold inline-flex items-center justify-center gap-2 tactile-button transition-colors cursor-pointer"
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>
                {isEn
                  ? "Initialize Encrypted Vault (AES-256)"
                  : "Crear Bóveda Cifrada (AES-256)"}
              </span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: LOCKED — REQUIRE MASTER PASSWORD TO DECRYPT
  // =========================================================================
  if (vaultStatus === "locked") {
    return (
      <div className="max-w-lg mx-auto space-y-5 pt-4">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 tactile-surface space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0c0e12] text-white flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-[#ff4d00]" />
            </div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-primary">
              VAULT LOCKED // AES-256-GCM
            </span>
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {isEn ? "Unlock Your API Keys Vault" : "Desbloquea tu Bóveda de API Keys"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEn
                ? `${encryptedKeyCount} encrypted provider key(s) stored locally. Enter your master password to decrypt in memory.`
                : `${encryptedKeyCount} proveedor(es) cifrados en almacenamiento local. Ingresa tu contraseña maestra para descifrar en memoria.`}
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <input
              type="password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              placeholder={isEn ? "Enter Master Password..." : "Ingresa tu Contraseña Maestra..."}
              autoComplete="current-password"
              autoFocus
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary"
            />

            {unlockError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!unlockPassword || isUnlocking}
              className="w-full py-3 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-sm font-bold inline-flex items-center justify-center gap-2 tactile-button cursor-pointer"
            >
              {isUnlocking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              <span>{isEn ? "Decrypt & Unlock Vault" : "Descifrar y Desbloquear"}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-border text-center">
            {!confirmPurge ? (
              <button
                type="button"
                onClick={() => setConfirmPurge(true)}
                className="text-xs font-mono text-muted-foreground hover:text-destructive underline cursor-pointer"
              >
                {isEn
                  ? "Forgot password? Reset & purge encrypted vault"
                  : "¿Olvidaste tu contraseña? Purgar y restablecer bóveda"}
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-destructive/8 border border-destructive/25 space-y-2">
                <p className="text-xs text-destructive font-medium">
                  {isEn
                    ? "This permanently deletes all locally encrypted API keys so you can create a new password."
                    : "Esto borrará permanentemente las API keys cifradas locales para crear una nueva contraseña."}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmPurge(false)}
                    className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-semibold cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Cancelar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPurgeVault();
                      setConfirmPurge(false);
                    }}
                    className="px-3 py-1.5 rounded-full bg-destructive text-white text-xs font-semibold cursor-pointer"
                  >
                    {isEn ? "Confirm Purge" : "Sí, purgar bóveda"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 3: UNLOCKED — PROTECTED VIEW / REPLACE / DELETE
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 tactile-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AES-256-GCM // {isEn ? "VAULT UNLOCKED" : "BÓVEDA CIFRADA ACTIVA"}</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              {isEn ? "AI Providers & Encrypted API Vault" : "Bóveda Cifrada de API Keys y Proveedores IA"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {isEn
                ? "All keys are encrypted locally with AES-256-GCM + PBKDF2 (310,000 iterations). Revealing, replacing, or deleting any saved key requires re-confirming your Master Password."
                : "Todas tus claves están cifradas localmente con AES-256-GCM + PBKDF2 (310,000 iteraciones). Ver, reemplazar o eliminar cualquier clave guardada requiere volver a autorizar con tu Contraseña Maestra."}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-background border border-border text-right">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">
                {isEn ? "Active Engines" : "Motores Activos"}
              </div>
              <div className="text-lg font-heading font-bold text-foreground">
                {configuredCount} / {PROVIDERS.length}
              </div>
            </div>
            <button
              type="button"
              onClick={onLockVault}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0c0e12] hover:bg-destructive text-white text-xs font-bold tactile-button transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isEn ? "Lock Vault" : "Bloquear Bóveda"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROVIDERS.map((provider, idx) => {
          const entry = vault[provider.id] || { apiKey: "" };
          const hasSavedKey = Boolean(entry.apiKey?.trim());
          const isEditing = Boolean(editingProviders[provider.id]) || !hasSavedKey;
          const isRevealed = Boolean(revealedProviders[provider.id]);
          const draft = drafts[provider.id] || {
            apiKey: "",
            baseUrl: entry.baseUrl || "",
            customModel: entry.customModel || "",
          };
          const isTesting = Boolean(testing[provider.id]);
          const isSaving = Boolean(savingProvider[provider.id]);
          const feedback = testMessages[provider.id];

          return (
            <div
              key={provider.id}
              className={`bg-card border rounded-2xl p-5 transition-all flex flex-col justify-between gap-4 ${
                entry.verified
                  ? "border-emerald-600/40 shadow-soft"
                  : hasSavedKey
                  ? "border-primary/40 shadow-soft"
                  : "border-border"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-xl text-white font-mono text-xs font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: provider.accentHex }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-base text-foreground">
                          {provider.name}
                        </h3>
                        {entry.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-800 border border-emerald-600/25">
                            <CheckCircle2 className="w-3 h-3" />
                            {isEn ? "VERIFIED" : "VERIFICADA"}
                          </span>
                        )}
                        {!entry.verified && hasSavedKey && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                            <Lock className="w-2.5 h-2.5" />
                            AES-256
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isEn ? provider.taglineEn : provider.taglineEs}
                      </p>
                    </div>
                  </div>

                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline shrink-0"
                  >
                    <span>{isEn ? "Get key" : "Obtener"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {provider.capabilities.map((cap) => capabilityBadge(cap))}
                </div>

                {/* Protected Key Display vs Edit Mode */}
                {hasSavedKey && !isEditing ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background border border-border">
                      <code className="text-xs font-mono text-foreground truncate select-all">
                        {isRevealed ? entry.apiKey : maskApiKeyForDisplay(entry.apiKey)}
                      </code>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            requestSensitiveAction("reveal", provider.id, provider.name)
                          }
                          title={
                            isRevealed
                              ? isEn
                                ? "Hide key"
                                : "Ocultar llave"
                              : isEn
                              ? "Reveal key (Master Password required)"
                              : "Ver llave (requiere Contraseña Maestra)"
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4 text-primary" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requestSensitiveAction("replace", provider.id, provider.name)
                          }
                          title={
                            isEn
                              ? "Replace key (Master Password required)"
                              : "Reemplazar llave (requiere Contraseña Maestra)"
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requestSensitiveAction("delete", provider.id, provider.name)
                          }
                          title={
                            isEn
                              ? "Delete key (Master Password required)"
                              : "Eliminar llave (requiere Contraseña Maestra)"
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {isRevealed && (
                      <p className="text-[10px] font-mono text-amber-800">
                        {isEn
                          ? "Visible temporarily · Auto-hides in 20 seconds."
                          : "Visible temporalmente · Se ocultará automáticamente en 20 segundos."}
                      </p>
                    )}
                    {provider.supportsCustomBaseUrl && entry.baseUrl && (
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        Endpoint: {entry.baseUrl} {entry.customModel ? `· ${entry.customModel}` : ""}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label
                        htmlFor={`key-${provider.id}`}
                        className="block text-[11px] font-mono font-semibold uppercase text-muted-foreground mb-1"
                      >
                        {hasSavedKey
                          ? isEn
                            ? "New Replacement API Key"
                            : "Nueva API Key de Reemplazo"
                          : "API Key"}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          id={`key-${provider.id}`}
                          type="password"
                          value={draft.apiKey}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [provider.id]: { ...draft, apiKey: e.target.value },
                            }))
                          }
                          placeholder={provider.keyPlaceholder}
                          autoComplete="off"
                          spellCheck={false}
                          className="flex-1 h-10 px-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          disabled={!draft.apiKey.trim() || isSaving}
                          onClick={() => handleSaveDraft(provider.id)}
                          className="h-10 px-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>{isEn ? "Encrypt" : "Cifrar"}</span>
                        </button>
                        {hasSavedKey && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingProviders((prev) => ({ ...prev, [provider.id]: false }))
                            }
                            className="h-10 px-2.5 rounded-xl bg-background hover:bg-muted border border-border text-xs cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {provider.supportsCustomBaseUrl && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="url"
                          value={draft.baseUrl || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [provider.id]: { ...draft, baseUrl: e.target.value },
                            }))
                          }
                          placeholder="https://api.together.xyz/v1"
                          className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground"
                        />
                        <input
                          type="text"
                          value={draft.customModel || ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [provider.id]: { ...draft, customModel: e.target.value },
                            }))
                          }
                          placeholder="Model ID (e.g. midjourney-v7)"
                          className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Row */}
              <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {feedback ? (
                    <p
                      className={`text-xs flex items-center gap-1.5 truncate ${
                        feedback.ok ? "text-emerald-800" : "text-destructive"
                      }`}
                    >
                      {feedback.ok ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{feedback.text}</span>
                    </p>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {hasSavedKey
                        ? isEn
                          ? "Protected by Master Password"
                          : "Protegida con Contraseña Maestra"
                        : isEn
                        ? "Not configured"
                        : "Sin configurar"}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!hasSavedKey || isTesting}
                  onClick={() => handleTestConnection(provider.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground hover:bg-primary disabled:opacity-40 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEn ? "Verify key" : "Probar conexión"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Password Permission Modal (for View / Replace / Delete) */}
      {pendingAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0c0e12]/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-medium space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0c0e12] text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-[#ff4d00]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                    {isEn ? "SECURITY PERMISSION" : "PERMISO DE SEGURIDAD"}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    {pendingAction.type === "reveal"
                      ? isEn
                        ? `Reveal ${pendingAction.providerName} Key`
                        : `Ver API Key de ${pendingAction.providerName}`
                      : pendingAction.type === "replace"
                      ? isEn
                        ? `Replace ${pendingAction.providerName} Key`
                        : `Reemplazar API Key de ${pendingAction.providerName}`
                      : isEn
                      ? `Delete ${pendingAction.providerName} Key`
                      : `Eliminar API Key de ${pendingAction.providerName}`}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isEn
                ? "Enter your Master Password to authorize this sensitive operation."
                : "Ingresa tu Contraseña Maestra para autorizar esta operación sensible."}
            </p>

            <form onSubmit={handleConfirmSensitiveAction} className="space-y-3">
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder={isEn ? "Master Password..." : "Contraseña Maestra..."}
                autoComplete="current-password"
                autoFocus
                className="w-full h-10 px-3.5 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary"
              />

              {authError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingAction(null)}
                  className="px-4 py-2 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
                >
                  {isEn ? "Cancel" : "Cancelar"}
                </button>
                <button
                  type="submit"
                  disabled={!authPassword || isVerifyingAuth}
                  className={`px-5 py-2 rounded-full text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                    pendingAction.type === "delete"
                      ? "bg-destructive hover:bg-destructive/90"
                      : "bg-primary hover:bg-primary-hover"
                  }`}
                >
                  {isVerifyingAuth ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  <span>{isEn ? "Authorize" : "Autorizar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
