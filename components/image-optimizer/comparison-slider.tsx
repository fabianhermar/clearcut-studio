"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface ComparisonSliderProps {
  originalSrc: string;
  optimizedSrc: string | null;
  formatLabel?: string;
  qualityLabel?: string;
  zoom?: number;
  viewMode?: "split" | "loupe";
  isProcessing?: boolean;
  lang?: string;
}

export function ComparisonSlider({
  originalSrc,
  optimizedSrc,
  formatLabel = "WEBP",
  qualityLabel,
  zoom = 1,
  viewMode = "split",
  isProcessing,
  lang = "es",
}: ComparisonSliderProps) {
  const isEn = lang === "en";
  const [sliderPos, setSliderPos] = useState(50);
  const [loupePos, setLoupePos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number, clientY?: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(x);
    if (clientY !== undefined) {
      const y = Math.max(8, Math.min(92, ((clientY - rect.top) / rect.height) * 100));
      setLoupePos({ x, y });
    } else {
      setLoupePos((p) => ({ ...p, x }));
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updatePosition(e.clientX, e.clientY);
    },
    [updatePosition]
  );

  const handleMouseMoveLocal = useCallback(
    (e: React.MouseEvent) => {
      if (viewMode === "loupe") {
        updatePosition(e.clientX, e.clientY);
      }
    },
    [viewMode, updatePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [updatePosition]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPos((p) => {
        const next = Math.max(4, p - step);
        setLoupePos((lp) => ({ ...lp, x: next }));
        return next;
      });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPos((p) => {
        const next = Math.min(96, p + step);
        setLoupePos((lp) => ({ ...lp, x: next }));
        return next;
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updatePosition(e.clientX, e.clientY);
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, updatePosition]);

  const zoomStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: viewMode === "loupe" ? `${loupePos.x}% ${loupePos.y}%` : "50% 50%",
    transition: isDragging ? "none" : "transform 0.2s ease-out",
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={
        isEn ? "Compare optimized and original image" : "Comparar imagen optimizada y original"
      }
      aria-valuemin={4}
      aria-valuemax={96}
      aria-valuenow={Math.round(sliderPos)}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMoveLocal}
      className={`relative w-full h-full select-none overflow-hidden rounded-[1.5rem] border border-[#242936] bg-[#0c0e12] darkroom-chassis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        viewMode === "loupe"
          ? "cursor-none"
          : isDragging
          ? "cursor-grabbing"
          : "cursor-ew-resize"
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Calibrated darkroom checkerboard */}
      <div className="absolute inset-0 checkerboard-dark" />

      {/* Optical viewfinder corner brackets */}
      <span className="pointer-events-none absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white/35 z-30" />
      <span className="pointer-events-none absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white/35 z-30" />
      <span className="pointer-events-none absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white/35 z-30" />
      <span className="pointer-events-none absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white/35 z-30" />

      {/* Original Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={originalSrc}
          alt={isEn ? "Original image" : "Imagen original"}
          className="w-full h-full object-contain"
          style={zoomStyle}
          draggable={false}
        />
      </div>

      {/* Optimized Layer (Clipped by Split Blade or Circular Loupe) */}
      {optimizedSrc && !isProcessing && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath:
              viewMode === "loupe"
                ? `circle(96px at ${loupePos.x}% ${loupePos.y}%)`
                : `inset(0 ${100 - sliderPos}% 0 0)`,
          }}
        >
          <img
            src={optimizedSrc}
            alt={isEn ? "Optimized image" : "Imagen optimizada"}
            className="w-full h-full object-contain"
            style={zoomStyle}
            draggable={false}
          />
        </div>
      )}

      {/* Processing overlay (always centered cleanly, never clipped by split line) */}
      {isProcessing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0c0e12]/55 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2.5 px-5 py-4 rounded-2xl bg-[#14171f] border border-[#242936] shadow-2xl">
            <div className="w-6 h-6 border-2 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[11px] text-white font-semibold tracking-wider">
              {isEn ? `ENCODING ${formatLabel} // WASM...` : `CODIFICANDO ${formatLabel} // WASM...`}
            </span>
          </div>
        </div>
      )}

      {/* Optical HUD Labels */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="px-2.5 py-1 bg-[#1e40ff] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-md shadow-md">
          OPT // {formatLabel}
          {qualityLabel ? ` · ${qualityLabel}` : ""}
        </span>
        {zoom > 1 && (
          <span className="px-2 py-1 bg-[#0c0e12]/85 backdrop-blur-md border border-white/15 text-[#ff834d] font-mono text-[10px] font-bold rounded-md">
            {zoom}.0× ZOOM
          </span>
        )}
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <span className="px-2.5 py-1 bg-[#0c0e12]/85 backdrop-blur-md border border-white/15 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-md">
          RAW // ORIGINAL
        </span>
      </div>

      {/* Circular Optical Loupe Ring */}
      {optimizedSrc && !isProcessing && viewMode === "loupe" && (
        <div
          className="pointer-events-none absolute z-20 w-[192px] h-[192px] -translate-x-1/2 -translate-y-1/2 rounded-full optical-loupe-ring"
          style={{ left: `${loupePos.x}%`, top: `${loupePos.y}%` }}
        >
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#1e40ff] text-[9px] font-mono font-bold text-white">
            {formatLabel}
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff4d00]" />
        </div>
      )}

      {/* Precision Metallic Split Blade Handle */}
      {optimizedSrc && viewMode === "split" && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.65)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-[#0c0e12] text-[#0c0e12]">
            <MoveHorizontal className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}
