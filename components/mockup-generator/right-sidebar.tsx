"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FramedSettings, AspectRatio } from "./types";
import {
  Maximize,
  MoveHorizontal,
  MoveVertical,
  Search,
  RotateCcw,
  ArrowUpDown,
  ArrowLeftRight,
} from "lucide-react";

interface RightSidebarProps {
  settings: FramedSettings;
  setSettings: (s: FramedSettings) => void;
}

type RatioOption = { name: string; label: string; value: AspectRatio };

const RATIO_GROUPS: { group: string; note?: string; ratios: RatioOption[] }[] = [
  {
    group: "Canvas",
    ratios: [
      { name: "Auto", label: "Auto", value: "auto" },
      { name: "1:1", label: "1:1", value: "1:1" },
      { name: "16:9", label: "16:9", value: "16:9" },
      { name: "4:3", label: "4:3", value: "4:3" },
    ],
  },
  {
    group: "Social",
    note: "Optimized for social platforms",
    ratios: [
      { name: "9:16 Stories", label: "9:16", value: "9:16" },
      { name: "4:5 Instagram", label: "4:5", value: "4:5" },
      { name: "2:1 Twitter", label: "2:1", value: "2:1" },
      { name: "3:2 LinkedIn", label: "3:2", value: "3:2" },
    ],
  },
];

const SOCIAL_LABELS: Record<string, string> = {
  "9:16": "Stories / Reels",
  "4:5": "Instagram Feed",
  "2:1": "Twitter / X",
  "3:2": "LinkedIn",
  "1:1": "Square",
  "16:9": "Widescreen",
  "4:3": "Presentation",
  auto: "Original size",
};

function SliderRow({
  label,
  icon,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
  onReset,
  resetValue,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  onReset?: () => void;
  resetValue?: number;
  disabled?: boolean;
}) {
  const isDirty = resetValue !== undefined && value !== resetValue;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-[10px] font-semibold text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {value >= 0 ? value : value}{unit}
          </span>
          {onReset && isDirty && (
            <button
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Reset"
            >
              <RotateCcw size={10} />
            </button>
          )}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        disabled={disabled}
        className={disabled ? "opacity-50" : ""}
      />
    </div>
  );
}

function SectionDivider() {
  return <div className="w-full h-px bg-border" />;
}

export function RightSidebar({ settings, setSettings }: RightSidebarProps) {
  const set = (key: keyof FramedSettings, value: any) =>
    setSettings({ ...settings, [key]: value });

  const anyTransformDirty =
    settings.zoom !== 100 ||
    settings.tiltX !== 0 ||
    settings.tiltY !== 0 ||
    settings.offsetX !== 0 ||
    settings.offsetY !== 0;

  return (
    <div className="w-full h-full flex flex-col font-accent bg-card border-l border-border text-foreground overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Canvas & Transform
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-5 custom-scrollbar">

        {/* ── Aspect Ratio ── */}
        <div className="space-y-2.5">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            Aspect Ratio
          </Label>
          {RATIO_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
                {group.group}
              </p>
              <div className="grid grid-cols-4 gap-1">
                {group.ratios.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => set("aspectRatio", r.value)}
                    title={SOCIAL_LABELS[r.value]}
                    className={`py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                      settings.aspectRatio === r.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {settings.aspectRatio !== "auto" && (
            <p className="text-[9px] text-muted-foreground italic">
              {SOCIAL_LABELS[settings.aspectRatio]}
            </p>
          )}
        </div>

        <SectionDivider />

        {/* ── Padding ── */}
        <div className="space-y-2.5">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            Spacing
          </Label>
          <SliderRow
            label="Padding"
            icon={<Maximize size={12} />}
            value={settings.padding}
            min={0}
            max={128}
            step={4}
            onChange={(v) => set("padding", v)}
            onReset={() => set("padding", 64)}
            resetValue={64}
          />
        </div>

        <SectionDivider />

        {/* ── Position (X/Y offset) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              Position
            </Label>
            {(settings.offsetX !== 0 || settings.offsetY !== 0) && (
              <button
                onClick={() => setSettings({ ...settings, offsetX: 0, offsetY: 0 })}
                className="text-[8px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={9} />
                Reset
              </button>
            )}
          </div>
          <SliderRow
            label="X offset"
            icon={<ArrowLeftRight size={12} />}
            value={settings.offsetX}
            min={-200}
            max={200}
            step={2}
            unit="px"
            onChange={(v) => set("offsetX", v)}
            onReset={() => set("offsetX", 0)}
            resetValue={0}
          />
          <SliderRow
            label="Y offset"
            icon={<ArrowUpDown size={12} />}
            value={settings.offsetY}
            min={-200}
            max={200}
            step={2}
            unit="px"
            onChange={(v) => set("offsetY", v)}
            onReset={() => set("offsetY", 0)}
            resetValue={0}
          />
        </div>

        <SectionDivider />

        {/* ── 3D Transform ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              3D Transform
            </Label>
            {anyTransformDirty && (
              <button
                onClick={() => setSettings({ ...settings, zoom: 100, tiltX: 0, tiltY: 0, offsetX: 0, offsetY: 0 })}
                className="text-[8px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={9} />
                Reset all
              </button>
            )}
          </div>

          <SliderRow
            label="Zoom"
            icon={<Search size={12} />}
            value={settings.zoom}
            min={50}
            max={150}
            step={1}
            unit="%"
            onChange={(v) => set("zoom", v)}
            onReset={() => set("zoom", 100)}
            resetValue={100}
          />
          <SliderRow
            label="Tilt X"
            icon={<MoveHorizontal size={12} />}
            value={settings.tiltX}
            min={-45}
            max={45}
            step={1}
            unit="°"
            onChange={(v) => set("tiltX", v)}
            onReset={() => set("tiltX", 0)}
            resetValue={0}
            disabled={settings.frameStyle === "hd"}
          />
          <SliderRow
            label="Tilt Y"
            icon={<MoveVertical size={12} />}
            value={settings.tiltY}
            min={-45}
            max={45}
            step={1}
            unit="°"
            onChange={(v) => set("tiltY", v)}
            onReset={() => set("tiltY", 0)}
            resetValue={0}
            disabled={settings.frameStyle === "hd"}
          />
        </div>

        <SectionDivider />

        {/* ── Frame info ── */}
        <div className="space-y-2 pb-4">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            Current Frame
          </Label>
          <div className="bg-muted rounded-xl p-3 space-y-1.5">
            {[
              { label: "Style", val: settings.frameStyle },
              { label: "Ratio", val: settings.aspectRatio },
              { label: "Shadow", val: settings.shadowType },
              { label: "Filter", val: settings.filterEffect },
              { label: "Offset", val: `${settings.offsetX}×${settings.offsetY}px` },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-[9px]">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold capitalize">{val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
