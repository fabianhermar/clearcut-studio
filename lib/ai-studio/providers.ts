import type {
  AiMediaKind,
  AiModelSpec,
  AiProviderId,
  ApiKeyVault,
  AspectRatioPreset,
  BatchCount,
  ProviderMeta,
  ResolutionTier,
} from "./types";

export const API_VAULT_STORAGE_KEY = "clearcut_ai_studio_vault_v1";

export const BATCH_COUNTS: BatchCount[] = [1, 2, 4, 6, 8];

export const RESOLUTION_TIERS: Array<{
  id: ResolutionTier;
  label: string;
  pxHint: string;
}> = [
  { id: "0.5K", label: "0.5K", pxHint: "512px" },
  { id: "1K", label: "1K", pxHint: "1024px" },
  { id: "2K", label: "2K", pxHint: "2048px" },
  { id: "4K", label: "4K", pxHint: "4096px" },
];

export const ASPECT_RATIO_OPTIONS: Array<{
  id: AspectRatioPreset;
  labelEs: string;
  labelEn: string;
  w: number;
  h: number;
  openAiSize: "1024x1024" | "1536x1024" | "1024x1536";
}> = [
  { id: "1:1", labelEs: "Cuadrado", labelEn: "Square", w: 1024, h: 1024, openAiSize: "1024x1024" },
  { id: "16:9", labelEs: "Panorámico", labelEn: "Widescreen", w: 1344, h: 768, openAiSize: "1536x1024" },
  { id: "9:16", labelEs: "Vertical Reels", labelEn: "Vertical Reels", w: 768, h: 1344, openAiSize: "1024x1536" },
  { id: "4:5", labelEs: "Retrato Social", labelEn: "Social Portrait", w: 896, h: 1120, openAiSize: "1024x1536" },
  { id: "3:2", labelEs: "Editorial 35mm", labelEn: "Editorial 35mm", w: 1248, h: 832, openAiSize: "1536x1024" },
  { id: "2:3", labelEs: "Póster", labelEn: "Poster", w: 832, h: 1248, openAiSize: "1024x1536" },
  { id: "4:3", labelEs: "Clásico 4:3", labelEn: "Classic 4:3", w: 1152, h: 896, openAiSize: "1536x1024" },
  { id: "3:4", labelEs: "Revista 3:4", labelEn: "Magazine 3:4", w: 896, h: 1152, openAiSize: "1024x1536" },
  { id: "21:9", labelEs: "Cinemascope", labelEn: "Ultrawide", w: 1536, h: 640, openAiSize: "1536x1024" },
];

