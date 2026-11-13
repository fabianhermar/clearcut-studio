"use client";

import { RotateCcw } from "lucide-react";
import { ADJUSTMENT_CONTROLS } from "@/lib/constants";
import type { Adjustments, AdjustmentKey } from "@/lib/constants";

interface AdjustmentsPanelProps {
  adjustments: Adjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<Adjustments>>;
  onReset: () => void;
  lang?: string;
}

const ADJUSTMENT_LABELS_EN: Record<AdjustmentKey, string> = {
  brightness: "Brightness",
  exposure: "Exposure",
  contrast: "Contrast",
  saturation: "Saturation",
};

export function AdjustmentsPanel({
  adjustments,
  setAdjustments,
  onReset,
  lang = "es",
}: AdjustmentsPanelProps) {
  const isEn = lang === "en";

  return (
    <div className="space-y-5 text-foreground">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {isEn ? "COLOR CALIBRATION" : "CALIBRACIÓN DE COLOR"}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">RGBA</span>
      </div>

      <div className="space-y-3.5">
        {ADJUSTMENT_CONTROLS.map((ctrl) => {
          const val = adjustments[ctrl.key];
          const isModified = val !== 100;
          return (
            <div
              key={ctrl.key}
              className="p-3.5 rounded-2xl bg-background border border-border space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ctrl.icon size={15} className="text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground font-accent">
                    {isEn ? ADJUSTMENT_LABELS_EN[ctrl.key] : ctrl.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdjustments((prev) => ({ ...prev, [ctrl.key]: 100 }))
                  }
                  title={isEn ? "Reset value to 100%" : "Restablecer a 100%"}
                  className={`font-mono text-[11px] font-bold tabular-nums px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    isModified
                      ? "bg-primary/10 border-primary/35 text-primary"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {val}%
                </button>
              </div>

              <div className="py-1 flex items-center">
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  value={val}
                  aria-label={isEn ? ADJUSTMENT_LABELS_EN[ctrl.key] : ctrl.label}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      [ctrl.key]: Number(e.target.value),
                    }))
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-background hover:bg-muted border border-border text-xs font-semibold text-foreground rounded-xl transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{isEn ? "Reset all adjustments" : "Restablecer ajustes"}</span>
      </button>
    </div>
  );
}
