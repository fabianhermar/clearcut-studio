"use client";

import { useState, useEffect } from "react";
import {
  CloudUpload,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Loader2,
  X,
  HardDrive,
} from "lucide-react";
import {
  disconnectGoogleDrive,
  GOOGLE_DRIVE_FOLDER_NAME,
  listClearCutDriveFiles,
  startGoogleDriveOAuth,
} from "@/lib/ai-studio/google-drive";
import { formatFileSize } from "@/lib/ai-studio/export-utils";
import type {
  GeneratedAsset,
  GoogleDriveFileItem,
  GoogleDriveSession,
} from "@/lib/ai-studio/types";

function GoogleLogoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

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
  const [files, setFiles] = useState<GoogleDriveFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    startGoogleDriveOAuth(lang);
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive(session?.accessToken);
    onSessionChange(null);
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
                ? "Sign in with your Google account in one click to save individual images, videos, or full batches directly into your personal Google Drive folder."
                : "Inicia sesión con tu cuenta de Google en un solo clic para guardar tus imágenes, videos o lotes completos directamente en tu carpeta personal de Google Drive."}
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
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-600/25 text-xs text-amber-950 font-medium">
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
          <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-4">
              {/* Official-style 1-Click Sign in with Google Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleConnect}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white hover:bg-[#faf9f5] text-[#0c0e12] border border-[#c9c6ba] hover:border-primary/60 text-sm font-semibold shadow-soft transition-all cursor-pointer"
                >
                  <GoogleLogoIcon className="w-5 h-5 shrink-0" />
                  <span>
                    {isEn ? "Continue with Google" : "Continuar con Google"}
                  </span>
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                {isEn
                  ? "Choose your Google account, grant access to the ClearCut AI Studio folder, and start saving images, videos, and audio automatically."
                  : "Elige tu cuenta de Google, autoriza la carpeta ClearCut AI Studio y guarda tus imágenes, videos y audios en segundos."}
              </p>
            </div>

            <div className="lg:col-span-5 p-4 rounded-xl bg-[#faf9f5] border border-border space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-mono font-bold text-foreground text-[11px] uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{isEn ? "Private & Minimal Access" : "Acceso Privado y Seguro (drive.file)"}</span>
              </div>
              <p className="leading-relaxed">
                {isEn
                  ? "We only request `drive.file` access — ClearCut Studio can only save into its own `ClearCut AI Studio` folder and can never read your other private Google Drive files."
                  : "Solo solicitamos el permiso `drive.file`: ClearCut Studio únicamente guarda dentro de su propia carpeta `ClearCut AI Studio` y nunca puede leer otros documentos privados de tu Drive."}
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

  if (!open) return null;

  const handleConnect = () => {
    startGoogleDriveOAuth(lang);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0c0e12]/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-medium space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
              GOOGLE DRIVE // {isEn ? "SIGN IN TO SAVE" : "INICIA SESIÓN PARA GUARDAR"}
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
            ? "Sign in with Google to save your AI-generated photos, videos, and audio directly into your personal `ClearCut AI Studio` Drive folder."
            : "Inicia sesión con tu cuenta de Google para guardar tus fotos, videos y audios generados con IA directamente en tu carpeta personal `ClearCut AI Studio` de Google Drive."}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-semibold cursor-pointer"
          >
            {isEn ? "Cancel" : "Cancelar"}
          </button>
          <button
            type="button"
            onClick={handleConnect}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full bg-white hover:bg-[#faf9f5] text-[#0c0e12] border border-[#c9c6ba] hover:border-primary/60 text-xs font-bold shadow-soft transition-all cursor-pointer"
          >
            <GoogleLogoIcon className="w-4 h-4 shrink-0" />
            <span>{isEn ? "Continue with Google" : "Continuar con Google"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
