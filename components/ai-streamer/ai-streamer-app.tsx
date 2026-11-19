"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Film,
  Volume2,
  Maximize2,
  SlidersHorizontal,
  Scissors,
  LayoutGrid,
  FolderOpen,
  HardDrive,
  KeyRound,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Archive,
  CloudUpload,
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { WorkspaceHeader } from "@/components/studio/workspace-header";
import {
  countConfiguredKeys,
  createEmptyVault,
  PROVIDERS,
} from "@/lib/ai-studio/providers";
import {
  loadEncryptedVaultEnvelope,
  purgeEncryptedVault,
  saveEncryptedVault,
  unlockEncryptedVault,
  verifyStoredMasterPassword,
} from "@/lib/ai-studio/vault-crypto";
import {
  loadGoogleDriveSession,
  saveGoogleDriveSession,
  uploadAssetToGoogleDrive,
} from "@/lib/ai-studio/google-drive";
import {
  downloadAssetsAsZip,
  downloadSingleAsset,
  formatFileSize,
} from "@/lib/ai-studio/export-utils";
import type {
  AiProviderId,
  ApiKeyVault,
  GeneratedAsset,
  GoogleDriveSession,
  StudioSectionId,
} from "@/lib/ai-studio/types";

import { CreateImagePanel } from "./create-image-panel";
import { CreateVideoPanel } from "./create-video-panel";
import { CreateAudioPanel } from "./create-audio-panel";
import { ResizeImagePanel } from "./resize-image-panel";
import { EditImagePanel } from "./edit-image-panel";
import { EditVideoPanel } from "./edit-video-panel";
import { MoodboardPanel } from "./moodboard-panel";
import { LibraryPanel } from "./library-panel";
import { GoogleDriveConnectModal, GoogleDrivePanel } from "./google-drive-panel";
import { ApiVaultPanel, type VaultStatus } from "./api-vault-panel";

interface AiStreamerAppProps {
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

interface NavGroup {
  code: string;
  labelEs: string;
  labelEn: string;
  items: Array<{
    id: StudioSectionId;
    labelEs: string;
    labelEn: string;
    tag?: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const STUDIO_NAV_GROUPS: NavGroup[] = [
  {
    code: "01",
    labelEs: "CREAR (IA)",
    labelEn: "CREATE (AI)",
    items: [
      { id: "create-image", labelEs: "Imágenes por Lotes", labelEn: "Batch Images", tag: "2–8×", icon: Sparkles },
      { id: "create-video", labelEs: "Video IA", labelEn: "AI Video", tag: "MOTION", icon: Film },
      { id: "create-audio", labelEs: "Audio & Voz IA", labelEn: "AI Audio", tag: "TTS", icon: Volume2 },
    ],
  },
  {
    code: "02",
    labelEs: "ESTUDIO",
    labelEn: "STUDIO",
    items: [
      { id: "resize-image", labelEs: "Redimensionar", labelEn: "Resize Images", tag: "LOTE", icon: Maximize2 },
      { id: "edit-image", labelEs: "Editar Imagen", labelEn: "Edit Image", tag: "AI+2D", icon: SlidersHorizontal },
      { id: "edit-video", labelEs: "Editar Video", labelEn: "Edit Video", tag: "TRIM", icon: Scissors },
      { id: "moodboard", labelEs: "Moodboard", labelEn: "Moodboard", icon: LayoutGrid },
    ],
  },
  {
    code: "03",
    labelEs: "BIBLIOTECA",
    labelEn: "ASSETS",
    items: [
      { id: "library", labelEs: "Sesión Local", labelEn: "Session Library", icon: FolderOpen },
      { id: "google-drive", labelEs: "Google Drive", labelEn: "Google Drive", icon: HardDrive },
    ],
  },
  {
    code: "04",
    labelEs: "CONFIGURACIÓN",
    labelEn: "SYSTEM",
    items: [
      { id: "api-vault", labelEs: "Bóveda API Keys", labelEn: "API Keys Vault", icon: KeyRound },
    ],
  },
];

export default function AiStreamerApp({
  onClose,
  lang = "es",
}: AiStreamerAppProps) {
  const isEn = lang === "en";

  const [activeSection, setActiveSection] = useState<StudioSectionId>("create-image");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [vault, setVault] = useState<ApiKeyVault>(() => createEmptyVault());
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>("uninitialized");
  const [encryptedKeyCount, setEncryptedKeyCount] = useState(0);
  const masterPasswordRef = useRef<string | null>(null);

  const [driveSession, setDriveSession] = useState<GoogleDriveSession | null>(null);
  const [driveModalOpen, setDriveModalOpen] = useState(false);

  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Cross-section handoff state
  const [resizeQueueIds, setResizeQueueIds] = useState<string[]>([]);
  const [editImageTarget, setEditImageTarget] = useState<GeneratedAsset | null>(null);
  const [editVideoTarget, setEditVideoTarget] = useState<GeneratedAsset | null>(null);
  const [videoRefTarget, setVideoRefTarget] = useState<GeneratedAsset | null>(null);
  const [inspectAsset, setInspectAsset] = useState<GeneratedAsset | null>(null);

  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);

  const showToast = useCallback((kind: "ok" | "err" | "info", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 3600);
  }, []);

