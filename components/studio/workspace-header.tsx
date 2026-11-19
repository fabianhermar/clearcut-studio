"use client";

import { ArrowLeft, CloudLightning, ShieldCheck } from "lucide-react";
import { getToolBySlug, ToolSlug } from "@/lib/tools-catalog";
import { ToolIcon } from "@/components/studio/tool-icon";

interface WorkspaceHeaderProps {
  slug: ToolSlug;
  lang?: string;
  subtitle?: string;
  onClose?: () => void;
  rightSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  variant?: "light" | "dark";
}

export function WorkspaceHeader({
  slug,
  lang = "es",
  subtitle,
  onClose,
  rightSlot,
  centerSlot,
  variant = "light",
}: WorkspaceHeaderProps) {
  const isEs = lang === "es";
  const isDark = variant === "dark";
  const tool = getToolBySlug(slug);
  const copy = tool ? (isEs ? tool.es : tool.en) : null;

  return (
    <header
      className={`w-full min-h-14 px-4 sm:px-5 py-2 backdrop-blur-md border-b flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 ${
        isDark
          ? "bg-[#0e1118]/95 border-[#1f2432] text-slate-100"
          : "bg-card/90 border-border text-foreground"
      }`}
    >
      {/* Left: Back to studio + Active instrument label */}
      <div className="flex items-center gap-3 min-w-0">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={isEs ? "Volver al estudio" : "Back to studio"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0 ${
              isDark
                ? "bg-[#171b26] hover:bg-[#222838] border-[#2a3142] text-slate-200"
                : "bg-background hover:bg-muted border-border text-foreground"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{isEs ? "Estudio" : "Studio"}</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-[#1a1f2c] border border-[#2a3142] text-white"
                : "bg-darkroom text-white"
            }`}
          >
            <ToolIcon slug={slug} className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className={`font-heading font-bold text-sm sm:text-base truncate ${
                  isDark ? "text-white" : "text-foreground"
                }`}
              >
                {copy?.shortName || slug}
              </h1>
              <span
                className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[10px] font-semibold shrink-0 ${
                  tool?.isCloudAi
                    ? isDark
                      ? "bg-[#1e40ff]/20 border-[#60a5fa]/35 text-[#93c5fd]"
                      : "bg-primary/10 border-primary/25 text-primary"
                    : isDark
                    ? "bg-emerald-500/10 border-emerald-400/25 text-emerald-300"
                    : "bg-emerald-500/10 border-emerald-700/20 text-emerald-800"
                }`}
              >
                {tool?.isCloudAi ? (
                  <>
                    <CloudLightning className="w-3 h-3" aria-hidden="true" />
                    <span>BYOK // STREAMING AI</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                    <span>LOCAL // 0 B</span>
                  </>
                )}
              </span>
            </div>
            {(subtitle || copy?.tagline) && (
              <p
                className={`text-[11px] font-accent truncate ${
                  isDark ? "text-slate-400" : "text-muted-foreground"
                }`}
              >
                {subtitle || copy?.tagline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Center custom controls if provided */}
      {centerSlot && (
        <div className="flex items-center gap-2 order-3 sm:order-2 w-full sm:w-auto justify-center">
          {centerSlot}
        </div>
      )}

      {/* Right actions */}
      {rightSlot && (
        <div className="flex items-center gap-2 order-2 sm:order-3 ml-auto sm:ml-0">
          {rightSlot}
        </div>
      )}
    </header>
  );
}
