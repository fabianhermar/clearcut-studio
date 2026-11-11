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
import { ToolsPanel } from "./tools-panel";
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

  // Tool state
  const [tool, setTool] = useState<ToolId>("move");
  const [brushSize, setBrushSize] = useState(30);
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [activeTab, setActiveTab] = useState<"tools" | "adjust" | "export">("tools");

  // Image data state
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
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
  const { zoom, pan, setPan, zoomIn, zoomOut } = useZoomPan();
  const { initHistory, saveToHistory, undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useImageHistory();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateViewportSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setViewportSize({ width, height });
    };

    updateViewportSize();

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const fitScale =
    canvasSize.width > 0 && canvasSize.height > 0 && viewportSize.width > 0 && viewportSize.height > 0
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

      // Store original
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
      setOriginalImageData(tempCtx.getImageData(0, 0, canvas.width, canvas.height));

      // Draw processed
      ctx.drawImage(processedImg, 0, 0);
      const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setBaseImageData(baseData);
      setCurrentImageData(new ImageData(new Uint8ClampedArray(baseData.data), baseData.width, baseData.height));

      // Initialize history
      initHistory(baseData);

      // Initialize crop rect to full image
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

  // Output update
  const updateOutput = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        if (editedImage) URL.revokeObjectURL(editedImage);
        setEditedImage(URL.createObjectURL(blob));
      }
    }, "image/png");
  }, [editedImage]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const data = historyUndo();
    if (data) setCurrentImageData(data);
  }, [historyUndo]);

  const handleRedo = useCallback(() => {
    const data = historyRedo();
    if (data) setCurrentImageData(data);
  }, [historyRedo]);

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
        const dx = coords.x - lastPos.current.x;
        const dy = coords.y - lastPos.current.y;
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

    // Update main canvas
    canvas.width = width;
    canvas.height = height;
    setCanvasSize({ width, height });
    ctx.putImageData(sourceData, 0, 0);

    // Update image data states
    const newImageData = ctx.getImageData(0, 0, width, height);
    setCurrentImageData(newImageData);
    setBaseImageData(new ImageData(new Uint8ClampedArray(newImageData.data), width, height));

    // Crop original image data too
    if (originalImageData) {
      setOriginalImageData(cropImageData(originalImageData, { x, y, width, height }));
    }

    setCropRect({ x: 0, y: 0, width, height });
    setCropMode(false);
    setTool("move");
    if (currentImageData) saveToHistory(newImageData);
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
    setCurrentImageData(new ImageData(new Uint8ClampedArray(baseImageData.data), baseImageData.width, baseImageData.height));
  };

  const handleDownload = (format: ExportFormat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvasAsImage(canvas, format);
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <EditorToolbar
        canvasSize={canvasSize}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={onReset}
        onClose={onClose}
        lang={lang}
      />

      {/* Main editor area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left panel (Tools / Adjustments, plus Export tab on mobile) */}
        <aside className="w-full lg:w-72 bg-card border-t lg:border-t-0 lg:border-r border-border flex flex-col shrink-0 order-2 lg:order-1 h-[46vh] lg:h-auto">
          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setActiveTab("tools")}
              className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "tools"
                  ? "text-primary border-b-2 border-primary bg-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isEn ? "Tools" : "Herramientas"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("adjust")}
              className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "adjust"
                  ? "text-primary border-b-2 border-primary bg-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isEn ? "Adjust" : "Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("export")}
              className={`flex-1 lg:hidden px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "export"
                  ? "text-primary border-b-2 border-primary bg-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isEn ? "Export" : "Exportar"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "adjust" ? (
              <AdjustmentsPanel
                adjustments={adjustments}
                setAdjustments={setAdjustments}
                onReset={resetAdjustments}
              />
            ) : activeTab === "export" ? (
              <div className="lg:hidden">
                <ExportPanel
                  processedImage={processedImage}
                  canvasSize={canvasSize}
                  onDownload={handleDownload}
                  onUploadAnother={() => fileInputRef.current?.click()}
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
              />
            )}
          </div>
        </aside>

        {/* Canvas area */}
        <main
          className="w-full flex-1 relative shrink-0 order-1 lg:order-2 min-h-[45vh]"
          ref={containerRef}
        >
          {/* Checkerboard background */}
          <div className="absolute inset-0 checkerboard" />

          {/* Canvas container */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
            <div
              className="relative shadow-lg rounded-lg overflow-hidden border border-border/60"
              style={{
                width: `${canvasSize.width * fitScale}px`,
                height: `${canvasSize.height * fitScale}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <>
                <img
                  src={originalImage}
                  alt="Original"
                  style={{ width: "100%", height: "100%", display: showOriginal ? "block" : "none" }}
                  className="object-contain"
                />
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`${
                    tool === "move"
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-crosshair"
                  }`}
                  style={{ width: "100%", height: "100%", display: showOriginal ? "none" : "block" }}
                />
                {/* Crop overlay */}
                {tool === "crop" && (cropMode || isCropping) && !showOriginal && (
                  <CropOverlay cropRect={cropRect} canvasSize={canvasSize} />
                )}
              </>
            </div>
          </div>

          <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} lang={lang} />
        </main>

        {/* Right panel (Desktop) */}
        <ExportPanel
          processedImage={processedImage}
          canvasSize={canvasSize}
          onDownload={handleDownload}
          onUploadAnother={() => fileInputRef.current?.click()}
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