  // Inspect Encrypted AES-256 Vault status & Google Drive session on mount
  useEffect(() => {
    const envelope = loadEncryptedVaultEnvelope();
    if (envelope) {
      setVaultStatus("locked");
      setEncryptedKeyCount(envelope.configuredCount || 0);
    } else {
      setVaultStatus("uninitialized");
      setEncryptedKeyCount(0);
    }

    const loadedDrive = loadGoogleDriveSession();
    if (loadedDrive) {
      setDriveSession(loadedDrive);
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("drive") === "connected" && loadedDrive) {
        showToast(
          "ok",
          isEn
            ? `Google Drive connected (${loadedDrive.user.email})`
            : `Google Drive conectado (${loadedDrive.user.email})`
        );
      }
    }
  }, [isEn, showToast]);

  const handleInitializeVault = useCallback(
    async (masterPassword: string) => {
      const empty = createEmptyVault();
      const env = await saveEncryptedVault(empty, masterPassword);
      masterPasswordRef.current = masterPassword;
      setVault(empty);
      setEncryptedKeyCount(env.configuredCount);
      setVaultStatus("unlocked");
      showToast(
        "ok",
        isEn
          ? "Encrypted AES-256 vault initialized."
          : "Bóveda cifrada AES-256 creada y desbloqueada."
      );
    },
    [isEn, showToast]
  );

  const handleUnlockVault = useCallback(
    async (masterPassword: string) => {
      const decrypted = await unlockEncryptedVault(masterPassword);
      masterPasswordRef.current = masterPassword;
      setVault(decrypted);
      setEncryptedKeyCount(countConfiguredKeys(decrypted));
      setVaultStatus("unlocked");
      showToast(
        "ok",
        isEn ? "Vault decrypted in memory." : "Bóveda descifrada en memoria."
      );
    },
    [isEn, showToast]
  );

  const handleLockVault = useCallback(() => {
    masterPasswordRef.current = null;
    setVault(createEmptyVault());
    setVaultStatus("locked");
    showToast(
      "info",
      isEn ? "Vault locked and keys cleared from memory." : "Bóveda bloqueada y claves limpiadas de memoria."
    );
  }, [isEn, showToast]);

  const handlePurgeVault = useCallback(() => {
    purgeEncryptedVault();
    masterPasswordRef.current = null;
    setVault(createEmptyVault());
    setEncryptedKeyCount(0);
    setVaultStatus("uninitialized");
    showToast(
      "info",
      isEn ? "Encrypted vault purged." : "Bóveda cifrada purgada."
    );
  }, [isEn, showToast]);

  const handleVerifyPassword = useCallback(async (candidate: string) => {
    return verifyStoredMasterPassword(candidate);
  }, []);

  const handleSaveProviderEntry = useCallback(
    async (providerId: AiProviderId, entry: ApiKeyVault[AiProviderId]) => {
      const pwd = masterPasswordRef.current;
      if (!pwd) throw new Error("Vault is locked");
      const next: ApiKeyVault = {
        ...vault,
        [providerId]: entry,
      };
      const env = await saveEncryptedVault(next, pwd);
      setVault(next);
      setEncryptedKeyCount(env.configuredCount);
    },
    [vault]
  );

