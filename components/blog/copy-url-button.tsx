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
        title === "Copiar Enlace" || window.location.pathname.startsWith('/es/') 
          ? "Enlace copiado al portapapeles" 
          : "Link copied to clipboard"
      );
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Error al copiar / Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="Copy article URL"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Link2 className="w-4 h-4" />
      )}
      <span>{title || "Copy URL"}</span>
    </button>
  );
}
