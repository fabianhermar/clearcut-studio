"use client";

import { WorkspaceHeader } from "@/components/studio/workspace-header";
import { Undo2, Redo2, ImagePlus, Eye, Download } from "lucide-react";

interface EditorToolbarProps {
  canvasSize: { width: number; height: number };
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onQuickDownload?: () => void;
  onClose?: () => void;
  showOriginal?: boolean;
  onToggleOriginal?: (show: boolean) => void;
  lang?: string;
}

export function EditorToolbar({
  canvasSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onQuickDownload,
  onClose,
  showOriginal = false,
  onToggleOriginal,
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
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-foreground px-3 py-1 rounded-full bg-muted border border-border tabular-nums">
              {canvasSize.width} × {canvasSize.height} px
            </span>
            <span className="hidden xl:inline-flex font-mono text-[10px] uppercase tracking-wider text-emerald-800 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/20">
              ALPHA // RGBA
            </span>
          </div>
        ) : null
      }
      rightSlot={
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onToggleOriginal && (
            <button
              type="button"
              onMouseDown={() => onToggleOriginal(true)}
              onMouseUp={() => onToggleOriginal(false)}
              onMouseLeave={() => showOriginal && onToggleOriginal(false)}
              onClick={() => onToggleOriginal(!showOriginal)}
              title={isEn ? "Compare Original (Hold Space)" : "Comparar Original (Espacio)"}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold transition-colors cursor-pointer ${
                showOriginal
                  ? "bg-[#ff4d00] border-[#ff4d00] text-white"
                  : "bg-background hover:bg-muted border-border text-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showOriginal ? "ORIGINAL" : isEn ? "Compare" : "Comparar"}</span>
            </button>
          )}

          <div className="flex items-center bg-background border border-border rounded-full p-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label={isEn ? "Undo (Ctrl+Z)" : "Deshacer (Ctrl+Z)"}
              title={isEn ? "Undo (Ctrl+Z)" : "Deshacer (Ctrl+Z)"}
              className="p-1.5 text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label={isEn ? "Redo (Ctrl+Shift+Z)" : "Rehacer (Ctrl+Shift+Z)"}
              title={isEn ? "Redo (Ctrl+Shift+Z)" : "Rehacer (Ctrl+Shift+Z)"}
              className="p-1.5 text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-border/60 border border-border rounded-full transition-colors cursor-pointer"
          >
            <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">{isEn ? "New" : "Nueva"}</span>
          </button>

          {onQuickDownload && (
            <button
              type="button"
              onClick={onQuickDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#0c0e12] hover:bg-primary rounded-full transition-all tactile-button cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Export PNG" : "Descargar PNG"}</span>
            </button>
          )}
        </div>
      }
    />
  );
}