  const handleDeleteProviderEntry = useCallback(
    async (providerId: AiProviderId) => {
      const pwd = masterPasswordRef.current;
      if (!pwd) throw new Error("Vault is locked");
      const next: ApiKeyVault = {
        ...vault,
        [providerId]: { apiKey: "", baseUrl: "", customModel: "", verified: false },
      };
      const env = await saveEncryptedVault(next, pwd);
      setVault(next);
      setEncryptedKeyCount(env.configuredCount);
      showToast(
        "info",
        isEn ? "API key removed and vault re-encrypted." : "API key eliminada y bóveda recifrada."
      );
    },
    [isEn, showToast, vault]
  );

  const handleDriveSessionChange = useCallback((next: GoogleDriveSession | null) => {
    setDriveSession(next);
    saveGoogleDriveSession(next);
  }, []);

  const handleAddAsset = useCallback((asset: GeneratedAsset) => {
    setAssets((prev) => [asset, ...prev]);
  }, []);

  const handleDeleteAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDownloadBatchZip = useCallback(
    async (items: GeneratedAsset[]) => {
      if (items.length === 0) return;
      try {
        const res = await downloadAssetsAsZip(items, "clearcut-ai-studio-batch");
        showToast(
          "ok",
          isEn
            ? `Downloaded ZIP with ${res.fileCount} files (${formatFileSize(res.totalBytes)})`
            : `ZIP descargado con ${res.fileCount} archivos (${formatFileSize(res.totalBytes)})`
        );
      } catch (err) {
        showToast("err", err instanceof Error ? err.message : "ZIP export error");
      }
    },
    [isEn, showToast]
  );

  const handleSaveSingleToDrive = useCallback(
    async (asset: GeneratedAsset) => {
      if (!driveSession) {
        setDriveModalOpen(true);
        return;
      }
      setIsSyncingDrive(true);
      try {
        const uploaded = await uploadAssetToGoogleDrive(driveSession, asset);
        if (!driveSession.folderId && uploaded.folderId) {
          handleDriveSessionChange({ ...driveSession, folderId: uploaded.folderId });
        }
        setAssets((prev) =>
          prev.map((a) =>
            a.id === asset.id
              ? { ...a, driveFileId: uploaded.fileId, driveWebViewLink: uploaded.webViewLink }
              : a
          )
        );
        showToast(
          "ok",
          isEn
            ? `Saved "${asset.name}" to Google Drive`
            : `"${asset.name}" guardado en Google Drive`
        );
      } catch (err) {
        showToast(
          "err",
          err instanceof Error ? err.message : "Google Drive upload failed"
        );
      } finally {
        setIsSyncingDrive(false);
      }
    },
    [driveSession, handleDriveSessionChange, isEn, showToast]
  );

  const handleSaveBatchToDrive = useCallback(
    async (items: GeneratedAsset[]) => {
      if (items.length === 0) return;
      if (!driveSession) {
        setDriveModalOpen(true);
        return;
      }
      setIsSyncingDrive(true);
      let okCount = 0;
      let activeSession = driveSession;
      try {
        for (const item of items) {
          const uploaded = await uploadAssetToGoogleDrive(activeSession, item);
          if (!activeSession.folderId && uploaded.folderId) {
            activeSession = { ...activeSession, folderId: uploaded.folderId };
            handleDriveSessionChange(activeSession);
          }
          setAssets((prev) =>
            prev.map((a) =>
              a.id === item.id
                ? { ...a, driveFileId: uploaded.fileId, driveWebViewLink: uploaded.webViewLink }
                : a
            )
          );
          okCount++;
        }
        showToast(
          "ok",
          isEn
            ? `Uploaded ${okCount} files to Google Drive`
            : `${okCount} archivos guardados en Google Drive`
        );
      } catch (err) {
        showToast(
          "err",
          err instanceof Error ? err.message : `Saved ${okCount}/${items.length} files`
        );
      } finally {
        setIsSyncingDrive(false);
      }
    },
    [driveSession, handleDriveSessionChange, isEn, showToast]
  );

