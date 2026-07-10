"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Save, Trash2, Check } from "lucide-react";

const LS_KEY = "framed_custom_gradients";

export interface SavedGradient {
  id: string;
  name: string;
  value: string;
  bg: string;
  savedAt: number;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
export function loadSavedGradients(): SavedGradient[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGradient(g: SavedGradient) {
  const existing = loadSavedGradients();
  const updated = [g, ...existing].slice(0, 20); // max 20 saved
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
}

export function deleteSavedGradient(id: string) {
  const existing = loadSavedGradients();
  localStorage.setItem(LS_KEY, JSON.stringify(existing.filter((g) => g.id !== id)));
}

// ─── Gradient color stop ──────────────────────────────────────────────────────
interface Stop {
  id: string;
  color: string;
  position: number; // 0–100
}

function makeStop(color: string, position: number): Stop {
  return { id: Math.random().toString(36).slice(2), color, position };
}

// ─── Build CSS string ─────────────────────────────────────────────────────────
function buildGradientCSS(
  type: "linear" | "radial" | "conic",
  angle: number,
  stops: Stop[]
): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${stopsStr})`;
  if (type === "radial") return `radial-gradient(circle, ${stopsStr})`;
  return `conic-gradient(from ${angle}deg, ${stopsStr})`;
}

// ─── Average color for thumbnail ─────────────────────────────────────────────
function avgColor(stops: Stop[]): string {
  return stops[0]?.color ?? "#6366f1";
}

// ─── Gradient Builder component ───────────────────────────────────────────────
interface GradientBuilderProps {
  onApply: (value: string) => void;
  onClose: () => void;
}

const ANGLE_PRESETS = [
  { label: "→", angle: 90 },
  { label: "↘", angle: 135 },
  { label: "↓", angle: 180 },
  { label: "↙", angle: 225 },
  { label: "←", angle: 270 },
  { label: "↗", angle: 45 },
];

export function GradientBuilder({ onApply, onClose }: GradientBuilderProps) {
  const [type, setType] = useState<"linear" | "radial" | "conic">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    makeStop("#6366f1", 0),
    makeStop("#a855f7", 100),
  ]);
  const [gradientName, setGradientName] = useState("My Gradient");
  const [saved, setSaved] = useState(false);

  const css = buildGradientCSS(type, angle, stops);

  const addStop = () => {
    if (stops.length >= 5) return;
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const mid = sorted.length >= 2
      ? Math.round((sorted[0].position + sorted[sorted.length - 1].position) / 2)
      : 50;
    setStops((prev) => [...prev, makeStop("#ec4899", mid)]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStop = (id: string, key: keyof Stop, value: string | number) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const handleSave = () => {
    const g: SavedGradient = {
      id: Date.now().toString(),
      name: gradientName || "My Gradient",
      value: css,
      bg: avgColor(stops),
      savedAt: Date.now(),
    };
    saveGradient(g);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl p-4 space-y-4 font-accent">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground">Custom Gradient</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Preview */}
      <div
        className="w-full h-14 rounded-xl border border-border"
        style={{ background: css }}
      />

      {/* Type */}
      <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl">
        {(["linear", "radial", "conic"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
              type === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Angle (linear/conic only) */}
      {type !== "radial" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Angle
            </p>
            <span className="text-[10px] font-mono text-muted-foreground">{angle}°</span>
          </div>
          <div className="flex gap-1 mb-2">
            {ANGLE_PRESETS.map((p) => (
              <button
                key={p.angle}
                onClick={() => setAngle(p.angle)}
                className={`flex-1 py-1 rounded-md text-sm transition-all ${
                  angle === p.angle
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
          />
        </div>
      )}

      {/* Color stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Color Stops
          </p>
          {stops.length < 5 && (
            <button
              onClick={addStop}
              className="text-[9px] font-bold text-primary hover:text-primary/70 transition-colors"
            >
              + Add
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {stops
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((stop) => (
              <div key={stop.id} className="flex items-center gap-2">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-border shrink-0"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => updateStop(stop.id, "position", Number(e.target.value))}
                  className="flex-1 h-1.5 accent-primary rounded-full cursor-pointer"
                />
                <span className="text-[9px] font-mono text-muted-foreground w-7 text-right">
                  {stop.position}%
                </span>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Name (for saving) */}
      <input
        type="text"
        value={gradientName}
        onChange={(e) => setGradientName(e.target.value)}
        placeholder="Gradient name..."
        className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-muted focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onApply(css)}
          className="flex-1 py-2 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={() => { onApply(css); handleSave(); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            saved
              ? "border-green-400 text-green-600 bg-green-50"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {saved ? <Check size={11} /> : <Save size={11} />}
          {saved ? "Saved!" : "Apply & Save"}
        </button>
      </div>
    </div>
  );
}