export interface StylePreset {
  id: string;
  labelEs: string;
  labelEn: string;
  promptSuffix: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: "none", labelEs: "Sin filtro", labelEn: "Raw / Natural", promptSuffix: "" },
  {
    id: "optical-studio",
    labelEs: "Fotografía Estudio",
    labelEn: "Optical Studio",
    promptSuffix:
      "shot on medium format camera, calibrated studio lighting, sharp micro-contrast, crisp depth of field, photorealistic editorial photography",
  },
  {
    id: "cinematic",
    labelEs: "Cinematográfico",
    labelEn: "Cinematic Film",
    promptSuffix:
      "anamorphic 35mm film still, atmospheric volumetric light, subtle film grain, rich color grading, cinema composition",
  },
  {
    id: "product-3d",
    labelEs: "Producto 3D",
    labelEn: "3D Product",
    promptSuffix:
      "ultra-clean industrial design render, tactile anodized materials, soft global illumination, minimalist pedestal, octane studio render",
  },
  {
    id: "editorial-swiss",
    labelEs: "Editorial Suizo",
    labelEn: "Swiss Editorial",
    promptSuffix:
      "minimalist Swiss architectural aesthetic, clean geometry, warm daylight, tactile paper tones, balanced negative space",
  },
  {
    id: "illustration",
    labelEs: "Ilustración / Arte",
    labelEn: "Fine Illustration",
    promptSuffix:
      "expressive contemporary editorial illustration, cohesive palette, refined brushwork, crisp linework, art print quality",
  },
  {
    id: "anime",
    labelEs: "Anime / Estilizado",
    labelEn: "Anime / Stylized",
    promptSuffix:
      "high-detail modern anime key visual, dramatic rim lighting, vibrant cel shading, expressive framing",
  },
];

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    shortName: "Gemini",
    taglineEs: "Imagen 4, Nano Banana, Veo Video y Audio TTS",
    taglineEn: "Imagen 4, Nano Banana, Veo Video & TTS Audio",
    capabilities: ["image", "edit", "video", "audio"],
    keyPlaceholder: "AIzaSy...",
    docsUrl: "https://aistudio.google.com/apikey",
    accentHex: "#1e40ff",
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    shortName: "OpenAI",
    taglineEs: "GPT Image 1.5, Edición con máscara, Sora Video y TTS",
    taglineEn: "GPT Image 1.5, Masked Edits, Sora Video & TTS",
    capabilities: ["image", "edit", "video", "audio"],
    keyPlaceholder: "sk-proj-...",
    docsUrl: "https://platform.openai.com/api-keys",
    accentHex: "#0f766e",
  },
  {
    id: "xai",
    name: "xAI Grok",
    shortName: "Grok",
    taglineEs: "Grok Imagine para imágenes y video rápido",
    taglineEn: "Grok Imagine for fast images & video",
    capabilities: ["image", "video"],
    keyPlaceholder: "xai-...",
    docsUrl: "https://console.x.ai/",
    accentHex: "#0c0e12",
  },
  {
    id: "bfl",
    name: "Black Forest Labs (Flux)",
    shortName: "Flux BFL",
    taglineEs: "FLUX 1.1 Pro Ultra y FLUX Kontext para edición",
    taglineEn: "FLUX 1.1 Pro Ultra & FLUX Kontext editing",
    capabilities: ["image", "edit"],
    keyPlaceholder: "bfl_...",
    docsUrl: "https://dashboard.bfl.ai/",
    accentHex: "#ff4d00",
  },
  {
    id: "fal",
    name: "Fal.ai Gateway",
    shortName: "Fal.ai",
    taglineEs: "Flux, Seedream, Ideogram, Kling, Luma y Stable Audio",
    taglineEn: "Flux, Seedream, Ideogram, Kling, Luma & Stable Audio",
    capabilities: ["image", "edit", "video", "audio"],
    keyPlaceholder: "fal_key_...",
    docsUrl: "https://fal.ai/dashboard/keys",
    accentHex: "#6d28d9",
  },
  {
    id: "stability",
    name: "Stability AI",
    shortName: "Stability",
    taglineEs: "Stable Diffusion 3.5 Large y Stable Image Ultra",
    taglineEn: "Stable Diffusion 3.5 Large & Stable Image Ultra",
    capabilities: ["image"],
    keyPlaceholder: "sk-...",
    docsUrl: "https://platform.stability.ai/account/keys",
    accentHex: "#b45309",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    shortName: "ElevenLabs",
    taglineEs: "Voces neuronales multilingües y efectos de sonido (SFX)",
    taglineEn: "Multilingual neural voices & Sound Effects (SFX)",
    capabilities: ["audio"],
    keyPlaceholder: "sk_...",
    docsUrl: "https://elevenlabs.io/app/settings/api-keys",
    accentHex: "#0284c7",
  },
  {
    id: "custom",
    name: "API Personalizada (OpenAI-Compatible)",
    shortName: "Custom API",
    taglineEs: "Conecta Together, Fireworks, OpenRouter o tu propio endpoint",
    taglineEn: "Connect Together, Fireworks, OpenRouter, or your own endpoint",
    capabilities: ["image", "video", "audio"],
    keyPlaceholder: "sk-... / token",
    docsUrl: "https://openrouter.ai/keys",
    accentHex: "#4e525e",
    supportsCustomBaseUrl: true,
  },
];

