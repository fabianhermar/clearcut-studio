import React from "react";
import {
  Scissors,
  Zap,
  ShieldCheck,
  Maximize2,
  Palette,
  AppWindow,
  Stamp,
  Monitor,
  Sparkles,
  Eraser,
  Crop,
  FileCode,
  Files,
  Aperture,
  ImagePlus,
  SwatchBook,
} from "lucide-react";
import type { ToolSlug } from "@/lib/tools-catalog";

export function ToolIcon({
  slug,
  className = "w-5 h-5",
}: {
  slug: ToolSlug;
  className?: string;
}) {
  switch (slug) {
    case "background-remover":
      return <Scissors className={className} />;
    case "image-optimizer":
      return <Zap className={className} />;
    case "exif-stripper":
      return <ShieldCheck className={className} />;
    case "aspect-ratio-fitter":
      return <Maximize2 className={className} />;
    case "gradient-extractor":
      return <Palette className={className} />;
    case "favicon-generator":
      return <AppWindow className={className} />;
    case "batch-watermarker":
      return <Stamp className={className} />;
    case "mockup-generator":
      return <Monitor className={className} />;
    case "ai-image-streamer":
      return <Sparkles className={className} />;
    case "magic-eraser":
      return <Eraser className={className} />;
    case "crop-upscale":
      return <Crop className={className} />;
    case "svg-optimizer":
      return <FileCode className={className} />;
    case "heic-converter":
      return <Files className={className} />;
    case "raw-converter":
      return <Aperture className={className} />;
    case "responsive-images":
      return <ImagePlus className={className} />;
    case "color-palette":
      return <SwatchBook className={className} />;
    default:
      return <Scissors className={className} />;
  }
}
