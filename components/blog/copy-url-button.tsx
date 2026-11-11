"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyUrlButtonProps {
  title?: string;
}

export function CopyUrlButton({ title }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(
        title === "Copiar enlace" || window.location.pathname.startsWith("/es/")
          ? "Enlace copiado al portapapeles"
          : "Link copied to clipboard"
      );

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar / Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-foreground bg-card border border-border rounded-xl hover:bg-muted hover:border-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-primary cursor-pointer font-accent shadow-2xs"
      aria-label={title || "Copy article URL"}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
      ) : (
        <Link2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
      )}
      <span>{copied ? (window.location.pathname.startsWith("/es/") ? "¡Copiado!" : "Copied!") : title || "Copy URL"}</span>
    </button>
  );
}
