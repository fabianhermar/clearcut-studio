"use client";

import { ResetIcon } from "@/components/icons";
import { ADJUSTMENT_CONTROLS } from "@/lib/constants";
import type { Adjustments } from "@/lib/constants";

interface AdjustmentsPanelProps {
  adjustments: Adjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<Adjustments>>;
  onReset: () => void;
}

export function AdjustmentsPanel({ adjustments, setAdjustments, onReset }: AdjustmentsPanelProps) {
  return (
    <div className="space-y-5">
      {ADJUSTMENT_CONTROLS.map((ctrl) => (
        <div key={ctrl.key}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ctrl.icon size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{ctrl.label}</span>
            </div>
            <span className="text-sm text-slate-500 font-medium tabular-nums">
              {adjustments[ctrl.key]}%
            </span>
          </div>
          <input
            type="range"
            min={ctrl.min}
            max={ctrl.max}
            value={adjustments[ctrl.key]}
            onChange={(e) =>
              setAdjustments((prev) => ({
                ...prev,
                [ctrl.key]: Number(e.target.value),
              }))
            }
            className="w-full accent-blue-600"
          />
        </div>
      ))}

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <ResetIcon size={16} />
        <span>Restablecer ajustes</span>
      </button>
    </div>
  );
}
