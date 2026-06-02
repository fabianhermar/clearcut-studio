"use client";

import { useState, useCallback } from "react";

export function useImageHistory() {
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const initHistory = useCallback((imageData: ImageData) => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    setHistory([copy]);
    setHistoryIndex(0);
  }, []);

  const saveToHistory = useCallback(
    (imageData: ImageData) => {
      const copy = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        return [...newHistory, copy];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const undo = useCallback((): ImageData | null => {
    if (historyIndex <= 0) return null;
    const prevIndex = historyIndex - 1;
    const prevData = history[prevIndex];
    setHistoryIndex(prevIndex);
    return new ImageData(
      new Uint8ClampedArray(prevData.data),
      prevData.width,
      prevData.height
    );
  }, [history, historyIndex]);

  const redo = useCallback((): ImageData | null => {
    if (historyIndex >= history.length - 1) return null;
    const nextIndex = historyIndex + 1;
    const nextData = history[nextIndex];
    setHistoryIndex(nextIndex);
    return new ImageData(
      new Uint8ClampedArray(nextData.data),
      nextData.width,
      nextData.height
    );
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return { initHistory, saveToHistory, undo, redo, canUndo, canRedo, historyIndex };
}
