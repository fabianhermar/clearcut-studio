"use client";

interface OptimizerStatsProps {
  originalSize: number;
  optimizedSize: number | null;
  width: number;
  height: number;
  format: string;
  isProcessing?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSavingsColor(pct: number): string {
  if (pct >= 60) return "#10b981"; // green
  if (pct >= 30) return "#3b82f6"; // blue
  if (pct >= 0) return "#f59e0b";  // amber
  return "#ef4444";                 // red (larger than original)
}

export function OptimizerStats({
  originalSize,
  optimizedSize,
  width,
  height,
  format,
  isProcessing,
}: OptimizerStatsProps) {
  const savings =
    optimizedSize !== null ? ((originalSize - optimizedSize) / originalSize) * 100 : null;
  const savingsColor = savings !== null ? getSavingsColor(savings) : "#64748b";

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-accent">
        Estadísticas
      </label>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Size comparison */}
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-3 text-center">
            <div className="text-xs text-muted-foreground font-accent mb-1">Original</div>
            <div className="text-sm font-bold text-foreground font-heading">
              {formatBytes(originalSize)}
            </div>
          </div>
          <div className="p-3 text-center">
            <div className="text-xs text-muted-foreground font-accent mb-1">
              {format.toUpperCase()}
            </div>
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : optimizedSize !== null ? (
              <div className="text-sm font-bold font-heading" style={{ color: savingsColor }}>
                {formatBytes(optimizedSize)}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground font-heading">—</div>
            )}
          </div>
        </div>

        {/* Savings bar */}
        {savings !== null && !isProcessing && (
          <div className="border-t border-border p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-accent">Reducción</span>
              <span
                className="text-xs font-bold font-heading"
                style={{ color: savingsColor }}
              >
                {savings >= 0 ? `-${savings.toFixed(1)}%` : `+${Math.abs(savings).toFixed(1)}%`}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.abs(savings))}%`,
                  backgroundColor: savingsColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Dimensions */}
        <div className="border-t border-border px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-accent">Dimensiones</span>
          <span className="text-xs font-medium text-foreground font-accent">
            {width} × {height} px
          </span>
        </div>
      </div>
    </div>
  );
}
