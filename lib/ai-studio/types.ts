export type AiProviderId =
  | "gemini"
  | "openai"
  | "xai"
  | "bfl"
  | "fal"
  | "stability"
  | "elevenlabs"
  | "custom";

export type AiMediaKind = "image" | "video" | "audio";

export type StudioSectionId =
  | "create-image"
  | "create-video"
  | "create-audio"
  | "resize-image"
  | "edit-image"
  | "edit-video"
  | "moodboard"
  | "library"
  | "google-drive"
  | "api-vault";

export type AspectRatioPreset =
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:5"
  | "3:2"
  | "2:3"
  | "4:3"
  | "3:4"
  | "21:9";

export type ResolutionTier = "0.5K" | "1K" | "2K" | "4K";

export type BatchCount = 1 | 2 | 4 | 6 | 8;

export interface AiModelSpec {
  id: string;
  name: string;
  provider: AiProviderId;
  family: string;
  kinds: AiMediaKind[];
  supportsEdit?: boolean;
  supportsReference?: boolean;
  supportsImageToVideo?: boolean;
  featureTags?: string[];
  badgeEs: string;
  badgeEn: string;
  descriptionEs: string;
  descriptionEn: string;
}

export interface ProviderMeta {
  id: AiProviderId;
  name: string;
  shortName: string;
  taglineEs: string;
  taglineEn: string;
  capabilities: Array<"image" | "edit" | "video" | "audio">;
  keyPlaceholder: string;
  docsUrl: string;
  accentHex: string;
  supportsCustomBaseUrl?: boolean;
}

export interface ApiKeyEntry {
  apiKey: string;
  baseUrl?: string;
  customModel?: string;
  verified?: boolean;
  verifiedAt?: number;
}

export type ApiKeyVault = Record<AiProviderId, ApiKeyEntry>;

export interface GeneratedAsset {
  id: string;
  kind: AiMediaKind;
  name: string;
  dataUrl: string;
  mimeType: string;
  prompt: string;
  negativePrompt?: string;
  provider: AiProviderId | "local";
  model: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  durationSec?: number;
  sizeBytes?: number;
  createdAt: number;
  batchId?: string;
  slotIndex?: number;
  latencyMs?: number;
  driveFileId?: string;
  driveWebViewLink?: string;
  tags?: string[];
}

export interface StreamingSlot {
  slotIndex: number;
  status: "queued" | "streaming" | "done" | "error";
  asset?: GeneratedAsset;
  error?: string;
  startedAt: number;
  finishedAt?: number;
}

export interface GoogleDriveUser {
  name: string;
  email: string;
  picture?: string;
}

export interface GoogleDriveSession {
  accessToken: string;
  expiresAt: number;
  user: GoogleDriveUser;
  folderId?: string;
  folderName: string;
}

export interface GoogleDriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export type ResizeFitMode = "contain" | "cover" | "stretch" | "pad";

export interface ResizeConfig {
  mode: "dimensions" | "percentage";
  width: number;
  height: number;
  percentage: number;
  lockAspect: boolean;
  fit: ResizeFitMode;
  backgroundColor: string;
  format: "png" | "webp" | "jpeg";
  quality: number;
}

export interface ImageEditAdjustments {
  brightness: number; // 0..200 (default 100)
  contrast: number; // 0..200 (default 100)
  saturation: number; // 0..200 (default 100)
  warmth: number; // -50..50 (default 0)
  blur: number; // 0..10 (default 0)
  vignette: number; // 0..100 (default 0)
  grayscale: number; // 0..100 (default 0)
  sepia: number; // 0..100 (default 0)
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  cropRatio: "original" | "1:1" | "4:5" | "16:9" | "9:16" | "3:2";
}

export interface VideoEditConfig {
  trimStart: number;
  trimEnd: number;
  playbackRate: number;
  brightness: number;
  contrast: number;
  saturation: number;
  preset: "none" | "cinema" | "noir" | "warm" | "vivid";
  overlayText: string;
  overlayPosition: "top-left" | "bottom-left" | "bottom-center" | "bottom-right";
  muted: boolean;
}