export const AI_MODELS: AiModelSpec[] = [
  // =========================================================================
  // IMAGES — GROUPED BY PROVIDER / MODEL FAMILY
  // =========================================================================

  // --- GOOGLE GEMINI · NANO BANANA & IMAGEN ---
  {
    id: "gemini-2.5-flash-image",
    name: "Nano Banana 2 (Gemini 2.5 Flash Image)",
    provider: "gemini",
    family: "Google · Nano Banana & Imagen",
    kinds: ["image"],
    supportsEdit: true,
    supportsReference: true,
    featureTags: ["Edit", "Ref"],
    badgeEs: "Rápido + Edición",
    badgeEn: "Fast + Edit",
    descriptionEs: "Calidad Pro a velocidad Flash con edición conversacional y soporte de referencias.",
    descriptionEn: "Pro quality at Flash speed with conversational editing and reference images.",
  },
  {
    id: "gemini-3-pro-image-preview",
    name: "Nano Banana Pro (Gemini 3 Pro Image)",
    provider: "gemini",
    family: "Google · Nano Banana & Imagen",
    kinds: ["image"],
    supportsEdit: true,
    supportsReference: true,
    featureTags: ["Flagship", "Edit", "Ref"],
    badgeEs: "Insignia",
    badgeEn: "Flagship",
    descriptionEs: "Modelo insignia de Google para detalle editorial, tipografía nítida y edición compleja.",
    descriptionEn: "Google's flagship model for editorial detail, crisp typography, and complex edits.",
  },
  {
    id: "imagen-4.0-generate-001",
    name: "Google Imagen 4",
    provider: "gemini",
    family: "Google · Nano Banana & Imagen",
    kinds: ["image"],
    featureTags: ["4K", "Photo"],
    badgeEs: "Fotorrealismo",
    badgeEn: "Photorealism",
    descriptionEs: "Motor Imagen 4 optimizado para fotografía comercial y lotes de alta fidelidad.",
    descriptionEn: "Imagen 4 engine optimized for commercial photography and high-fidelity batches.",
  },
  {
    id: "imagen-3.0-generate-002",
    name: "Google Imagen 3",
    provider: "gemini",
    family: "Google · Nano Banana & Imagen",
    kinds: ["image"],
    badgeEs: "Estable",
    badgeEn: "Stable",
    descriptionEs: "Generación confiable con gran adherencia al prompt y color balanceado.",
    descriptionEn: "Reliable generation with strong prompt adherence and balanced color.",
  },

  // --- OPENAI · GPT IMAGE ---
  {
    id: "gpt-image-1.5",
    name: "GPT Image 1.5",
    provider: "openai",
    family: "OpenAI · GPT Image",
    kinds: ["image"],
    supportsEdit: true,
    supportsReference: true,
    featureTags: ["Edit", "Ref", "Text"],
    badgeEs: "Alta fidelidad",
    badgeEn: "High Fidelity",
    descriptionEs: "Fidelidad visual superior, texto nítido y consistencia exacta de sujetos al editar.",
    descriptionEn: "Superior visual fidelity, crisp text, and exact subject consistency when editing.",
  },
  {
    id: "gpt-image-1",
    name: "GPT Image 1",
    provider: "openai",
    family: "OpenAI · GPT Image",
    kinds: ["image"],
    supportsEdit: true,
    supportsReference: true,
    featureTags: ["Edit", "Ref"],
    badgeEs: "Texto preciso",
    badgeEn: "Crisp Text",
    descriptionEs: "Excelente renderizado tipográfico, diseño gráfico y edición con máscara.",
    descriptionEn: "Excellent typography rendering, graphic design, and masked editing.",
  },
  {
    id: "dall-e-3",
    name: "DALL·E 3",
    provider: "openai",
    family: "OpenAI · GPT Image",
    kinds: ["image"],
    badgeEs: "Clásico",
    badgeEn: "Classic",
    descriptionEs: "Modelo creativo clásico de OpenAI con estilos vivos y composiciones expresivas.",
    descriptionEn: "Classic OpenAI creative model with vivid styles and expressive framing.",
  },

  // --- xAI · GROK ---
  {
    id: "grok-imagine-image",
    name: "Grok Imagine Image",
    provider: "xai",
    family: "xAI · Grok",
    kinds: ["image"],
    featureTags: ["Cinema"],
    badgeEs: "Creativo",
    badgeEn: "Creative",
    descriptionEs: "Generación visual de última generación de xAI con estética cinematográfica.",
    descriptionEn: "xAI's latest visual generation with cinematic aesthetic.",
  },
  {
    id: "grok-2-image-1212",
    name: "Grok 2 Image",
    provider: "xai",
    family: "xAI · Grok",
    kinds: ["image"],
    badgeEs: "Rápido",
    badgeEn: "Fast",
    descriptionEs: "Imágenes expresivas de alta velocidad desde la API oficial de xAI.",
    descriptionEn: "High-speed expressive imagery from the official xAI API.",
  },

  // --- BLACK FOREST LABS · FLUX ---
  {
    id: "flux-pro-1.1-ultra",
    name: "FLUX 1.1 [pro] Ultra",
    provider: "bfl",
    family: "Black Forest Labs · FLUX",
    kinds: ["image"],
    featureTags: ["4MP"],
    badgeEs: "Ultra 4MP",
    badgeEn: "Ultra 4MP",
    descriptionEs: "Resolución ultra alta y fotorrealismo puro directo de Black Forest Labs.",
    descriptionEn: "Ultra-high resolution and raw photorealism direct from Black Forest Labs.",
  },
  {
    id: "flux-pro-1.1",
    name: "FLUX 1.1 [pro]",
    provider: "bfl",
    family: "Black Forest Labs · FLUX",
    kinds: ["image"],
    badgeEs: "Pro",
    badgeEn: "Pro",
    descriptionEs: "Equilibrio óptimo entre velocidad, precisión de prompt y calidad comercial.",
    descriptionEn: "Optimal balance of speed, prompt accuracy, and commercial quality.",
  },
  {
    id: "flux-dev",
    name: "FLUX.1 [dev]",
    provider: "bfl",
    family: "Black Forest Labs · FLUX",
    kinds: ["image"],
    badgeEs: "Detalle",
    badgeEn: "Rich Detail",
    descriptionEs: "Modelo abierto de gran detalle ideal para exploración artística y conceptual.",
    descriptionEn: "Open-weight model with rich detail ideal for concept exploration.",
  },
  {
    id: "flux-kontext-pro",
    name: "FLUX Kontext [pro]",
    provider: "bfl",
    family: "Black Forest Labs · FLUX",
    kinds: ["image"],
    supportsEdit: true,
    supportsReference: true,
    featureTags: ["Edit", "Ref"],
    badgeEs: "Edición IA",
    badgeEn: "AI Edit",
    descriptionEs: "Especializado en editar imágenes existentes conservando identidad y estilo.",
    descriptionEn: "Specialized in editing existing images while preserving identity and style.",
  },

  // --- BYTEDANCE · SEEDREAM (VIA FAL.AI) ---
  {
    id: "fal-ai/bytedance/seedream/v3/text-to-image",
    name: "Seedream 4 / Pro (Fal.ai)",
    provider: "fal",
    family: "ByteDance · Seedream",
    kinds: ["image"],
    featureTags: ["4K", "Design"],
    badgeEs: "Seedream",
    badgeEn: "Seedream",
    descriptionEs: "Generación fotorrealista y diseño editorial de altísima coherencia de ByteDance.",
    descriptionEn: "High-fidelity photorealism and editorial design coherence by ByteDance.",
  },
  {
    id: "fal-ai/bytedance/seedream/v3/edit",
    name: "Seedream Edit (Fal.ai)",
    provider: "fal",
    family: "ByteDance · Seedream",
    kinds: ["image"],
    supportsEdit: true,
    supportsReference: true,
    featureTags: ["Edit", "Ref"],
    badgeEs: "Edición",
    badgeEn: "Edit",
    descriptionEs: "Edición de precisión guiada por texto manteniendo composición e iluminación.",
    descriptionEn: "Precision text-guided editing preserving composition and lighting.",
  },

  // --- FAL.AI · FLUX & IDEOGRAM ---
  {
    id: "fal-ai/flux/schnell",
    name: "FLUX.1 [schnell] (Fal.ai)",
    provider: "fal",
    family: "Fal.ai · FLUX & Ideogram",
    kinds: ["image"],
    featureTags: ["Fast"],
    badgeEs: "Sub-segundo",
    badgeEn: "Sub-second",
    descriptionEs: "Ideal para lotes grandes de 6 u 8 imágenes en pocos segundos.",
    descriptionEn: "Ideal for large batches of 6 or 8 images in seconds.",
  },
  {
    id: "fal-ai/flux-pro/v1.1-ultra",
    name: "FLUX 1.1 Pro Ultra (Fal.ai)",
    provider: "fal",
    family: "Fal.ai · FLUX & Ideogram",
    kinds: ["image"],
    featureTags: ["4MP"],
    badgeEs: "Ultra",
    badgeEn: "Ultra",
    descriptionEs: "Calidad editorial 4MP vía infraestructura de baja latencia de Fal.ai.",
    descriptionEn: "Editorial 4MP quality via Fal.ai low-latency infrastructure.",
  },
  {
    id: "fal-ai/flux-pro/kontext",
    name: "FLUX Kontext Edit (Fal.ai)",
    provider: "fal",
    family: "Fal.ai · FLUX & Ideogram",
    kinds: ["image"],
    supportsEdit: true,
    supportsReference: true,
    featureTags: ["Edit", "Ref"],
    badgeEs: "Edición IA",
    badgeEn: "AI Edit",
    descriptionEs: "Edición guiada por instrucciones con preservación precisa del sujeto.",
    descriptionEn: "Instruction-guided editing with accurate subject preservation.",
  },
  {
    id: "fal-ai/ideogram/v3",
    name: "Ideogram v3 (Fal.ai)",
    provider: "fal",
    family: "Fal.ai · FLUX & Ideogram",
    kinds: ["image"],
    featureTags: ["Text"],
    badgeEs: "Tipografía",
    badgeEn: "Typography",
    descriptionEs: "Especialista en pósters, logotipos y texto integrado dentro de la imagen.",
    descriptionEn: "Specialist in posters, logos, and crisp typography inside images.",
  },

  // --- STABILITY AI ---
  {
    id: "ultra",
    name: "Stable Image Ultra",
    provider: "stability",
    family: "Stability AI",
    kinds: ["image"],
    badgeEs: "Ultra",
    badgeEn: "Ultra",
    descriptionEs: "Iluminación, textura y tipografía de máxima calidad de Stability AI.",
    descriptionEn: "Highest quality lighting, texture, and typography from Stability AI.",
  },
  {
    id: "sd3.5-large",
    name: "Stable Diffusion 3.5 Large",
    provider: "stability",
    family: "Stability AI",
    kinds: ["image"],
    badgeEs: "SD 3.5",
    badgeEn: "SD 3.5",
    descriptionEs: "Versátil en fotografía, ilustración artística y arte conceptual.",
    descriptionEn: "Versatile across photography, fine illustration, and concept art.",
  },

  // --- MIDJOURNEY & CUSTOM API ---
  {
    id: "midjourney-v7",
    name: "Midjourney v7 (vía API Compatible)",
    provider: "custom",
    family: "Midjourney · Custom API",
    kinds: ["image"],
    featureTags: ["Artistic"],
    badgeEs: "Artístico",
    badgeEn: "Artistic",
    descriptionEs: "Estética artística icónica conectando tu endpoint/proxy compatible en la Bóveda.",
    descriptionEn: "Signature artistic aesthetic via your compatible API endpoint in the Vault.",
  },
  {
    id: "midjourney-v7-niji",
    name: "Midjourney v7 Niji Anime (vía API)",
    provider: "custom",
    family: "Midjourney · Custom API",
    kinds: ["image"],
    featureTags: ["Anime"],
    badgeEs: "Anime",
    badgeEn: "Anime",
    descriptionEs: "Estilos de ilustración y anime de alto detalle vía tu API compatible.",
    descriptionEn: "High-detail anime and illustration styles via your compatible API.",
  },
  {
    id: "custom-model",
    name: "Modelo Personalizado (OpenAI-Compatible)",
    provider: "custom",
    family: "Midjourney · Custom API",
    kinds: ["image"],
    supportsEdit: true,
    badgeEs: "Custom",
    badgeEn: "Custom",
    descriptionEs: "Usa tu Base URL y Model ID configurados en la Bóveda (Together, OpenRouter, etc.).",
    descriptionEn: "Uses the Base URL and Model ID configured in your Vault (Together, OpenRouter, etc.).",
  },

  // =========================================================================
  // VIDEO — GROUPED BY PROVIDER / MODEL FAMILY
  // =========================================================================

  // --- GOOGLE · VEO ---
  {
    id: "veo-3.0-generate-preview",
    name: "Google Veo 3",
    provider: "gemini",
    family: "Google · Veo",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Audio", "Start/End", "Ref"],
    badgeEs: "Audio Nativo",
    badgeEn: "Native Audio",
    descriptionEs: "Última generación de video de Google con física realista y audio sincronizado.",
    descriptionEn: "Google's latest video generation with realistic physics and synced audio.",
  },
  {
    id: "veo-2.0-generate-001",
    name: "Google Veo 2",
    provider: "gemini",
    family: "Google · Veo",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Start/End", "Ref"],
    badgeEs: "Video Cine",
    badgeEn: "Cinema Video",
    descriptionEs: "Video cinematográfico 16:9 / 9:16 desde texto o fotograma clave inicial.",
    descriptionEn: "Cinematic 16:9 / 9:16 video from text or a starting keyframe.",
  },

  // --- OPENAI · SORA ---
  {
    id: "sora-2",
    name: "OpenAI Sora 2",
    provider: "openai",
    family: "OpenAI · Sora",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Start/End"],
    badgeEs: "Fotorrealista",
    badgeEn: "Photorealistic",
    descriptionEs: "Generación de video fotorrealista vía la API oficial de videos de OpenAI.",
    descriptionEn: "Photorealistic video generation via the official OpenAI Videos API.",
  },

  // --- xAI · GROK VIDEO ---
  {
    id: "grok-imagine-video",
    name: "Grok Imagine Video",
    provider: "xai",
    family: "xAI · Grok Video",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Ref"],
    badgeEs: "Rápido",
    badgeEn: "Fast",
    descriptionEs: "Clips dinámicos y versátiles desde texto o imagen por xAI.",
    descriptionEn: "Dynamic, versatile clips from text or image by xAI.",
  },

  // --- BYTEDANCE · SEEDANCE (VIA FAL.AI) ---
  {
    id: "fal-ai/bytedance/seedance/v1/pro/text-to-video",
    name: "Seedance Pro (Fal.ai)",
    provider: "fal",
    family: "ByteDance · Seedance",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Start/End", "Ref"],
    badgeEs: "Seedance",
    badgeEn: "Seedance",
    descriptionEs: "Video de alta coherencia temporal con soporte de referencias y keyframes.",
    descriptionEn: "High temporal coherence video with reference and keyframe support.",
  },
  {
    id: "fal-ai/bytedance/seedance/v1/lite/text-to-video",
    name: "Seedance Fast / Lite (Fal.ai)",
    provider: "fal",
    family: "ByteDance · Seedance",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Fast"],
    badgeEs: "Ligero",
    badgeEn: "Fast",
    descriptionEs: "Borradores de video rápidos y económicos de ByteDance.",
    descriptionEn: "Fast, low-cost video drafts from ByteDance.",
  },

  // --- KLING VIDEO (VIA FAL.AI) ---
  {
    id: "fal-ai/kling-video/v2.1/master/text-to-video",
    name: "Kling 2.1 Master (Fal.ai)",
    provider: "fal",
    family: "Kling · Motion Pro",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Start/End"],
    badgeEs: "Kling Master",
    badgeEn: "Kling Master",
    descriptionEs: "Movimiento fluido, control refinado de cámara e iluminación cinematográfica.",
    descriptionEn: "Fluid motion, refined camera control, and cinematic lighting.",
  },
  {
    id: "fal-ai/kling-video/v1.6/pro/text-to-video",
    name: "Kling 1.6 Pro (Fal.ai)",
    provider: "fal",
    family: "Kling · Motion Pro",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Start/End", "Ref"],
    badgeEs: "Coherente",
    badgeEn: "Coherent",
    descriptionEs: "Movimiento suave y consistente para planos de producto y personajes.",
    descriptionEn: "Smooth, coherent motion for product shots and characters.",
  },

  // --- LUMA · MINIMAX · VIDU · WAN (VIA FAL.AI) ---
  {
    id: "fal-ai/minimax/video-01-live",
    name: "MiniMax Hailuo Video (Fal.ai)",
    provider: "fal",
    family: "MiniMax · Luma · Vidu · Wan",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Start/End"],
    badgeEs: "MiniMax",
    badgeEn: "MiniMax",
    descriptionEs: "Animación expresiva y cinematográfica con gran respuesta a referencias.",
    descriptionEn: "Expressive cinematic animation with strong reference fidelity.",
  },
  {
    id: "fal-ai/luma-dream-machine",
    name: "Luma Dream Machine (Fal.ai)",
    provider: "fal",
    family: "MiniMax · Luma · Vidu · Wan",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Start/End"],
    badgeEs: "Luma",
    badgeEn: "Luma",
    descriptionEs: "Transiciones orgánicas de texto o fotograma clave a video.",
    descriptionEn: "Organic text or keyframe-to-video transitions.",
  },
  {
    id: "fal-ai/vidu/q1/text-to-video",
    name: "Vidu Q1 (Fal.ai)",
    provider: "fal",
    family: "MiniMax · Luma · Vidu · Wan",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Ref"],
    badgeEs: "Vidu",
    badgeEn: "Vidu",
    descriptionEs: "Generación guiada por referencias visuales y alto dinamismo.",
    descriptionEn: "Reference-driven video generation with high dynamism.",
  },
  {
    id: "fal-ai/wan/v2.1/text-to-video",
    name: "Wan 2.1 Video (Fal.ai)",
    provider: "fal",
    family: "MiniMax · Luma · Vidu · Wan",
    kinds: ["video"],
    supportsImageToVideo: true,
    featureTags: ["Open"],
    badgeEs: "Wan",
    badgeEn: "Wan",
    descriptionEs: "Modelo abierto de gran calidad visual para escenas creativas.",
    descriptionEn: "High-quality open video model for creative scenes.",
  },

  // --- CUSTOM VIDEO ---
  {
    id: "custom-video",
    name: "Video Personalizado (Endpoint Custom)",
    provider: "custom",
    family: "API Personalizada",
    kinds: ["video"],
    supportsImageToVideo: true,
    badgeEs: "Custom",
    badgeEn: "Custom",
    descriptionEs: "Conecta tu propio endpoint de video compatible en la Bóveda de API Keys.",
    descriptionEn: "Connect your own compatible video endpoint in the API Keys Vault.",
  },

  // =========================================================================
  // AUDIO — GROUPED BY PROVIDER / MODEL FAMILY
  // =========================================================================

  // --- GOOGLE · GEMINI TTS ---
  {
    id: "gemini-2.5-flash-preview-tts",
    name: "Gemini 2.5 Flash TTS",
    provider: "gemini",
    family: "Google · Gemini Audio",
    kinds: ["audio"],
    featureTags: ["Voice"],
    badgeEs: "Voz IA",
    badgeEn: "AI Voice",
    descriptionEs: "Síntesis de voz expresiva multilingüe impulsada por Google Gemini.",
    descriptionEn: "Expressive multilingual speech synthesis powered by Google Gemini.",
  },

  // --- OPENAI · AUDIO & TTS ---
  {
    id: "gpt-4o-mini-tts",
    name: "OpenAI GPT-4o Mini TTS",
    provider: "openai",
    family: "OpenAI · Audio & Voz",
    kinds: ["audio"],
    featureTags: ["Voice"],
    badgeEs: "Voz Natural",
    badgeEn: "Natural Voice",
    descriptionEs: "Locución natural y rápida con control de entonación y múltiples voces.",
    descriptionEn: "Fast natural narration with tone control and multiple voices.",
  },
  {
    id: "tts-1-hd",
    name: "OpenAI TTS-1 HD",
    provider: "openai",
    family: "OpenAI · Audio & Voz",
    kinds: ["audio"],
    featureTags: ["HD Voice"],
    badgeEs: "Alta Definición",
    badgeEn: "HD Audio",
    descriptionEs: "Síntesis de voz en alta definición lista para video y podcast.",
    descriptionEn: "High-definition speech synthesis ready for video and podcasts.",
  },

  // --- ELEVENLABS ---
  {
    id: "eleven_multilingual_v2",
    name: "ElevenLabs Multilingual v2",
    provider: "elevenlabs",
    family: "ElevenLabs · Voz & SFX",
    kinds: ["audio"],
    featureTags: ["Voice", "28+ Langs"],
    badgeEs: "Voz Pro",
    badgeEn: "Pro Voice",
    descriptionEs: "Locución ultra realista en español, inglés y más de 28 idiomas.",
    descriptionEn: "Ultra-realistic narration in Spanish, English, and 28+ languages.",
  },
  {
    id: "eleven_sound_effects",
    name: "ElevenLabs Sound Effects (SFX)",
    provider: "elevenlabs",
    family: "ElevenLabs · Voz & SFX",
    kinds: ["audio"],
    featureTags: ["SFX"],
    badgeEs: "SFX Cine",
    badgeEn: "Cinema SFX",
    descriptionEs: "Genera efectos de sonido y foley cinematográfico desde texto.",
    descriptionEn: "Generate cinematic sound effects and foley from text.",
  },

  // --- MUSIC & SFX (FAL.AI) ---
  {
    id: "fal-ai/stable-audio",
    name: "Stable Audio (Fal.ai)",
    provider: "fal",
    family: "Música & SFX · Fal.ai",
    kinds: ["audio"],
    featureTags: ["Music", "SFX"],
    badgeEs: "Música / SFX",
    badgeEn: "Music / SFX",
    descriptionEs: "Genera pistas musicales instrumentales y paisajes sonoros desde texto.",
    descriptionEn: "Generate instrumental tracks and soundscapes from text prompts.",
  },

  // --- SUNO & CUSTOM AUDIO ---
  {
    id: "suno-music",
    name: "Suno Music (vía Custom API)",
    provider: "custom",
    family: "Suno · Música & Custom Audio",
    kinds: ["audio"],
    featureTags: ["Music"],
    badgeEs: "Canciones",
    badgeEn: "Full Songs",
    descriptionEs: "Canciones completas desde texto conectando tu endpoint compatible de Suno.",
    descriptionEn: "Full songs from text prompts via your compatible Suno API endpoint.",
  },
  {
    id: "suno-sounds",
    name: "Suno Sounds / Seed Audio (vía Custom API)",
    provider: "custom",
    family: "Suno · Música & Custom Audio",
    kinds: ["audio"],
    featureTags: ["SFX", "Sample"],
    badgeEs: "Samples",
    badgeEn: "Samples",
    descriptionEs: "Efectos de sonido y samples musicales vía tu endpoint configurado en la Bóveda.",
    descriptionEn: "Sound effects and musical samples via your custom endpoint in the Vault.",
  },
];

