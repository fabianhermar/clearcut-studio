"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { removeBackground } from "@imgly/background-removal";

import { UploadSection } from "./upload-section";
import { ProcessingScreen } from "./processing-screen";
import { ImageEditor } from "./image-editor/image-editor";

interface BackgroundRemoverAppProps {
  initialImage?: string;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export default function BackgroundRemoverApp({
  initialImage,
  onClose,
  dict,
  lang = "es",
}: BackgroundRemoverAppProps) {
  const isEn = lang === "en" || dict?.header?.features === "Features";
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const processImage = useCallback(
    async (imageSrc: string) => {
      cancelledRef.current = false;
      setIsProcessing(true);
      setProgress(0);
      setErrorMessage(null);

      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();

        const result = await removeBackground(blob, {
          progress: (_key, current, total) => {
            if (cancelledRef.current || !total) return;
            const percentage = Math.round((current / total) * 100);
            setProgress(percentage);
          },
        });

        if (cancelledRef.current) return;
        const url = URL.createObjectURL(result);
        setProcessedImage(url);
      } catch (error) {
        if (cancelledRef.current) return;
        console.error("Error removing background:", error);
        setOriginalImage(null);
        setErrorMessage(
          isEn
            ? "Could not process the image. Please verify the format and try another image."
            : "No se pudo procesar la imagen. Verifica el formato e intenta nuevamente."
        );
      } finally {
        if (!cancelledRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [isEn]
  );

  useEffect(() => {
    if (initialImage && !processedImage) {
      processImage(initialImage);
    }
  }, [initialImage, processedImage, processImage]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErrorMessage(
          isEn
            ? "Please select a valid image file (JPG, PNG, WebP, AVIF)."
            : "Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP, AVIF)."
        );
        return;
      }

      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setProcessedImage(null);
      processImage(url);
    },
    [processImage, isEn]
  );

  const handleSampleSelect = useCallback(
    (src: string) => {
      setOriginalImage(src);
      setProcessedImage(null);
      processImage(src);
    },
    [processImage]
  );

  const handleCancelProcessing = () => {
    cancelledRef.current = true;
    setIsProcessing(false);
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
  };

  const handleNewImage = () => {
    if (originalImage && originalImage.startsWith("blob:")) {
      URL.revokeObjectURL(originalImage);
    }
    if (processedImage && processedImage.startsWith("blob:")) {
      URL.revokeObjectURL(processedImage);
    }
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
  };

  if (!originalImage) {
    return (
      <UploadSection
        onFileSelect={handleFileSelect}
        onSampleSelect={handleSampleSelect}
        onClose={onClose}
        dict={dict}
        lang={lang}
        errorMessage={errorMessage}
      />
    );
  }

  if (isProcessing) {
    return (
      <ProcessingScreen
        progress={progress}
        originalImage={originalImage}
        onCancel={handleCancelProcessing}
        lang={lang}
      />
    );
  }

  if (processedImage) {
    return (
      <ImageEditor
        originalImage={originalImage}
        processedImage={processedImage}
        onReset={handleNewImage}
        onClose={onClose}
        onFileSelect={handleFileSelect}
        lang={lang}
      />
    );
  }

  return null;
}
