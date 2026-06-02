"use client";

import { UndoIcon, RedoIcon, RefreshIcon, LayersIcon } from "@/components/icons";

interface EditorToolbarProps {
  canvasSize: { width: number; height: number };
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export function EditorToolbar({
  canvasSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
}: EditorToolbarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/logos/ClearCut-logo.avif" alt="ClearCut" className="h-24 w-auto" />
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <span className="text-sm text-slate-500 font-accent">
          {canvasSize.width} x {canvasSize.height}px
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Deshacer"
        >
          <UndoIcon size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Rehacer"
        >
          <RedoIcon size={18} />
        </button>
        <div className="h-6 w-px bg-slate-200 mx-2" />
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshIcon size={16} />
          <span className="font-accent">Nueva imagen</span>
        </button>
      </div>
    </header>
  );
}