  const configuredKeys = countConfiguredKeys(vault);
  const selectedAssets = assets.filter((a) => selectedIds.has(a.id));

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-foreground flex flex-col">
      {/* Unified ClearCut Workspace Header */}
      <WorkspaceHeader
        slug="ai-image-streamer"
        lang={lang}
        onClose={onClose}
        subtitle={
          isEn
            ? "Batch AI Images · Video · Audio · Optical Resize & Edit · Google Drive"
            : "Lotes IA · Video · Audio · Redimensionar y Editar · Google Drive"
        }
        rightSlot={
          <div className="flex items-center gap-2">
            {/* API Vault Status Pill */}
            <button
              type="button"
              onClick={() => setActiveSection("api-vault")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold transition-colors cursor-pointer ${
                vaultStatus === "unlocked" && configuredKeys > 0
                  ? "bg-emerald-500/12 hover:bg-emerald-500/20 border-emerald-600/25 text-emerald-900"
                  : vaultStatus === "locked"
                  ? "bg-[#0c0e12] hover:bg-primary border-[#0c0e12] text-white"
                  : "bg-[#ff4d00]/12 hover:bg-[#ff4d00]/20 border-[#ff4d00]/30 text-[#b83700]"
              }`}
            >
              {vaultStatus === "unlocked" ? (
                <KeyRound className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>
                {vaultStatus === "locked"
                  ? isEn
                    ? `Locked (${encryptedKeyCount})`
                    : `Bloqueada (${encryptedKeyCount})`
                  : vaultStatus === "uninitialized"
                  ? isEn
                    ? "Setup Vault"
                    : "Crear Bóveda"
                  : `${configuredKeys}/${PROVIDERS.length} AES-256`}
              </span>
            </button>

            {/* Google Drive Connection Pill */}
            <button
              type="button"
              onClick={() =>
                driveSession ? setActiveSection("google-drive") : setDriveModalOpen(true)
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                driveSession
                  ? "bg-emerald-500/12 border-emerald-600/25 text-emerald-900 hover:bg-emerald-500/20"
                  : "bg-card hover:bg-muted border-border text-foreground"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  driveSession ? "bg-emerald-600" : "bg-slate-400"
                }`}
              />
              <HardDrive className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="max-w-[130px] truncate">
                {driveSession
                  ? driveSession.user.email
                  : isEn
                  ? "Connect Drive"
                  : "Conectar Drive"}
              </span>
            </button>

            {/* Quick Export All ZIP */}
            {assets.length > 0 && (
              <button
                type="button"
                onClick={() => handleDownloadBatchZip(assets)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0c0e12] hover:bg-primary text-white text-xs font-semibold tactile-button transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>ZIP ({assets.length})</span>
              </button>
            )}
          </div>
        }
      />

