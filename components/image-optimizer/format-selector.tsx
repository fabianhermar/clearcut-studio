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
    description: "Mejor balance calidad/tamaño. Ideal para web.",
    extension: ".webp",
    supportsQuality: true,
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    color: "#3b82f6",
  },
  {
    id: "avif",
    label: "AVIF",
    description: "Máxima compresión con calidad superior.",
    extension: ".avif",
    supportsQuality: true,
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    color: "#8b5cf6",
  },
  {
    id: "jpeg",
    label: "JPEG",
    description: "Compatible con todo. Excelente para fotos.",
    extension: ".jpg",
    supportsQuality: true,
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "#f59e0b",
  },
  {
    id: "png",
    label: "PNG",
    description: "Sin pérdida. Perfecto para transparencias.",
    extension: ".png",
    supportsQuality: false,
    icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    color: "#10b981",
  },
];

interface FormatSelectorProps {
  selected: ImageFormat;
  onChange: (format: ImageFormat) => void;
}

export function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-accent">
        Formato de salida
      </label>
      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map((format) => {
          const isSelected = selected === format.id;
          return (
            <button
              key={format.id}
              onClick={() => onChange(format.id)}
              className={`relative p-3 rounded-xl border text-left transition-all group ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${format.color}20` }}
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
              <div className="text-xs text-muted-foreground font-accent leading-tight mt-0.5">
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
