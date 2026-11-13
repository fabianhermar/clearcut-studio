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
  if (pct >= 60) return "#15803d";
  if (pct >= 30) return "#1e40ff";
  if (pct >= 0) return "#b45309";
  return "#b91c1c";
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
  const savingsColor = savings !== null ? getSavingsColor(savings) : "#475569";

  return (
    <div className="space-y-2.5">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        TELEMETRÍA DE ARCHIVO
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        {/* Size comparison */}
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-3.5 text-center">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Original
            </div>
            <div className="text-sm font-bold text-foreground font-mono tabular-nums">
              {formatBytes(originalSize)}
            </div>
          </div>
          <div className="p-3.5 text-center">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              {format.toUpperCase()}
            </div>
            {isProcessing ? (
              <div className="flex items-center justify-center py-0.5">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : optimizedSize !== null ? (
              <div className="text-sm font-bold font-mono tabular-nums" style={{ color: savingsColor }}>
                {formatBytes(optimizedSize)}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground font-mono">—</div>
            )}
          </div>
        </div>

        {/* Savings bar */}
        {savings !== null && !isProcessing && (
          <div className="border-t border-border p-3.5 bg-card">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Reducción
              </span>
              <span
                className="text-xs font-bold font-mono tabular-nums"
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
        <div className="border-t border-border px-3.5 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Resolución
          </span>
          <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
            {width} × {height} px
          </span>
        </div>
      </div>
    </div>
  );
}
