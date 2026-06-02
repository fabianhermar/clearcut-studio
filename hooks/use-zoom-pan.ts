"use client";

import { useState, useCallback } from "react";

export function useZoomPan(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(4, z + 0.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.25, z - 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return { zoom, pan, setPan, zoomIn, zoomOut, resetZoom };
}
