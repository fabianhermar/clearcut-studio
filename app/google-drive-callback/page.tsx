"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  ensureClearCutDriveFolder,
  fetchGoogleUserProfile,
  GOOGLE_DRIVE_FOLDER_NAME,
  GOOGLE_DRIVE_OAUTH_STATE_KEY,
  GOOGLE_DRIVE_RETURN_LANG_KEY,
  saveGoogleDriveSession,
} from "@/lib/ai-studio/google-drive";

export default function GoogleDriveCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Conectando con Google Drive...");

  useEffect(() => {
    const run = async () => {
      const returnLang =
        window.sessionStorage.getItem(GOOGLE_DRIVE_RETURN_LANG_KEY) || "es";
      try {
        const hash = window.location.hash.replace(/^#/, "");
        const params = new URLSearchParams(hash);
        const error = params.get("error");
        if (error) {
          throw new Error(`Google OAuth: ${error}`);
        }

        const accessToken = params.get("access_token");
        const expiresIn = Number(params.get("expires_in") || "3600");
        const state = params.get("state");
        const expectedState = window.sessionStorage.getItem(GOOGLE_DRIVE_OAUTH_STATE_KEY);

        if (!accessToken) {
          throw new Error("No se recibió token de acceso desde Google.");
        }
        if (expectedState && state !== expectedState) {
          throw new Error("Estado de seguridad OAuth inválido. Intenta nuevamente.");
        }

        const user = await fetchGoogleUserProfile(accessToken);
        const folderId = await ensureClearCutDriveFolder(accessToken);

        saveGoogleDriveSession({
          accessToken,
          expiresAt: Date.now() + expiresIn * 1000,
          user,
          folderId,
          folderName: GOOGLE_DRIVE_FOLDER_NAME,
        });

        window.sessionStorage.removeItem(GOOGLE_DRIVE_OAUTH_STATE_KEY);
        setStatus("success");
        setMessage(`Conectado como ${user.email}. Redirigiendo a ClearCut Studio...`);

        setTimeout(() => {
          window.location.replace(`/${returnLang}?tool=ai-image-streamer&drive=connected`);
        }, 700);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Error conectando con Google Drive.");
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#0c0e12] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-[#dcdad0] rounded-2xl p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-[#0c0e12] text-white flex items-center justify-center">
          {status === "loading" && <Loader2 className="w-6 h-6 animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          {status === "error" && <AlertTriangle className="w-6 h-6 text-[#ff4d00]" />}
        </div>
        <h1 className="font-heading font-bold text-xl">ClearCut Studio · Google Drive</h1>
        <p className="text-sm text-[#4e525e] font-accent">{message}</p>
        {status === "error" && (
          <a
            href="/es?tool=ai-image-streamer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#0c0e12] text-white text-sm font-semibold hover:bg-[#1e40ff] transition-colors"
          >
            Volver al Generador IA Streaming
          </a>
        )}
      </div>
    </div>
  );
}
