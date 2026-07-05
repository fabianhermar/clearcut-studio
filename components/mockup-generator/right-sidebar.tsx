import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FramedSettings, AspectRatio } from "./types";
import { MoveHorizontal, MoveVertical, Search, Maximize, CircleDashed, Square } from "lucide-react";

interface RightSidebarProps {
  settings: FramedSettings;
  setSettings: (settings: FramedSettings) => void;
}

const RATIOS: { name: string; value: AspectRatio; icon?: React.ReactNode }[] = [
  { name: "Auto", value: "auto" },
  { name: "16:9", value: "16:9" },
  { name: "4:3", value: "4:3" },
  { name: "1:1", value: "1:1" },
  { name: "9:16", value: "9:16" },
];

export function RightSidebar({ settings, setSettings }: RightSidebarProps) {
  const handleChange = (key: keyof FramedSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 font-accent p-6 bg-card border-l border-border overflow-y-auto overflow-x-hidden">
      
      {/* Aspect Ratio */}
      <div className="space-y-3">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Aspect Ratio</Label>
        <div className="grid grid-cols-5 gap-1 p-1 bg-muted rounded-xl">
          {RATIOS.map((ratio) => (
            <button
              key={ratio.name}
              onClick={() => handleChange("aspectRatio", ratio.value)}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                settings.aspectRatio === ratio.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ratio.name}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border my-2" />

      {/* Frame Adjustments */}
      <div className="space-y-6">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Adjustments</Label>
        
        {/* Padding */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Maximize size={16} className="text-muted-foreground" />
              <span>Padding</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{settings.padding}</span>
          </div>
          <Slider
            value={[settings.padding]}
            min={0}
            max={128}
            step={4}
            onValueChange={([v]) => handleChange("padding", v)}
          />
        </div>
      </div>

      <div className="w-full h-px bg-border my-2" />

      {/* Tilt & Zoom */}
      <div className="space-y-6">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Transform (3D)</Label>
        
        {/* Zoom */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Search size={16} className="text-muted-foreground" />
              <span>Zoom</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{settings.zoom}%</span>
          </div>
          <Slider
            value={[settings.zoom]}
            min={50}
            max={150}
            step={1}
            onValueChange={([v]) => handleChange("zoom", v)}
          />
        </div>

        {/* Tilt X */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MoveHorizontal size={16} className="text-muted-foreground" />
              <span>Tilt X</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{settings.tiltX}°</span>
          </div>
          <Slider
            value={[settings.tiltX]}
            min={-45}
            max={45}
            step={1}
            onValueChange={([v]) => handleChange("tiltX", v)}
          />
        </div>

        {/* Tilt Y */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MoveVertical size={16} className="text-muted-foreground" />
              <span>Tilt Y</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{settings.tiltY}°</span>
          </div>
          <Slider
            value={[settings.tiltY]}
            min={-45}
            max={45}
            step={1}
            onValueChange={([v]) => handleChange("tiltY", v)}
          />
        </div>
      </div>

    </div>
  );
}
