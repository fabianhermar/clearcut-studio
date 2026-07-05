"use client";

import { useState, useCallback } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface MockupGeneratorAppProps {
  initialImage?: string;
  onClose?: () => void;
  dict?: any;
}

export default function MockupGeneratorApp({ initialImage, onClose, dict }: MockupGeneratorAppProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen valido.");
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalImage(url);
  }, []);

  const handleSampleSelect = useCallback((src: string) => {
    setOriginalImage(src);
  }, []);

  const handleReset = () => {
    if (originalImage && originalImage.startsWith("blob:")) {
      URL.revokeObjectURL(originalImage);
    }
    setOriginalImage(null);
    if (onClose) onClose();
  };

  const handleNewImage = () => {
    // Only revoke if it's a blob to avoid memory leaks
    if (originalImage && originalImage.startsWith("blob:")) {
      URL.revokeObjectURL(originalImage);
    }
    setOriginalImage(null);
  };

  if (!originalImage) {
    return (
      <UploadSection
        onFileSelect={handleFileSelect}
        onSampleSelect={handleSampleSelect}
        onClose={onClose}
      />
    );
  }

  return (
    <EditorSection
      originalImage={originalImage}
      onReset={handleReset}
      onNewImage={handleNewImage}
    />
  );
}