export interface ModelFamilyGroup {
  family: string;
  provider: AiProviderId;
  models: AiModelSpec[];
}

export function groupModelsByFamily(models: AiModelSpec[]): ModelFamilyGroup[] {
  const map = new Map<string, ModelFamilyGroup>();
  for (const model of models) {
    const existing = map.get(model.family);
    if (existing) {
      existing.models.push(model);
    } else {
      map.set(model.family, {
        family: model.family,
        provider: model.provider,
        models: [model],
      });
    }
  }
  return Array.from(map.values());
}

export const AUDIO_VOICES: Record<
  "openai" | "elevenlabs" | "gemini",
  Array<{ id: string; label: string; toneEs: string; toneEn: string }>
> = {
  openai: [
    { id: "nova", label: "Nova", toneEs: "Clara y cálida", toneEn: "Clear & warm" },
    { id: "alloy", label: "Alloy", toneEs: "Neutra editorial", toneEn: "Editorial neutral" },
    { id: "coral", label: "Coral", toneEs: "Expresiva", toneEn: "Expressive" },
    { id: "onyx", label: "Onyx", toneEs: "Profunda cine", toneEn: "Deep cinema" },
    { id: "shimmer", label: "Shimmer", toneEs: "Brillante", toneEn: "Bright" },
    { id: "sage", label: "Sage", toneEs: "Serena", toneEn: "Calm" },
  ],
  elevenlabs: [
    { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel", toneEs: "Narración versátil", toneEn: "Versatile narration" },
    { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella", toneEs: "Cálida y suave", toneEn: "Warm & smooth" },
    { id: "ErXwobaYiN019PkySvjV", label: "Antoni", toneEs: "Documental", toneEn: "Documentary" },
    { id: "TxGEqnHWrfWFTfGW9XjX", label: "Josh", toneEs: "Dinámica", toneEn: "Dynamic" },
    { id: "pNInz6obpgDQGcFmaJgB", label: "Adam", toneEs: "Profunda", toneEn: "Deep narrator" },
  ],
  gemini: [
    { id: "Kore", label: "Kore", toneEs: "Firme y clara", toneEn: "Firm & clear" },
    { id: "Puck", label: "Puck", toneEs: "Animada", toneEn: "Upbeat" },
    { id: "Zephyr", label: "Zephyr", toneEs: "Brillante", toneEn: "Bright" },
    { id: "Aoede", label: "Aoede", toneEs: "Cálida", toneEn: "Warm" },
    { id: "Fenrir", label: "Fenrir", toneEs: "Excitante", toneEn: "Excitable" },
  ],
};

export function createEmptyVault(): ApiKeyVault {
  return {
    gemini: { apiKey: "" },
    openai: { apiKey: "" },
    xai: { apiKey: "" },
    bfl: { apiKey: "" },
    fal: { apiKey: "" },
    stability: { apiKey: "" },
    elevenlabs: { apiKey: "" },
    custom: { apiKey: "", baseUrl: "", customModel: "" },
  };
}

export function loadApiVault(): ApiKeyVault {
  const empty = createEmptyVault();
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(API_VAULT_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ApiKeyVault>;
    const merged = { ...empty };
    for (const provider of PROVIDERS) {
      if (parsed[provider.id]) {
        merged[provider.id] = {
          ...empty[provider.id],
          ...parsed[provider.id],
        };
      }
    }
    return merged;
  } catch {
    return empty;
  }
}

export function saveApiVault(vault: ApiKeyVault): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(API_VAULT_STORAGE_KEY, JSON.stringify(vault));
  } catch {
    // Ignore storage quota errors
  }
}

