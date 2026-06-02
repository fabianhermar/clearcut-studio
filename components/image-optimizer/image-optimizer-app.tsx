"use client";

import { useState, useCallback } from "react";
import { OptimizerUpload } from "./optimizer-upload";
import { OptimizerWorkspace } from "./optimizer-workspace";

interface ImageOptimizerAppProps {
  onClose?: () => void;
}

export default function ImageOptimizerApp({ onClose }: ImageOptimizerAppProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    if (onClose) onClose();
  }, [onClose]);

  const handleNewFile = useCallback((f: File) => {
    setFile(f);
  }, []);

  if (!file) {
    return (
      <OptimizerUpload
        onFileSelect={handleFileSelect}
        onClose={onClose}
      />
    );
  }

  return (
    <OptimizerWorkspace
      file={file}
      onReset={handleReset}
      onNewFile={handleNewFile}
    />
  );
}
