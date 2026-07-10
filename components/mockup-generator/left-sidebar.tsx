"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  FramedSettings,
  FrameStyle,
  BACKGROUNDS,
  MAGIC_PRESETS,
  ShadowType,
  FilterEffect,
} from "./types";
import { HD_MOCKUPS } from "./hd-mockups";
import {
  Image as ImageIcon,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Command,
  Link,
  Wand2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { GradientBuilder, loadSavedGradients, deleteSavedGradient, SavedGradient } from "./gradient-builder";

interface LeftSidebarProps {
  settings: FramedSettings;
  setSettings: (s: FramedSettings) => void;
  onNewImage: () => void;
}

type FrameGroup = { label: string; icon: React.ReactNode; frames: { name: string; value: FrameStyle; isPremium?: boolean }[] };

const FRAME_GROUPS: FrameGroup[] = [
  {
    label: "Screenshot",
    icon: <Monitor size={13} />,
    frames: [
      { name: "None", value: "none" },
      { name: "Glass ☀️", value: "glass-light" },
      { name: "Glass 🌙", value: "glass-dark" },
      { name: "Outline", value: "outline" },
      { name: "Border", value: "border" },
      { name: "Photo HD", value: "hd", isPremium: true },
    ],
  },
  {
    label: "Desktop",
    icon: <Command size={13} />,
    frames: [
      { name: "macOS", value: "macos" },
      { name: "Browser", value: "browser" },
    ],
  },
  {
    label: "Mobile",
    icon: <Smartphone size={13} />,
    frames: [
      { name: "iPhone 15 Pro", value: "iphone-15-pro" },
      { name: "iPhone 14", value: "iphone-14" },
      { name: "iPhone SE", value: "iphone-se" },
      { name: "Android", value: "android" },
    ],
  },
  {
    label: "Tablet",
    icon: <Tablet size={13} />,
    frames: [
      { name: "iPad", value: "ipad" },
      { name: "Android Tab", value: "android-tab" },
    ],
  },
];

const BORDERS = [
  { name: "Sharp", radius: 0 },
  { name: "Curved", radius: 16 },
  { name: "Round", radius: 32 },
];

const SHADOWS: { name: string; value: ShadowType }[] = [
  { name: "None", value: "none" },
  { name: "Spread", value: "spread" },
  { name: "Hug", value: "hug" },
  { name: "Bottom", value: "bottom" },
];

const FILTERS: { name: string; value: FilterEffect; emoji: string }[] = [
  { name: "Clean", value: "none", emoji: "✨" },
  { name: "Noise", value: "noise", emoji: "🌫️" },
  { name: "Grain", value: "grain", emoji: "📷" },
  { name: "Vignette", value: "vignette", emoji: "🔦" },
];

const BG_CATEGORIES = ["all", "mesh", "gradient", "solid", "saved", "special"] as const;

export function LeftSidebar({ settings, setSettings, onNewImage }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<"mockup" | "device">("mockup");
  const [bgCategory, setBgCategory] = useState<typeof BG_CATEGORIES[number]>("all");
  const [showGradientBuilder, setShowGradientBuilder] = useState(false);
  const [savedGradients, setSavedGradients] = useState<SavedGradient[]>([]);

  // Load saved gradients from localStorage on mount
  useEffect(() => {
    setSavedGradients(loadSavedGradients());
  }, []);

  const refreshSaved = () => setSavedGradients(loadSavedGradients());

  const handleChange = (key: keyof FramedSettings, value: any) =>
    setSettings((prev: FramedSettings) => ({ ...prev, [key]: value }));

  const applyPreset = (preset: (typeof MAGIC_PRESETS)[number]) =>
    setSettings((prev: FramedSettings) => ({ ...prev, ...preset.settings }));

  const filteredBgs =
    bgCategory === "all"
      ? BACKGROUNDS
      : bgCategory === "saved"
      ? [] // shown separately
      : BACKGROUNDS.filter((bg) => bg.category === bgCategory);

  const isDeviceFrame = [
    "iphone-14", "iphone-15-pro", "iphone-se", "ipad", "android", "android-tab",
  ].includes(settings.frameStyle);

  const isBrowserFrame = settings.frameStyle === "browser";

  return (
    <div className="w-full h-full flex flex-col font-accent bg-card border-r border-border text-foreground overflow-hidden relative">

      {/* ── Tabs ── */}
      <div className="flex border-b border-border shrink-0">
        {(["mockup", "device"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${
              activeTab === tab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-5 custom-scrollbar">

        {activeTab === "mockup" && (
          <>
            {/* Change Media */}
            <button
              onClick={onNewImage}
              className="w-full h-16 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all group"
            >
              <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">Change Media</span>
            </button>

            {/* Magic Presets */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-violet-500" />
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Magic Presets
                </Label>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {MAGIC_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    title={preset.name}
                    className="group flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all border-2 border-transparent group-hover:border-primary/40 group-hover:scale-105 shadow-sm"
                      style={{ background: (preset.settings.background as string) || "#f1f5f9" }}
                    >
                      {preset.emoji}
                    </div>
                    <span className="text-[8px] font-semibold text-muted-foreground group-hover:text-foreground leading-none">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Style */}
            <div className="space-y-2.5">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Frame
              </Label>
              <div className="space-y-2.5">
                {FRAME_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground/70">
                      {group.icon}
                      <span className="text-[9px] font-bold uppercase tracking-wide">{group.label}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {group.frames.map((frame) => (
                        <button
                          key={frame.value}
                          onClick={() => {
                            handleChange("frameStyle", frame.value);
                            if (frame.value === "hd") {
                              if (!settings.hdMockupId) handleChange("hdMockupId", HD_MOCKUPS[0].id);
                              setActiveTab("device");
                            }
                          }}
                          className={`relative py-1.5 px-1 rounded-lg text-[9px] font-bold transition-all border truncate ${
                            settings.frameStyle === frame.value
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-muted border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                        >
                          {frame.name}
                          {frame.isPremium && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 text-[8px]">✨</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser URL (only when browser or macos selected) */}
            {(isBrowserFrame || settings.frameStyle === "macos") && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Link size={12} className="text-muted-foreground" />
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    Browser URL
                  </Label>
                </div>
                <div className="flex items-center gap-1.5 bg-muted rounded-xl px-3 py-2 border border-border/60">
                  <span className="text-[9px] text-muted-foreground shrink-0 font-mono">https://</span>
                  <input
                    type="text"
                    value={(settings.browserUrl || "").replace(/^https?:\/\//, "")}
                    onChange={(e) => handleChange("browserUrl", "https://" + e.target.value.replace(/^https?:\/\//, ""))}
                    placeholder="yourapp.com"
                    className="flex-1 bg-transparent text-[11px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                  />
                </div>
              </div>
            )}

            {/* Border Radius (non-device) */}
            {!isDeviceFrame && (
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Radius
                </Label>
                <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl">
                  {BORDERS.map((border) => {
                    const isActive =
                      (border.radius === 0 && settings.rounded === 0) ||
                      (border.radius === 16 && settings.rounded > 0 && settings.rounded <= 24) ||
                      (border.radius === 32 && settings.rounded > 24);
                    return (
                      <button
                        key={border.name}
                        onClick={() => handleChange("rounded", border.radius)}
                        className={`py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                          isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {border.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                  <span className="text-[9px] font-semibold text-muted-foreground w-10">Radius</span>
                  <Slider
                    value={[settings.rounded]}
                    min={0}
                    max={48}
                    step={2}
                    className="flex-1"
                    onValueChange={([v]) => handleChange("rounded", v)}
                  />
                  <span className="text-[9px] font-bold text-foreground w-5 text-right">{settings.rounded}</span>
                </div>
              </div>
            )}

            {/* Device color (device frames) */}
            {isDeviceFrame && (
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Device Color</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["black", "white"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => handleChange("deviceColor", c)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-xl text-[10px] font-bold border transition-all ${
                        settings.deviceColor === c
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-border/50"
                        style={{ background: c === "black" ? "#1a1a1e" : "#f5f5f7" }}
                      />
                      <span className="capitalize">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shadow */}
            <div className="space-y-2.5">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Shadow</Label>
              <div className="grid grid-cols-4 gap-1">
                {SHADOWS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleChange("shadowType", s.value)}
                    className={`py-1.5 rounded-lg text-[9px] font-bold transition-all border ${
                      settings.shadowType === s.value
                        ? "bg-primary text-white border-primary"
                        : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              {settings.shadowType !== "none" && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                    <span className="text-[9px] font-semibold text-muted-foreground w-12">Opacity</span>
                    <Slider
                      value={[settings.shadow]}
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                      onValueChange={([v]) => handleChange("shadow", v)}
                    />
                    <span className="text-[9px] font-bold text-foreground w-7 text-right">{settings.shadow}%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                    <span className="text-[9px] font-semibold text-muted-foreground w-12">Color</span>
                    <input
                      type="color"
                      value={settings.shadowColor || "#000000"}
                      onChange={(e) => handleChange("shadowColor", e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-border"
                    />
                    <span className="text-[9px] font-mono text-muted-foreground">{settings.shadowColor}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Filter</Label>
              <div className="grid grid-cols-4 gap-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => handleChange("filterEffect", f.value)}
                    className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-[8px] font-bold border transition-all ${
                      settings.filterEffect === f.value
                        ? "bg-primary text-white border-primary"
                        : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-sm">{f.emoji}</span>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2.5">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Background
              </Label>

              {/* Category tabs */}
              <div className="flex gap-1 flex-wrap">
                {BG_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setBgCategory(cat); if (cat === "saved") refreshSaved(); }}
                    className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide transition-all ${
                      bgCategory === cat
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Saved gradients */}
              {bgCategory === "saved" && (
                <div>
                  {savedGradients.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-4">
                      No saved gradients yet.<br />Use the gradient builder below!
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                      {savedGradients.map((g) => (
                        <div key={g.id} className="group relative">
                          <button
                            title={g.name}
                            onClick={() => handleChange("background", g.value)}
                            className={`h-10 w-full rounded-xl border-2 transition-all ${
                              settings.background === g.value
                                ? "border-primary scale-105 ring-2 ring-primary/20"
                                : "border-transparent hover:border-border/60"
                            }`}
                            style={{ background: g.bg, backgroundImage: g.value.startsWith("linear") || g.value.startsWith("radial") || g.value.startsWith("conic") ? g.value : undefined }}
                          />
                          <button
                            onClick={() => { deleteSavedGradient(g.id); refreshSaved(); }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-white rounded-full text-[8px] items-center justify-center hidden group-hover:flex"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Background grid */}
              {bgCategory !== "saved" && (
                <div className="grid grid-cols-5 gap-1.5">
                  {filteredBgs.map((bg) => (
                    <button
                      key={bg.name}
                      title={bg.name}
                      onClick={() => handleChange("background", bg.value)}
                      className={`h-9 w-full rounded-xl border-2 transition-all ${
                        settings.background === bg.value
                          ? "border-primary scale-105 shadow-md z-10 ring-2 ring-primary/20"
                          : "border-transparent hover:border-border/60 hover:scale-[1.04]"
                      }`}
                      style={{
                        background: bg.bg,
                        backgroundImage:
                          bg.value === "transparent"
                            ? "repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%)"
                            : bg.category === "mesh" || bg.category === "gradient"
                            ? bg.value
                            : undefined,
                        backgroundSize: bg.value === "transparent" ? "8px 8px" : "cover",
                      }}
                    />
                  ))}

                  {/* Custom gradient builder trigger */}
                  <button
                    title="Custom gradient builder"
                    onClick={() => setShowGradientBuilder(true)}
                    className="h-9 w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center text-muted-foreground hover:text-primary text-sm font-bold"
                  >
                    <Wand2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom spacer */}
            <div className="h-4" />
          </>
        )}

        {activeTab === "device" && (
          <div className="space-y-4 pt-1">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Configure CSS device settings or pick a photorealistic HD mockup.
            </p>

            {/* Device color (for CSS frames) */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Device Color (CSS Frames)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(["black", "white"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleChange("deviceColor", c)}
                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      settings.deviceColor === c
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ background: c === "black" ? "#1a1a1e" : "#f5f5f7" }}
                    />
                    <span className="capitalize">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-border my-4" />

            {/* HD Mockups Grouped by Category */}
            <div className="space-y-4">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Photo HD Mockups ✨
              </Label>
              
              {(["phone", "desktop", "laptop", "tablet", "wearable"] as const).map((cat) => {
                const mockupsInCat = HD_MOCKUPS.filter(m => m.category === cat);
                if (mockupsInCat.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground/80">
                      {cat}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {mockupsInCat.map((mockup) => (
                        <button
                          key={mockup.id}
                          onClick={() => {
                            setSettings((prev) => ({
                              ...prev,
                              frameStyle: "hd",
                              hdMockupId: mockup.id,
                              tiltX: 0,
                              tiltY: 0,
                            }));
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                            settings.frameStyle === "hd" && settings.hdMockupId === mockup.id
                              ? "bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/20"
                              : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <div className="w-full aspect-[4/3] rounded-md bg-transparent mb-1.5 overflow-hidden flex items-center justify-center p-0.5">
                             <img src={mockup.image} alt={mockup.name} className="max-w-full max-h-full object-contain drop-shadow-sm transition-transform group-hover:scale-105" />
                          </div>
                          <span className="text-[9px] font-semibold text-center leading-tight w-full line-clamp-2">
                            {mockup.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Gradient Builder panel (slides up) ── */}
      {showGradientBuilder && (
        <>
          <div
            className="absolute inset-0 z-40 bg-background/50 backdrop-blur-sm"
            onClick={() => setShowGradientBuilder(false)}
          />
          <GradientBuilder
            onApply={(css) => {
              handleChange("background", css);
              setShowGradientBuilder(false);
            }}
            onClose={() => setShowGradientBuilder(false)}
          />
        </>
      )}
    </div>
  );
}
