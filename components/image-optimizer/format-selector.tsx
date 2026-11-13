"use client";

export type ImageFormat = "webp" | "avif" | "jpeg" | "png";

interface Format {
  id: ImageFormat;
  label: string;
  description: string;
  extension: string;
  supportsQuality: boolean;
  icon: string;
  color: string;
}

const FORMATS: Format[] = [
  {
    id: "webp",
    label: "WebP",
    description: "Balance ideal peso / calidad.",
    extension: ".webp",
    supportsQuality: true,
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    color: "#1e40ff",
  },
  {
    id: "avif",
    label: "AVIF",
    description: "Compresión moderna extrema.",
    extension: ".avif",
    supportsQuality: true,
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    color: "#ff4d00",
  },
  {
    id: "jpeg",
    label: "MozJPEG",
    description: "Compatibilidad universal foto.",
    extension: ".jpg",
    supportsQuality: true,
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "#b45309",
  },
  {
    id: "png",
    label: "PNG",
    description: "Sin pérdida con alpha.",
    extension: ".png",
    supportsQuality: false,
    icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    color: "#0f766e",
  },
];

interface FormatSelectorProps {
  selected: ImageFormat;
  onChange: (format: ImageFormat) => void;
}

export function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          CÓDEC DE SALIDA
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">WASM</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map((format) => {
          const isSelected = selected === format.id;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => onChange(format.id)}
              className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/8 text-foreground shadow-soft"
                  : "border-border bg-background text-foreground hover:border-foreground/30 hover:bg-muted/50"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 border border-border/60"
                style={{ backgroundColor: `${format.color}14` }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={format.color}
                  strokeWidth="2"
                >
                  <path d={format.icon} />
                </svg>
              </div>
              <div className="font-bold text-sm text-foreground font-heading">{format.label}</div>
              <div className="text-[11px] text-muted-foreground font-accent leading-tight mt-0.5">
                {format.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { FORMATS };
