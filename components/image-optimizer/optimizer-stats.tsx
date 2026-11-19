"use client";

interface OptimizerStatsProps {
  originalSize: number;
  optimizedSize: number | null;
  width: number;
  height: number;
  format: string;
  isProcessing?: boolean;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSavingsAccent(pct: number): { text: string; bar: string } {
  if (pct >= 60) return { text: "text-emerald-400", bar: "#34d399" };
  if (pct >= 25) return { text: "text-[#60a5fa]", bar: "#1e40ff" };
  if (pct >= 0) return { text: "text-amber-400", bar: "#f59e0b" };
  return { text: "text-red-400", bar: "#ef4444" };
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
    optimizedSize !== null && originalSize > 0
      ? ((originalSize - optimizedSize) / originalSize) * 100
      : null;
  const bytesSaved =
    optimizedSize !== null ? originalSize - optimizedSize : null;
  const accent =
    savings !== null
      ? getSavingsAccent(savings)
      : { text: "text-slate-400", bar: "#475569" };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          TELEMETRÍA DE ARCHIVO
        </span>
        <span className="font-mono text-[10px] font-semibold text-emerald-700">
          0 B SUBIDOS
        </span>
      </div>

      {/* Darkroom Hardware Telemetry Chassis */}
      <div className="rounded-2xl border border-[#242936] bg-[#0c0e12] text-white overflow-hidden shadow-sm">
        {/* Original vs Optimized */}
        <div className="grid grid-cols-2 divide-x divide-[#242936]">
          <div className="p-3.5">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">
              ORIGINAL
            </div>
            <div className="text-sm font-bold text-slate-200 font-mono tabular-nums">
              {formatBytes(originalSize)}
            </div>
          </div>
          <div className="p-3.5">
            <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-1">
              SALIDA · {format.toUpperCase()}
            </div>
            {isProcessing ? (
              <div className="flex items-center py-0.5">
                <div className="w-3.5 h-3.5 border-2 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : optimizedSize !== null ? (
              <div className={`text-sm font-bold font-mono tabular-nums ${accent.text}`}>
                {formatBytes(optimizedSize)}
              </div>
            ) : (
              <div className="text-sm text-slate-500 font-mono">—</div>
            )}
          </div>
        </div>

        {/* Delta / Savings Meter */}
        {savings !== null && !isProcessing && (
          <div className="border-t border-[#242936] p-3.5 bg-[#11141c]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                {bytesSaved !== null && bytesSaved >= 0
                  ? `AHORRO (${formatBytes(bytesSaved)})`
                  : "DELTA DE PESO"}
              </span>
              <span className={`text-xs font-bold font-mono tabular-nums ${accent.text}`}>
                {savings >= 0 ? `-${savings.toFixed(1)}%` : `+${Math.abs(savings).toFixed(1)}%`}
              </span>
            </div>
            <div className="h-1.5 bg-[#1e2330] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(4, Math.abs(savings)))}%`,
                  backgroundColor: accent.bar,
                }}
              />
            </div>
          </div>
        )}

        {/* Resolution footer */}
        <div className="border-t border-[#242936] px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>SALIDA PX</span>
          <span className="text-slate-200 font-semibold tabular-nums">
            {width} × {height} px
          </span>
        </div>
      </div>
    </div>
  );
}
