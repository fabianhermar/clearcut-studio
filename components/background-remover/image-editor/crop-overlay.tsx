interface CropOverlayProps {
  cropRect: { x: number; y: number; width: number; height: number };
  canvasSize: { width: number; height: number };
}

export function CropOverlay({ cropRect, canvasSize }: CropOverlayProps) {
  if (cropRect.width <= 0 || cropRect.height <= 0) return null;

  return (
    <div
      className="absolute pointer-events-none border-2 border-white shadow-lg"
      style={{
        left: (cropRect.x / canvasSize.width) * 100 + "%",
        top: (cropRect.y / canvasSize.height) * 100 + "%",
        width: (cropRect.width / canvasSize.width) * 100 + "%",
        height: (cropRect.height / canvasSize.height) * 100 + "%",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
      }}
    >
      {/* Corner handles */}
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full shadow" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full shadow" />
    </div>
  );
}