      {/* Mobile Horizontal Navigation Strip */}
      <div className="lg:hidden border-b border-border bg-card px-3 py-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {STUDIO_NAV_GROUPS.flatMap((g) => g.items).map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-[#0c0e12] text-white"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isEn ? item.labelEn : item.labelEs}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Shell: Sticky Independent Left Rail + Scrollable Optical Atelier Main Canvas */}
      <div className="flex-1 flex items-start min-h-0 max-w-[1680px] w-full mx-auto">
        {/* Desktop Left Studio Rail — Sticky viewport height so Google Drive card NEVER gets pushed down */}
        <aside
          aria-label={isEn ? "AI Studio Sections" : "Categorías del Generador IA"}
          className={`hidden lg:flex flex-col border-r border-border bg-card/90 backdrop-blur-xs transition-all duration-200 shrink-0 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] ${
            sidebarCollapsed ? "w-[74px]" : "w-[252px]"
          }`}
        >
          <div className="p-3 border-b border-border flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-muted-foreground pl-1.5">
                ATELIER // MODULES
              </span>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer mx-auto lg:mx-0"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {STUDIO_NAV_GROUPS.map((group) => (
              <div key={group.code} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                    <span className="text-primary">{group.code}</span>
                    <span>// {isEn ? group.labelEn : group.labelEs}</span>
                  </div>
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  const dynamicBadge =
                    item.id === "library" && assets.length > 0
                      ? String(assets.length)
                      : item.id === "api-vault"
                      ? vaultStatus === "locked"
                        ? "LOCK"
                        : vaultStatus === "uninitialized"
                        ? "NEW"
                        : `${configuredKeys}/${PROVIDERS.length}`
                      : item.id === "google-drive"
                      ? driveSession
                        ? "ON"
                        : "OFF"
                      : item.tag;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      title={sidebarCollapsed ? (isEn ? item.labelEn : item.labelEs) : undefined}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        active
                          ? "bg-[#0c0e12] text-white shadow-soft"
                          : "text-foreground hover:bg-background border border-transparent hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? "text-[#60a5fa]" : "text-muted-foreground"
                          }`}
                        />
                        {!sidebarCollapsed && (
                          <span className="text-xs font-semibold truncate">
                            {isEn ? item.labelEn : item.labelEs}
                          </span>
                        )}
                      </div>

                      {!sidebarCollapsed && dynamicBadge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            active
                              ? "bg-white/15 text-white"
                              : item.id === "google-drive" && driveSession
                              ? "bg-emerald-500/15 text-emerald-800"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {dynamicBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom Sidebar Cloud Status Card */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-border">
              <div className="p-3 rounded-xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-muted-foreground">GOOGLE DRIVE</span>
                  <span className={driveSession ? "text-emerald-700" : "text-[#ff4d00]"}>
                    {driveSession ? "SYNC READY" : isEn ? "DISCONNECTED" : "SIN CONECTAR"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {driveSession
                    ? driveSession.user.email
                    : isEn
                    ? "Connect Google Drive to persist your AI photos & videos."
                    : "Conecta Google Drive para guardar tus fotos y videos IA."}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    driveSession ? setActiveSection("google-drive") : setDriveModalOpen(true)
                  }
                  className="w-full py-1.5 rounded-lg bg-card hover:bg-primary hover:text-white border border-border text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {driveSession
                    ? isEn
                      ? "Open Drive Vault"
                      : "Ver Carpeta Drive"
                    : isEn
                    ? "Connect Google Account"
                    : "Conectar cuenta Google"}
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Active Workspace Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 overflow-y-auto">
          {activeSection === "create-image" && (
            <CreateImagePanel
              vault={vault}
              assets={assets}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onAddAsset={handleAddAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              onOpenApiVault={() => setActiveSection("api-vault")}
              onSendToResize={(asset) => {
                setResizeQueueIds([asset.id]);
                setActiveSection("resize-image");
              }}
              onSendToEditImage={(asset) => {
                setEditImageTarget(asset);
                setActiveSection("edit-image");
              }}
              onSendToVideoRef={(asset) => {
                setVideoRefTarget(asset);
                setActiveSection("create-video");
              }}
              onInspectAsset={setInspectAsset}
              onDownloadBatchZip={handleDownloadBatchZip}
              lang={lang}
            />
          )}

          {activeSection === "create-video" && (
            <CreateVideoPanel
              vault={vault}
              assets={assets}
              initialReferenceAsset={videoRefTarget}
              onAddAsset={handleAddAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              onSendToEditVideo={(video) => {
                setEditVideoTarget(video);
                setActiveSection("edit-video");
              }}
              onOpenApiVault={() => setActiveSection("api-vault")}
              onDownloadBatchZip={handleDownloadBatchZip}
              lang={lang}
            />
          )}

          {activeSection === "create-audio" && (
            <CreateAudioPanel
              vault={vault}
              assets={assets}
              onAddAsset={handleAddAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              onOpenApiVault={() => setActiveSection("api-vault")}
              lang={lang}
            />
          )}

          {activeSection === "resize-image" && (
            <ResizeImagePanel
              assets={assets}
              initialAssetIds={resizeQueueIds}
              onAddAsset={handleAddAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              onDownloadBatchZip={handleDownloadBatchZip}
              lang={lang}
            />
          )}

          {activeSection === "edit-image" && (
            <EditImagePanel
              vault={vault}
              assets={assets}
              initialAsset={editImageTarget}
              onAddAsset={handleAddAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              onOpenApiVault={() => setActiveSection("api-vault")}
              lang={lang}
            />
          )}

          {activeSection === "edit-video" && (
            <EditVideoPanel
              assets={assets}
              initialVideo={editVideoTarget}
              onAddAsset={handleAddAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              lang={lang}
            />
          )}

          {activeSection === "moodboard" && (
            <MoodboardPanel
              assets={assets}
              onAddAsset={handleAddAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              onDownloadBatchZip={handleDownloadBatchZip}
              lang={lang}
            />
          )}

          {activeSection === "library" && (
            <LibraryPanel
              assets={assets}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={(ids) => setSelectedIds(new Set(ids))}
              onClearSelection={() => setSelectedIds(new Set())}
              onAddAsset={handleAddAsset}
              onDeleteAsset={handleDeleteAsset}
              onSaveToDrive={handleSaveSingleToDrive}
              onSaveBatchToDrive={handleSaveBatchToDrive}
              onDownloadBatchZip={handleDownloadBatchZip}
              onSendToResize={(asset) => {
                setResizeQueueIds([asset.id]);
                setActiveSection("resize-image");
              }}
              onSendToEditImage={(asset) => {
                setEditImageTarget(asset);
                setActiveSection("edit-image");
              }}
              onSendToEditVideo={(asset) => {
                setEditVideoTarget(asset);
                setActiveSection("edit-video");
              }}
              onInspectAsset={setInspectAsset}
              lang={lang}
            />
          )}

          {activeSection === "google-drive" && (
            <GoogleDrivePanel
              session={driveSession}
              onSessionChange={handleDriveSessionChange}
              assets={assets}
              onSyncBatchToDrive={handleSaveBatchToDrive}
              isSyncingBatch={isSyncingDrive}
              lang={lang}
            />
          )}

          {activeSection === "api-vault" && (
            <ApiVaultPanel
              vault={vault}
              vaultStatus={vaultStatus}
              encryptedKeyCount={encryptedKeyCount}
              onInitializeVault={handleInitializeVault}
              onUnlockVault={handleUnlockVault}
              onLockVault={handleLockVault}
              onPurgeVault={handlePurgeVault}
              onVerifyPassword={handleVerifyPassword}
              onSaveProviderEntry={handleSaveProviderEntry}
              onDeleteProviderEntry={handleDeleteProviderEntry}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Floating Batch Selection Dock */}
      {selectedAssets.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] bg-[#0c0e12] text-white border border-[#242936] rounded-full px-4 py-2.5 shadow-medium flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono font-bold px-2">
            {selectedAssets.length} {isEn ? "selected" : "seleccionados"}
          </span>

          <button
            type="button"
            onClick={() => handleDownloadBatchZip(selectedAssets)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e40ff] hover:bg-[#1530cc] text-white text-xs font-semibold cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{isEn ? "Download ZIP" : "Descargar Lote"}</span>
          </button>

          <button
            type="button"
            disabled={isSyncingDrive}
            onClick={() => handleSaveBatchToDrive(selectedAssets)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
          >
            {isSyncingDrive ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5" />
            )}
            <span>{isEn ? "Save to Drive" : "Guardar en Drive"}</span>
          </button>

          {selectedAssets.some((a) => a.kind === "image") && (
            <button
              type="button"
              onClick={() => {
                setResizeQueueIds(
                  selectedAssets.filter((a) => a.kind === "image").map((a) => a.id)
                );
                setActiveSection("resize-image");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d2230] hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isEn ? "Resize" : "Redimensionar"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            aria-label={isEn ? "Clear selection" : "Limpiar selección"}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full-Resolution Image Lightbox Modal */}
      {inspectAsset && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setInspectAsset(null)}
          className="fixed inset-0 z-50 bg-[#0c0e12]/88 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14171f] border border-[#242936] text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-[#242936] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono text-slate-400">
                  {inspectAsset.provider.toUpperCase()} // {inspectAsset.model}
                  {inspectAsset.width && inspectAsset.height
                    ? ` · ${inspectAsset.width}×${inspectAsset.height}`
                    : ""}
                </div>
                <p className="text-sm font-semibold truncate">{inspectAsset.prompt || inspectAsset.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectAsset(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#0c0e12] darkroom-grid flex items-center justify-center p-4 max-h-[70vh]">
              <img
                src={inspectAsset.dataUrl}
                alt={inspectAsset.name}
                className="max-h-[64vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="px-4 py-3 border-t border-[#242936] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSingleAsset(inspectAsset)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1e40ff] hover:bg-[#1530cc] text-white text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isEn ? "Download" : "Descargar"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSingleToDrive(inspectAsset)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Google Drive</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResizeQueueIds([inspectAsset.id]);
                    setInspectAsset(null);
                    setActiveSection("resize-image");
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#1d2230] hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {isEn ? "Resize" : "Redimensionar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditImageTarget(inspectAsset);
                    setInspectAsset(null);
                    setActiveSection("edit-image");
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#1d2230] hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {isEn ? "Edit Image" : "Editar Imagen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Required Modal */}
      <GoogleDriveConnectModal
        open={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        lang={lang}
      />

      {/* Status Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-medium text-xs font-semibold flex items-center gap-2 ${
            toast.kind === "ok"
              ? "bg-card border-emerald-600/40 text-emerald-900"
              : toast.kind === "err"
              ? "bg-card border-destructive/40 text-destructive"
              : "bg-card border-border text-foreground"
          }`}
        >
          {toast.kind === "ok" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
