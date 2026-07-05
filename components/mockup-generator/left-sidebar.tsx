import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FramedSettings, FrameStyle, BACKGROUNDS, ShadowType } from "./types";
import { Image as ImageIcon, Sparkles } from "lucide-react";

interface LeftSidebarProps {
  settings: FramedSettings;
  setSettings: (settings: FramedSettings) => void;
  onNewImage: () => void;
}

const STYLES: { name: string; value: FrameStyle; previewClass: string }[] = [
  { name: "Default", value: "none", previewClass: "bg-white shadow-sm border border-border" },
  { name: "macOS", value: "macos", previewClass: "bg-white shadow-sm border border-border border-t-8 border-t-slate-800" },
  { name: "Glass Light", value: "glass-light", previewClass: "bg-white/40 backdrop-blur border border-white/40 shadow-sm" },
  { name: "Glass Dark", value: "glass-dark", previewClass: "bg-black/40 backdrop-blur border border-white/10 shadow-sm" },
  { name: "Outline", value: "outline", previewClass: "bg-white border-2 border-border" },
  { name: "Border", value: "border", previewClass: "bg-white border-[6px] border-black" },
];

const BORDERS = [
  { name: "Sharp", radius: 0, iconPath: "M5 19V5h14" },
  { name: "Curved", radius: 16, iconPath: "M5 19V9a4 4 0 0 1 4-4h10" },
  { name: "Round", radius: 32, iconPath: "M5 19v-4a10 10 0 0 1 10-10h4" },
];

const SHADOWS: { name: string; value: ShadowType; preview: string }[] = [
  { name: "None", value: "none", preview: "shadow-none" },
  { name: "Spread", value: "spread", preview: "shadow-[0_10px_40px_rgba(0,0,0,0.3)]" },
  { name: "Hug", value: "hug", preview: "shadow-[0_4px_10px_rgba(0,0,0,0.4)]" },
];

export function LeftSidebar({ settings, setSettings, onNewImage }: LeftSidebarProps) {
  const handleChange = (key: keyof FramedSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 font-accent p-6 bg-card text-foreground border-r border-border overflow-y-auto overflow-x-hidden custom-scrollbar">
      
      {/* Media Section */}
      <div className="space-y-3">
        <button
          onClick={onNewImage}
          className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <ImageIcon size={24} />
          <span className="text-xs font-semibold">Change Media</span>
        </button>
      </div>

      {/* Styles Section */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Style</Label>
        <div className="grid grid-cols-3 gap-3">
          {STYLES.map((style) => (
            <button
              key={style.name}
              onClick={() => handleChange("frameStyle", style.value)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-full aspect-square rounded-[18px] p-0.5 transition-all ${
                settings.frameStyle === style.value
                  ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm"
                  : "bg-transparent group-hover:bg-muted"
              }`}>
                <div className="w-full h-full bg-muted rounded-[16px] flex items-end justify-end p-2 overflow-hidden relative">
                  <div className={`w-[150%] h-[150%] absolute top-4 left-4 rounded-tl-3xl ${style.previewClass}`} />
                </div>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Border Section */}
      <div className="space-y-4">
        <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Border</Label>
        <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-xl border border-border/50">
          {BORDERS.map((border) => {
            // Evaluamos si el radius actual es el más cercano a esta opción
            const isActive = 
              (border.radius === 0 && settings.rounded === 0) || 
              (border.radius === 16 && settings.rounded > 0 && settings.rounded <= 24) ||
              (border.radius === 32 && settings.rounded > 24);

            return (
              <button
                key={border.name}
                onClick={() => handleChange("rounded", border.radius)}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
                  isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={border.iconPath} />
                </svg>
                <span className="text-[10px] font-medium">{border.name}</span>
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center gap-3 bg-muted px-4 py-3 rounded-xl border border-border/50">
          <span className="text-xs font-semibold text-muted-foreground w-12">Radius</span>
          <Slider
            value={[settings.rounded]}
            min={0}
            max={48}
            step={2}
            className="flex-1"
            onValueChange={([v]) => handleChange("rounded", v)}
          />
          <span className="text-xs font-semibold text-foreground w-6 text-right">{settings.rounded}</span>
        </div>
      </div>

      {/* Shadow Section */}
      <div className="space-y-4">
        <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Shadow</Label>
        <div className="grid grid-cols-3 gap-3">
          {SHADOWS.map((shadow) => (
            <button
              key={shadow.name}
              onClick={() => handleChange("shadowType", shadow.value)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-full aspect-square rounded-[18px] p-[1.5px] transition-all ${
                settings.shadowType === shadow.value
                  ? "bg-foreground shadow-sm"
                  : "bg-transparent group-hover:bg-muted"
              }`}>
                <div className="w-full h-full bg-background border border-border rounded-[16px] flex items-center justify-center relative overflow-hidden">
                  <div className={`w-3/4 h-3/4 bg-white border border-border rounded-xl ${shadow.preview}`} />
                </div>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{shadow.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-muted px-4 py-3 rounded-xl border border-border/50 transition-opacity" style={{ opacity: settings.shadowType === 'none' ? 0.5 : 1, pointerEvents: settings.shadowType === 'none' ? 'none' : 'auto' }}>
          <span className="text-xs font-semibold text-muted-foreground w-12">Opacity</span>
          <Slider
            value={[settings.shadow]}
            min={0}
            max={100}
            step={5}
            className="flex-1"
            onValueChange={([v]) => handleChange("shadow", v)}
          />
          <span className="text-xs font-semibold text-foreground w-6 text-right">{settings.shadow}</span>
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Background</Label>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.name}
              title={bg.name}
              onClick={() => handleChange("background", bg.value)}
              className={`h-12 w-full rounded-xl border-2 transition-all ${
                settings.background === bg.value ? "border-primary scale-105 shadow-md z-10" : "border-transparent hover:border-border"
              }`}
              style={{
                background: bg.bg || bg.value,
                backgroundImage: bg.value === "transparent" ? "repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%)" : bg.value,
                backgroundSize: bg.value === "transparent" ? "12px 12px" : "auto",
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
