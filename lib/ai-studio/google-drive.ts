import type {
  GeneratedAsset,
  GoogleDriveFileItem,
  GoogleDriveSession,
  GoogleDriveUser,
} from "./types";
import { dataUrlToBlob, getExtensionForMime } from "./export-utils";

export const GOOGLE_DRIVE_SESSION_KEY = "clearcut_gdrive_session_v1";
export const GOOGLE_DRIVE_CLIENT_ID_KEY = "clearcut_gdrive_client_id_v1";
export const GOOGLE_DRIVE_OAUTH_STATE_KEY = "clearcut_gdrive_oauth_state_v1";
export const GOOGLE_DRIVE_RETURN_LANG_KEY = "clearcut_gdrive_return_lang_v1";
export const GOOGLE_DRIVE_FOLDER_NAME = "ClearCut AI Studio";

const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export function getEnvGoogleClientId(): string {
  return (process.env.GOOGLE_CLIENT_ID || "").trim();
}

export function getStoredGoogleClientId(): string {
  if (typeof window === "undefined") return getEnvGoogleClientId();
  const envId = getEnvGoogleClientId();
  if (envId) return envId;
  return (window.localStorage.getItem(GOOGLE_DRIVE_CLIENT_ID_KEY) || "").trim();
}

export function saveCustomGoogleClientId(clientId: string): void {
  if (typeof window === "undefined") return;
  const trimmed = clientId.trim();
  if (!trimmed) {
    window.localStorage.removeItem(GOOGLE_DRIVE_CLIENT_ID_KEY);
  } else {
    window.localStorage.setItem(GOOGLE_DRIVE_CLIENT_ID_KEY, trimmed);
  }
}

export function getGoogleRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/google-drive-callback`;
}

export function loadGoogleDriveSession(): GoogleDriveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(GOOGLE_DRIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleDriveSession;
    if (!parsed.accessToken || Date.now() >= parsed.expiresAt - 15_000) {
      window.sessionStorage.removeItem(GOOGLE_DRIVE_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveGoogleDriveSession(session: GoogleDriveSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    window.sessionStorage.removeItem(GOOGLE_DRIVE_SESSION_KEY);
    return;
  }
  window.sessionStorage.setItem(GOOGLE_DRIVE_SESSION_KEY, JSON.stringify(session));
}

export function startGoogleDriveOAuth(clientId: string, lang: string = "es"): void {
  if (typeof window === "undefined") return;
  const trimmed = clientId.trim();
  if (!trimmed) {
    throw new Error("Missing Google OAuth Client ID");
  }

  const stateBytes = new Uint8Array(16);
  crypto.getRandomValues(stateBytes);
  const state = Array.from(stateBytes, (b) => b.toString(16).padStart(2, "0")).join("");

  window.sessionStorage.setItem(GOOGLE_DRIVE_OAUTH_STATE_KEY, state);
  window.sessionStorage.setItem(GOOGLE_DRIVE_RETURN_LANG_KEY, lang);

  const params = new URLSearchParams({
    client_id: trimmed,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "token",
    scope: GOOGLE_OAUTH_SCOPES,
    include_granted_scopes: "true",
    prompt: "consent select_account",
    state,
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleDriveUser> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Google profile error (${res.status})`);
  }
  const data = (await res.json()) as {
    name?: string;
    email?: string;
    picture?: string;
  };
  return {
    name: data.name || data.email || "Google User",
    email: data.email || "",
    picture: data.picture,
  };
}

export async function ensureClearCutDriveFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent(
    `name='${GOOGLE_DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.ok) {
    const searchData = (await searchRes.json()) as { files?: Array<{ id: string; name: string }> };
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: GOOGLE_DRIVE_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => "");
    throw new Error(`Failed to create Drive folder (${createRes.status}): ${errText}`);
  }

  const created = (await createRes.json()) as { id: string };
  return created.id;
}

export async function uploadAssetToGoogleDrive(
  session: GoogleDriveSession,
  asset: GeneratedAsset
): Promise<{ fileId: string; webViewLink: string; folderId: string }> {
  const folderId = session.folderId || (await ensureClearCutDriveFolder(session.accessToken));
  const blob = await dataUrlToBlob(asset.dataUrl);
  const ext = getExtensionForMime(asset.mimeType || blob.type);
  const safeBase = asset.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]+/g, "_");
  const finalName = `${safeBase}.${ext}`;

  const metadata = {
    name: finalName,
    parents: [folderId],
    description: `Generated in ClearCut AI Studio · Model: ${asset.model} · Prompt: ${asset.prompt.slice(0, 300)}`,
  };

  const boundary = `clearcut_drive_${Date.now().toString(36)}`;
  const metadataPart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${blob.type || asset.mimeType || "application/octet-stream"}\r\n\r\n`;
  const closingPart = `\r\n--${boundary}--`;

  const multipartBody = new Blob([metadataPart, blob, closingPart], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => "");
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errText}`);
  }

  const uploaded = (await uploadRes.json()) as { id: string; webViewLink?: string };
  return {
    fileId: uploaded.id,
    webViewLink: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
    folderId,
  };
}

export async function listClearCutDriveFiles(
  session: GoogleDriveSession
): Promise<{ folderId: string; files: GoogleDriveFileItem[] }> {
  const folderId = session.folderId || (await ensureClearCutDriveFolder(session.accessToken));
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent(
    "files(id,name,mimeType,size,createdTime,webViewLink,thumbnailLink)"
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&pageSize=50&fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
  );
  if (!res.ok) {
    throw new Error(`Unable to list Drive files (${res.status})`);
  }
  const data = (await res.json()) as { files?: GoogleDriveFileItem[] };
  return {
    folderId,
    files: data.files || [],
  };
}

export async function disconnectGoogleDrive(accessToken?: string): Promise<void> {
  saveGoogleDriveSession(null);
  if (!accessToken) return;
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
      method: "POST",
      headers: { "Content-type": "application/x-www-form-urlencoded" },
    });
  } catch {
    // Best-effort token revoke
  }
}
