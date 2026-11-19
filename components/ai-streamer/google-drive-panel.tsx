"use client";

import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudUpload,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  X,
  HardDrive,
} from "lucide-react";
import {
  disconnectGoogleDrive,
  getEnvGoogleClientId,
  getGoogleRedirectUri,
  getStoredGoogleClientId,
  GOOGLE_DRIVE_FOLDER_NAME,
  listClearCutDriveFiles,
  saveCustomGoogleClientId,
  startGoogleDriveOAuth,
} from "@/lib/ai-studio/google-drive";
import { formatFileSize } from "@/lib/ai-studio/export-utils";
import type {
  GeneratedAsset,
  GoogleDriveFileItem,
  GoogleDriveSession,
} from "@/lib/ai-studio/types";

interface GoogleDrivePanelProps {
  session: GoogleDriveSession | null;
  onSessionChange: (session: GoogleDriveSession | null) => void;
  assets: GeneratedAsset[];
  onSyncBatchToDrive: (assetsToSync: GeneratedAsset[]) => Promise<void>;
  isSyncingBatch: boolean;
  lang?: string;
}

export function GoogleDrivePanel({
  session,
  onSessionChange,
  assets,
  onSyncBatchToDrive,
  isSyncingBatch,
  lang = "es",
}: GoogleDrivePanelProps) {
  const isEn = lang === "en";
  const envClientId = getEnvGoogleClientId();
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [copiedUri, setCopiedUri] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setClientId(getStoredGoogleClientId());
    setRedirectUri(getGoogleRedirectUri());
  }, []);

  const refreshFiles = async () => {
    if (!session) return;
    setLoadingFiles(true);
    setError(null);
    try {
      const result = await listClearCutDriveFiles(session);
      setFiles(result.files);
      if (!session.folderId && result.folderId) {
        onSessionChange({ ...session, folderId: result.folderId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Google Drive files");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (session) {
      refreshFiles();
    } else {
      setFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleConnect = () => {
    setError(null);
    const activeId = envClientId || clientId.trim();
    if (!activeId) {
      setError(
        isEn
          ? "Please enter a Google OAuth 2.0 Client ID below to connect your Google Drive."
          : "Ingresa tu Google OAuth 2.0 Client ID abajo para conectar tu cuenta de Google Drive."
      );
      return;
    }
    if (!envClientId) {
      saveCustomGoogleClientId(activeId);
    }
    startGoogleDriveOAuth(activeId, lang);
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive(session?.accessToken);
    onSessionChange(null);
  };

  const handleCopyRedirect = () => {
    if (!redirectUri) return;
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 1800);
  };

  const unsavedAssets = assets.filter((a) => !a.driveFileId);

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className="bg-card border border-border rounded-2xl p-6 tactile-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-primary">
              <HardDrive className="w-3.5 h-3.5" />
              <span>GOOGLE DRIVE // {isEn ? "PERSONAL CLOUD VAULT" : "NUBE PERSONAL"}</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              {isEn ? "Save AI Creations to Google Drive" : "Guarda tus Creaciones IA en Google Drive"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {isEn
                ? "ClearCut Studio never hosts your generated images, videos, or audio. Connect your Google account to save individual files or entire batches directly into your own Drive folder."
                : "ClearCut Studio nunca aloja tus imágenes, videos ni audios en servidores propios. Conecta tu cuenta de Google para guardar archivos uno por uno o por lotes directamente en tu carpeta personal de Google Drive."}
            </p>
          </div>

          {session ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={refreshFiles}
                disabled={loadingFiles}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? "animate-spin" : ""}`} />
                <span>{isEn ? "Refresh" : "Actualizar"}</span>
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isEn ? "Disconnect" : "Desconectar"}</span>
              </button>
            </div>
          ) : null}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        {session ? (
          <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-600/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-heading font-bold text-sm flex items-center justify-center shrink-0">
                {(session.user.name || "G").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "CONNECTED" : "CONECTADO"}</span>
                </div>
                <div className="text-sm font-bold text-foreground truncate">
                  {session.user.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground text-white flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">
                  {isEn ? "Destination Folder" : "Carpeta Destino"}
                </div>
                <div className="text-sm font-bold text-foreground truncate">
                  {session.folderName || GOOGLE_DRIVE_FOLDER_NAME}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {files.length} {isEn ? "files synced" : "archivos sincronizados"}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border flex flex-col justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                {unsavedAssets.length > 0
                  ? isEn
                    ? `${unsavedAssets.length} session items pending upload`
                    : `${unsavedAssets.length} archivos de esta sesión sin guardar en Drive`
                  : isEn
                  ? "All current session items are synced"
                  : "Todos los archivos de la sesión están sincronizados"}
              </div>
              <button
                type="button"
                disabled={unsavedAssets.length === 0 || isSyncingBatch}
                onClick={async () => {
                  await onSyncBatchToDrive(unsavedAssets);
                  await refreshFiles();
                }}
                className="w-full py-2 px-4 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 tactile-button cursor-pointer"
              >
                {isSyncingBatch ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CloudUpload className="w-3.5 h-3.5" />
                )}
                <span>
                  {isEn
                    ? `Upload Batch (${unsavedAssets.length})`
                    : `Guardar lote en Drive (${unsavedAssets.length})`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-4">
              {!envClientId && (
                <div className="space-y-2">
                  <label
                    htmlFor="google-oauth-client-id"
                    className="block text-[11px] font-mono font-bold uppercase text-muted-foreground"
                  >
                    Google OAuth 2.0 Client ID (Web Application)
                  </label>
                  <input
                    id="google-oauth-client-id"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="1234567890-abcdefg.apps.googleusercontent.com"
                    className="w-full h-10 px-3.5 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  />
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#faf9f5] border border-border text-[11px] font-mono text-muted-foreground">
                    <span className="truncate">
                      Redirect URI: <strong className="text-foreground">{redirectUri}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRedirect}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-foreground hover:border-primary cursor-pointer shrink-0"
                    >
                      {copiedUri ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUri ? "OK" : isEn ? "Copy" : "Copiar"}</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConnect}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#0c0e12] hover:bg-primary text-white text-sm font-semibold tactile-button transition-colors cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>
                  {isEn ? "Connect Google Account & Drive" : "Conectar cuenta de Google con Drive"}
                </span>
              </button>
            </div>

            <div className="lg:col-span-5 p-4 rounded-xl bg-[#faf9f5] border border-border space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-mono font-bold text-foreground text-[11px] uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{isEn ? "Minimal Scope Permission" : "Permiso Mínimo (drive.file)"}</span>
              </div>
              <p className="leading-relaxed">
                {isEn
                  ? "We only request `drive.file` access — ClearCut Studio can only create and manage files inside its own `ClearCut AI Studio` folder and can never read your other private Google Drive documents."
                  : "Solo solicitamos el permiso `drive.file`: ClearCut Studio únicamente puede crear y gestionar los archivos que tú guardes dentro de la carpeta `ClearCut AI Studio`, nunca leer otros documentos privados de tu Drive."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Saved Files in Drive */}
      {session && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-foreground">
              {isEn
                ? `Files in "${GOOGLE_DRIVE_FOLDER_NAME}"`
                : `Archivos en "${GOOGLE_DRIVE_FOLDER_NAME}"`}
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              {files.length} {isEn ? "items" : "elementos"}
            </span>
          </div>

          {loadingFiles ? (
            <div className="py-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>{isEn ? "Loading Google Drive folder..." : "Cargando carpeta de Google Drive..."}</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border rounded-xl bg-background/60">
              <p className="text-sm text-muted-foreground">
                {isEn
                  ? "No files saved in Google Drive yet. Generate images or videos and click 'Save to Drive'."
                  : "Aún no tienes archivos guardados en Google Drive. Genera imágenes o videos y pulsa 'Guardar en Drive'."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-card hover:bg-[#faf9f5] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {file.name}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                      <span>{file.mimeType}</span>
                      {file.size && <span>· {formatFileSize(Number(file.size))}</span>}
                      {file.createdTime && (
                        <span>· {new Date(file.createdTime).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-background hover:bg-primary hover:text-white border border-border text-xs font-semibold transition-colors shrink-0"
                    >
                      <span>{isEn ? "Open in Drive" : "Abrir en Drive"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface GoogleDriveConnectModalProps {
  open: boolean;
  onClose: () => void;
  lang?: string;
}

export function GoogleDriveConnectModal({
  open,
  onClose,
  lang = "es",
}: GoogleDriveConnectModalProps) {
  const isEn = lang === "en";
  const envClientId = getEnvGoogleClientId();
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setClientId(getStoredGoogleClientId());
      setRedirectUri(getGoogleRedirectUri());
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleConnect = () => {
    const activeId = envClientId || clientId.trim();
    if (!activeId) {
      setError(
        isEn
          ? "Enter your Google OAuth Client ID to connect."
          : "Ingresa tu Google OAuth Client ID para continuar."
      );
      return;
    }
    if (!envClientId) saveCustomGoogleClientId(activeId);
    startGoogleDriveOAuth(activeId, lang);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0c0e12]/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-medium space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
              GOOGLE DRIVE // {isEn ? "REQUIRED TO SAVE" : "REQUERIDO PARA GUARDAR"}
            </span>
            <h3 className="text-xl font-heading font-bold text-foreground mt-0.5">
              {isEn ? "Connect your Google Account" : "Conecta tu cuenta de Google"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? "Close" : "Cerrar"}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {isEn
            ? "To save your AI-generated photos, videos, or audio persistently in the cloud, connect your Google account linked to Google Drive. Files are stored in your personal `ClearCut AI Studio` folder."
            : "Para guardar tus fotos, videos o audios generados con IA en la nube, necesitas conectar tu cuenta de Google vinculada a Google Drive. Tus creaciones se guardarán en tu carpeta personal `ClearCut AI Studio`."}
        </p>

        {!envClientId && (
          <div className="space-y-2">
            <label
              htmlFor="modal-gdrive-client-id"
              className="block text-[11px] font-mono font-bold uppercase text-muted-foreground"
            >
              Google OAuth Client ID
            </label>
            <input
              id="modal-gdrive-client-id"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="1234567890-xyz.apps.googleusercontent.com"
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] font-mono text-muted-foreground truncate">
              Redirect URI: {redirectUri}
            </p>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
          >
            {isEn ? "Cancel" : "Cancelar"}
          </button>
          <button
            type="button"
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold tactile-button cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isEn ? "Continue with Google Drive" : "Conectar con Google Drive"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
