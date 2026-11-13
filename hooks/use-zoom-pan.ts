"use client";

import { useState, useCallback } from "react";

export function useZoomPan(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return { zoom, setZoom, pan, setPan, zoomIn, zoomOut, resetZoom };
}
