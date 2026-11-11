"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { Undo2, Redo2, ImagePlus } from "lucide-react";

interface EditorToolbarProps {
  canvasSize: { width: number; height: number };
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onClose?: () => void;
  lang?: string;
}

export function EditorToolbar({
  canvasSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onClose,
  lang = "es",
}: EditorToolbarProps) {
  const isEn = lang === "en";

  return (
    <WorkspaceHeader
      slug="background-remover"
      lang={lang}
      onClose={onClose || onReset}
      centerSlot={
        canvasSize.width > 0 ? (
          <span className="font-mono text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-md bg-muted border border-border">
            {canvasSize.width} × {canvasSize.height} px
          </span>
        ) : null
      }
      rightSlot={
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label={isEn ? "Undo" : "Deshacer"}
            title={isEn ? "Undo" : "Deshacer"}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label={isEn ? "Redo" : "Rehacer"}
            title={isEn ? "Redo" : "Rehacer"}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border mx-1" aria-hidden="true" />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-lg transition-colors cursor-pointer"
          >
            <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? "New image" : "Nueva imagen"}</span>
          </button>
        </div>
      }
    />
  );
}
