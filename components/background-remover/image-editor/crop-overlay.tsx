interface CropOverlayProps {
  cropRect: { x: number; y: number; width: number; height: number };
  canvasSize: { width: number; height: number };
}

export function CropOverlay({ cropRect, canvasSize }: CropOverlayProps) {
  if (cropRect.width <= 0 || cropRect.height <= 0 || canvasSize.width <= 0) return null;

  return (
    <div
      className="absolute pointer-events-none border-2 border-white"
      style={{
        left: `${(cropRect.x / canvasSize.width) * 100}%`,
        top: `${(cropRect.y / canvasSize.height) * 100}%`,
        width: `${(cropRect.width / canvasSize.width) * 100}%`,
        height: `${(cropRect.height / canvasSize.height) * 100}%`,
        boxShadow: "0 0 0 9999px rgba(8, 10, 14, 0.72)",
      }}
    >
      {/* Live dimension pill */}
      <div className="absolute -top-7 left-0 px-2 py-0.5 rounded bg-[#0c0e12] border border-white/25 font-mono text-[10px] font-semibold text-white whitespace-nowrap tabular-nums">
        {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
      </div>

      {/* Rule of thirds optical guides */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        <div className="border-r border-b border-white/25" />
        <div className="border-r border-b border-white/25" />
        <div className="border-b border-white/25" />
        <div className="border-r border-b border-white/25" />
        <div className="border-r border-b border-white/25" />
        <div className="border-b border-white/25" />
        <div className="border-r border-white/25" />
        <div className="border-r border-white/25" />
        <div />
      </div>

      {/* Corner calibration brackets */}
      <span className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-[3px] border-l-[3px] border-accent" />
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-[3px] border-r-[3px] border-accent" />
      <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-[3px] border-l-[3px] border-accent" />
      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-[3px] border-r-[3px] border-accent" />
    </div>
  );
}
