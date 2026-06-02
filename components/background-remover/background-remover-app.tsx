"use client";

import { useState, useCallback, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";

import { UploadSection } from "./upload-section";
import { ProcessingScreen } from "./processing-screen";
import { ImageEditor } from "./image-editor/image-editor";

interface BackgroundRemoverAppProps {
  initialImage?: string;
  onClose?: () => void;
}

export default function BackgroundRemoverApp({ initialImage, onClose }: BackgroundRemoverAppProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processImage = useCallback(async (imageSrc: string) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      const result = await removeBackground(blob, {
        progress: (key, current, total) => {
          const percentage = Math.round((current / total) * 100);
          setProgress(percentage);
        },
      });

      const url = URL.createObjectURL(result);
      setProcessedImage(url);
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Error al procesar la imagen. Por favor intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (initialImage && !processedImage) {
      processImage(initialImage);
    }
  }, [initialImage, processedImage, processImage]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen valido.");
        return;
      }

      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setProcessedImage(null);
      processImage(url);
    },
    [processImage]
  );

  const handleSampleSelect = useCallback(
    (src: string) => {
      setOriginalImage(src);
      setProcessedImage(null);
      processImage(src);
    },
    [processImage]
  );

  const handleReset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (processedImage) URL.revokeObjectURL(processedImage);
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
    if (onClose) onClose();
  };

  // Upload phase
  if (!originalImage) {
    return (
      <UploadSection
        onFileSelect={handleFileSelect}
        onSampleSelect={handleSampleSelect}
        onClose={onClose}
      />
    );
  }

  // Processing phase
  if (isProcessing) {
    return <ProcessingScreen progress={progress} originalImage={originalImage} />;
  }

  // Editor phase
  if (processedImage) {
    return (
      <ImageEditor
        originalImage={originalImage}
        processedImage={processedImage}
        onReset={handleReset}
        onFileSelect={handleFileSelect}
      />
    );
  }

  return null;
}
