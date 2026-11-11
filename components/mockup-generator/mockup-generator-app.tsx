"use client";

import { useState, useCallback } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface MockupGeneratorAppProps {
  initialImage?: string;
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export default function MockupGeneratorApp({
  initialImage,
  onClose,
  dict,
  lang = "es",
}: MockupGeneratorAppProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
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
        dict={dict}
        lang={lang}
      />
    );
  }

  return (
    <EditorSection
      originalImage={originalImage}
      onReset={handleReset}
      onNewImage={handleNewImage}
      lang={lang}
    />
  );
}
