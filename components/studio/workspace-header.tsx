"use client";

import React from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { ToolSlug, getToolBySlug } from "@/lib/tools-catalog";
import { ToolIcon } from "./tool-icon";

interface WorkspaceHeaderProps {
  slug: ToolSlug;
  lang?: string;
  subtitle?: string;
  onClose?: () => void;
  rightSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
}

export function WorkspaceHeader({
  slug,
  lang = "es",
  subtitle,
  onClose,
  rightSlot,
  centerSlot,
}: WorkspaceHeaderProps) {
  const isEs = lang === "es";
  const tool = getToolBySlug(slug);
  const copy = isEs ? tool.es : tool.en;
  const badgeText = isEs ? tool.executionBadge.es : tool.executionBadge.en;

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* Left: Back button + Tool identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border shrink-0"
            aria-label={isEs ? "Volver al estudio principal" : "Back to main studio"}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{isEs ? "Estudio" : "Studio"}</span>
          </button>
        )}

        <div className="h-4 w-px bg-border hidden sm:block shrink-0" />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <ToolIcon slug={slug} className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground font-heading truncate">
                {copy.shortName}
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground font-accent truncate">
              {subtitle || copy.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Center slot (optional info pill or dimensions) */}
      {centerSlot ? (
        <div className="hidden md:flex items-center justify-center">{centerSlot}</div>
      ) : (
        <div className="hidden lg:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium font-accent">
            <Shield className="w-3 h-3 text-emerald-700" />
            {badgeText}
          </span>
        </div>
      )}

      {/* Right slot: Contextual actions */}
      <div className="flex items-center gap-2 shrink-0">
        {rightSlot}
      </div>
    </header>
  );
}