export function countConfiguredKeys(vault: ApiKeyVault): number {
  return PROVIDERS.filter((p) => vault[p.id]?.apiKey?.trim().length > 0).length;
}

export function hasProviderKey(vault: ApiKeyVault, provider: AiProviderId): boolean {
  const entry = vault[provider];
  if (!entry || !entry.apiKey.trim()) return false;
  if (provider === "custom" && !entry.baseUrl?.trim()) return false;
  return true;
}

export function getProviderMeta(provider: AiProviderId): ProviderMeta {
  return PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];
}

export function getModelsByKind(kind: AiMediaKind): AiModelSpec[] {
  return AI_MODELS.filter((m) => m.kinds.includes(kind));
}

export function getEditCapableModels(): AiModelSpec[] {
  return AI_MODELS.filter((m) => m.supportsEdit);
}

export function getModelById(id: string): AiModelSpec | undefined {
  return AI_MODELS.find((m) => m.id === id);
}

export function getDimensionsForRatio(
  ratio: AspectRatioPreset,
  resolution: ResolutionTier
): { width: number; height: number } {
  const found = ASPECT_RATIO_OPTIONS.find((r) => r.id === ratio) || ASPECT_RATIO_OPTIONS[0];
  const scale =
    resolution === "0.5K" ? 0.5 : resolution === "2K" ? 1.5 : resolution === "4K" ? 2 : 1;
  return {
    width: Math.round((found.w * scale) / 64) * 64,
    height: Math.round((found.h * scale) / 64) * 64,
  };
}
