"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface ComparisonSliderProps {
  originalSrc: string;
  optimizedSrc: string | null;
  isProcessing?: boolean;
}

export function ComparisonSlider({ originalSrc, optimizedSrc, isProcessing }: ComparisonSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, x)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

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
      className="relative w-full h-full select-none overflow-hidden rounded-xl"
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
          alt="Original"
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
            alt="Optimizada"
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
          <div className="w-full h-full flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground font-accent">Optimizando...</span>
            </div>
          </div>
        </div>
      )}

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full font-accent">
          Optimizada
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full font-accent">
          Original
        </span>
      </div>

      {/* Slider line */}
      {optimizedSrc && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Line */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg" />
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border border-border/50 pointer-events-auto cursor-grab active:cursor-grabbing">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M8 3L4 7l4 4M16 3l4 4-4 4" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
