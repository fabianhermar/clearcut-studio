"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface ComparisonSliderProps {
  originalSrc: string;
  optimizedSrc: string | null;
  isProcessing?: boolean;
  lang?: string;
}

export function ComparisonSlider({
  originalSrc,
  optimizedSrc,
  isProcessing,
  lang = "es",
}: ComparisonSliderProps) {
  const isEn = lang === "en";
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(4, Math.min(96, x)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPos((p) => Math.max(4, p - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPos((p) => Math.min(96, p + step));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updatePosition(e.clientX);
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) updatePosition(e.touches[0].clientX);
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

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={isEn ? "Compare optimized and original image" : "Comparar imagen optimizada y original"}
      aria-valuemin={4}
      aria-valuemax={96}
      aria-valuenow={Math.round(sliderPos)}
      onKeyDown={handleKeyDown}
      className="relative w-full h-full select-none overflow-hidden rounded-2xl border border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
      style={{ cursor: isDragging ? "grabbing" : "ew-resize" }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Checkerboard background for transparency */}
      <div className="absolute inset-0 checkerboard" />

      {/* Original (right side) */}
      <div className="absolute inset-0">
        <img
          src={originalSrc}
          alt={isEn ? "Original image" : "Imagen original"}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Optimized (left side clipped) */}
      {optimizedSrc && !isProcessing && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={optimizedSrc}
            alt={isEn ? "Optimized image" : "Imagen optimizada"}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <div className="w-full h-full flex items-center justify-center bg-card/80 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-card border border-border shadow-sm">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-foreground font-semibold">
                {isEn ? "Encoding with WASM..." : "Codificando con WASM..."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <span className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-md shadow-xs">
          {isEn ? "Optimized" : "Optimizada"}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold rounded-md">
          {isEn ? "Original" : "Original"}
        </span>
      </div>

      {/* Slider line */}
      {optimizedSrc && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-md" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-300 text-slate-800">
            <MoveHorizontal className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}
