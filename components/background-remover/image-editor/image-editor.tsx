"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useImageHistory } from "@/hooks/use-image-history";
import { useZoomPan } from "@/hooks/use-zoom-pan";
import { applyImageAdjustments } from "@/lib/image-processing";
import { getCanvasCoords, applyBrush, cropImageData } from "@/lib/canvas-utils";
import { downloadCanvasAsImage } from "@/lib/download-utils";
import { DEFAULT_ADJUSTMENTS } from "@/lib/constants";
import type { ToolId, Adjustments, ExportFormat } from "@/lib/constants";

import { EditorToolbar } from "./editor-toolbar";
import { ToolsPanel, type MatteMode } from "./tools-panel";
import { AdjustmentsPanel } from "./adjustments-panel";
import { ExportPanel } from "./export-panel";
import { CropOverlay } from "./crop-overlay";
import { ZoomControls } from "./zoom-controls";

interface ImageEditorProps {
  originalImage: string;
  processedImage: string;
  onReset: () => void;
  onClose?: () => void;
  onFileSelect: (file: File) => void;
  lang?: string;
}

export function ImageEditor({
  originalImage,
  processedImage,
  onReset,
  onClose,
  onFileSelect,
  lang = "es",
}: ImageEditorProps) {
  const isEn = lang === "en";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  // Tool & matte state
  const [tool, setTool] = useState<ToolId>("move");
  const [brushSize, setBrushSize] = useState(30);
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [activeTab, setActiveTab] = useState<"tools" | "adjust" | "export">("tools");
  const [matteMode, setMatteMode] = useState<MatteMode>("checker-light");
  const [solidColor, setSolidColor] = useState("#ffffff");
  const [bakeBackground, setBakeBackground] = useState(false);

  // Brush cursor indicator over viewport
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Image data state
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [initialMaskData, setInitialMaskData] = useState<ImageData | null>(null);
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);
  const [currentImageData, setCurrentImageData] = useState<ImageData | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [editedImage, setEditedImage] = useState<string | null>(null);

  // Interaction state
  const [isDrawing, setIsDrawing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);

  // Custom hooks
  const { zoom, setZoom, pan, setPan, zoomIn, zoomOut, resetZoom } = useZoomPan();
  const { initHistory, saveToHistory, undo: historyUndo, redo: historyRedo, canUndo, canRedo } =
    useImageHistory();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateViewportSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setViewportSize({
        width: Math.max(120, width - 48),
        height: Math.max(120, height - 64),
      });
    };

    updateViewportSize();

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const fitScale =
    canvasSize.width > 0 &&
    canvasSize.height > 0 &&
    viewportSize.width > 0 &&
    viewportSize.height > 0
      ? Math.min(viewportSize.width / canvasSize.width, viewportSize.height / canvasSize.height)
      : 1;

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [fitScale, setPan]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const processedImg = new Image();
    processedImg.crossOrigin = "anonymous";
    processedImg.src = processedImage;

    const originalImg = new Image();
    originalImg.crossOrigin = "anonymous";
    originalImg.src = originalImage;

    Promise.all([
      new Promise((r) => (processedImg.onload = r)),
      new Promise((r) => (originalImg.onload = r)),
    ]).then(() => {
      canvas.width = processedImg.naturalWidth;
      canvas.height = processedImg.naturalHeight;
      setCanvasSize({ width: canvas.width, height: canvas.height });

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
      setOriginalImageData(tempCtx.getImageData(0, 0, canvas.width, canvas.height));

      ctx.drawImage(processedImg, 0, 0);
      const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const initialCopy = new ImageData(
        new Uint8ClampedArray(baseData.data),
        baseData.width,
        baseData.height
      );
      setInitialMaskData(initialCopy);
      setBaseImageData(baseData);
      setCurrentImageData(
        new ImageData(new Uint8ClampedArray(baseData.data), baseData.width, baseData.height)
      );

      initHistory(baseData);
      setCropRect({ x: 0, y: 0, width: canvas.width, height: canvas.height });
    });
  }, [processedImage, originalImage, initHistory]);

  // Apply adjustments
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImageData) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const adjustedData = applyImageAdjustments(currentImageData, adjustments);
    ctx.putImageData(adjustedData, 0, 0);
  }, [adjustments, currentImageData]);

  // Output preview update
  const updateOutput = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        setEditedImage((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      }
    }, "image/png");
  }, []);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const data = historyUndo();
    if (data) setCurrentImageData(data);
  }, [historyUndo]);

  const handleRedo = useCallback(() => {
    const data = historyRedo();
    if (data) setCurrentImageData(data);
  }, [historyRedo]);

  // Keyboard shortcuts for pro editing flow
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "v") {
        setTool("move");
        setCropMode(false);
      } else if (key === "b") {
        setTool("recover");
        setCropMode(false);
      } else if (key === "e") {
        setTool("erase");
        setCropMode(false);
      } else if (key === "c") {
        setTool("crop");
      } else if (key === "[") {
        setBrushSize((s) => Math.max(5, s - 5));
      } else if (key === "]") {
        setBrushSize((s) => Math.min(100, s + 5));
      } else if (e.code === "Space") {
        e.preventDefault();
        setShowOriginal(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setShowOriginal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleUndo, handleRedo]);

  // Drawing
  const draw = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !originalImageData || !currentImageData) return;

      const newImageData = applyBrush(
        currentImageData,
        originalImageData,
        tool,
        x,
        y,
        brushSize,
        canvas.width,
        canvas.height
      );
      setCurrentImageData(newImageData);
    },
    [tool, brushSize, originalImageData, currentImageData]
  );

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coords = getCanvasCoords(canvas, e);
    lastPos.current = coords;

    if (tool === "crop") {
      setCropStart(coords);
      setIsCropping(true);
      setCropRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
    } else if (tool === "move") {
      setIsDrawing(true);
    } else {
      setIsDrawing(true);
      draw(coords.x, coords.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setCursorPos({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const coords = getCanvasCoords(canvas, e);

    if (isCropping && tool === "crop") {
      const width = coords.x - cropStart.x;
      const height = coords.y - cropStart.y;
      setCropRect({
        x: width > 0 ? cropStart.x : coords.x,
        y: height > 0 ? cropStart.y : coords.y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
    } else if (isDrawing) {
      if (tool === "move") {
        const dx = (coords.x - lastPos.current.x) * fitScale;
        const dy = (coords.y - lastPos.current.y) * fitScale;
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      } else {
        draw(coords.x, coords.y);
      }
    }
    lastPos.current = coords;
  };

  const handleMouseUp = () => {
    if (isDrawing && (tool === "recover" || tool === "erase")) {
      if (currentImageData) saveToHistory(currentImageData);
      updateOutput();
    }
    if (isCropping) {
      setIsCropping(false);
      setCropMode(true);
    }
    setIsDrawing(false);
  };

  // Crop
  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImageData) return;

    const { x, y, width, height } = cropRect;
    if (width < 10 || height < 10) return;

    const ctx = canvas.getContext("2d")!;
    const sourceData = ctx.getImageData(x, y, width, height);

    canvas.width = width;
    canvas.height = height;
    setCanvasSize({ width, height });
    ctx.putImageData(sourceData, 0, 0);

    const newImageData = ctx.getImageData(0, 0, width, height);
    setCurrentImageData(newImageData);
    setBaseImageData(new ImageData(new Uint8ClampedArray(newImageData.data), width, height));

    if (originalImageData) {
      setOriginalImageData(cropImageData(originalImageData, { x, y, width, height }));
    }

    setCropRect({ x: 0, y: 0, width, height });
    setCropMode(false);
    setTool("move");
    saveToHistory(newImageData);
    updateOutput();
  };

  const cancelCrop = () => {
    setCropMode(false);
    setCropRect({ x: 0, y: 0, width: canvasSize.width, height: canvasSize.height });
    setTool("move");
  };

  const resetAdjustments = () => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    if (!baseImageData) return;
    setCurrentImageData(
      new ImageData(
        new Uint8ClampedArray(baseImageData.data),
        baseImageData.width,
        baseImageData.height
      )
    );
  };

  const handleResetMask = () => {
    if (!initialMaskData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = initialMaskData.width;
    canvas.height = initialMaskData.height;
    setCanvasSize({ width: initialMaskData.width, height: initialMaskData.height });
    const resetCopy = new ImageData(
      new Uint8ClampedArray(initialMaskData.data),
      initialMaskData.width,
      initialMaskData.height
    );
    setBaseImageData(resetCopy);
    setCurrentImageData(
      new ImageData(
        new Uint8ClampedArray(initialMaskData.data),
        initialMaskData.width,
        initialMaskData.height
      )
    );
    saveToHistory(resetCopy);
    updateOutput();
  };

  const activeSolidHex = matteMode === "solid" && bakeBackground ? solidColor : null;

  const handleDownload = (format: ExportFormat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvasAsImage(canvas, format, "clearcut-cutout", activeSolidHex);
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.max(0.25, Math.min(4, Number((z + delta).toFixed(2)))));
  };

  const brushDiameterPx = Math.max(6, brushSize * fitScale * zoom);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <EditorToolbar
        canvasSize={canvasSize}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={onReset}
        onClose={onClose}
        showOriginal={showOriginal}
        onToggleOriginal={setShowOriginal}
        lang={lang}
      />

      {/* Main Light Optical Atelier Workstation Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Inspector Rail */}
        <aside className="w-full lg:w-76 bg-card border-t lg:border-t-0 lg:border-r border-border flex flex-col shrink-0 order-2 lg:order-1 h-[44vh] lg:h-auto">
          {/* Segmented Studio Mode Tabs */}
          <div className="p-2.5 border-b border-border bg-background/60">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-background border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("tools")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "tools"
                    ? "bg-foreground text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isEn ? "Retouch" : "Retoque"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("adjust")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "adjust"
                    ? "bg-foreground text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isEn ? "Color" : "Ajustes"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("export")}
                className={`col-span-2 lg:hidden px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "export"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isEn ? "Export Cutout" : "Exportar recorte"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "adjust" ? (
              <AdjustmentsPanel
                adjustments={adjustments}
                setAdjustments={setAdjustments}
                onReset={resetAdjustments}
                lang={lang}
              />
            ) : activeTab === "export" ? (
              <div className="lg:hidden">
                <ExportPanel
                  processedImage={editedImage || processedImage}
                  canvasSize={canvasSize}
                  onDownload={handleDownload}
                  onUploadAnother={() => fileInputRef.current?.click()}
                  solidMatteHex={activeSolidHex}
                  lang={lang}
                  className="border-none"
                />
              </div>
            ) : (
              <ToolsPanel
                tool={tool}
                setTool={setTool}
                brushSize={brushSize}
                setBrushSize={setBrushSize}
                cropMode={cropMode}
                setCropMode={setCropMode}
                cropRect={cropRect}
                onApplyCrop={applyCrop}
                onCancelCrop={cancelCrop}
                showOriginal={showOriginal}
                setShowOriginal={setShowOriginal}
                matteMode={matteMode}
                setMatteMode={setMatteMode}
                solidColor={solidColor}
                setSolidColor={setSolidColor}
                bakeBackground={bakeBackground}
                setBakeBackground={setBakeBackground}
                onResetMask={handleResetMask}
                lang={lang}
              />
            )}
          </div>
        </aside>

        {/* Central Optical Drafting Stage (Light Mode) */}
        <main
          ref={containerRef}
          onWheel={handleWheelZoom}
          onMouseLeave={() => {
            setCursorPos(null);
            handleMouseUp();
          }}
          className="w-full flex-1 relative shrink-0 order-1 lg:order-2 min-h-[46vh] bg-[#ebe8e0] studio-grid overflow-hidden select-none"
        >
          {/* Top subtle stage indicator */}
          <div className="pointer-events-none absolute top-3.5 left-4 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-card/95 backdrop-blur-md border border-border font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-2xs">
              {showOriginal
                ? isEn
                  ? "VIEW // ORIGINAL"
                  : "VISTA // ORIGINAL"
                : matteMode === "solid"
                ? `MATTE // ${solidColor.toUpperCase()}`
                : "ALPHA // CUTOUT"}
            </span>
          </div>

          {/* Artboard Canvas Container */}
          <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
            <div
              className={`relative rounded-xl overflow-hidden border border-border shadow-[0_24px_60px_-18px_rgba(17,19,24,0.22)] ${
                matteMode === "checker-dark"
                  ? "checkerboard-dark"
                  : matteMode === "checker-light"
                  ? "checkerboard"
                  : ""
              }`}
              style={{
                width: `${canvasSize.width * fitScale}px`,
                height: `${canvasSize.height * fitScale}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                backgroundColor: matteMode === "solid" ? solidColor : undefined,
              }}
            >
              <img
                src={originalImage}
                alt="Original"
                style={{ width: "100%", height: "100%", display: showOriginal ? "block" : "none" }}
                className="object-contain"
                draggable={false}
              />
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={
                  tool === "move"
                    ? "cursor-grab active:cursor-grabbing"
                    : tool === "crop"
                    ? "cursor-crosshair"
                    : "cursor-none"
                }
                style={{ width: "100%", height: "100%", display: showOriginal ? "none" : "block" }}
              />
              {tool === "crop" && (cropMode || isCropping) && !showOriginal && (
                <CropOverlay cropRect={cropRect} canvasSize={canvasSize} />
              )}
            </div>
          </div>

          {/* Live Proportional Brush Ring Cursor */}
          {(tool === "recover" || tool === "erase") && cursorPos && !showOriginal && (
            <div
              className="pointer-events-none absolute z-30 rounded-full border-2 border-foreground shadow-[0_0_0_2px_rgba(255,255,255,0.9)]"
              style={{
                width: `${brushDiameterPx}px`,
                height: `${brushDiameterPx}px`,
                left: `${cursorPos.x - brushDiameterPx / 2}px`,
                top: `${cursorPos.y - brushDiameterPx / 2}px`,
                backgroundColor:
                  tool === "recover"
                    ? "rgba(30, 64, 255, 0.2)"
                    : "rgba(255, 77, 0, 0.2)",
              }}
              aria-hidden="true"
            />
          )}

          <ZoomControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            lang={lang}
          />
        </main>

        {/* Right Export Inspector Dock (Desktop) */}
        <ExportPanel
          processedImage={editedImage || processedImage}
          canvasSize={canvasSize}
          onDownload={handleDownload}
          onUploadAnother={() => fileInputRef.current?.click()}
          solidMatteHex={activeSolidHex}
          lang={lang}
          className="hidden lg:flex order-3"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}
