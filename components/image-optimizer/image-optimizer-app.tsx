"use client";

import { useState, useCallback } from "react";
import { OptimizerUpload } from "./optimizer-upload";
import { OptimizerWorkspace } from "./optimizer-workspace";

interface ImageOptimizerAppProps {
  onClose?: () => void;
  dict?: any;
  lang?: string;
}

export default function ImageOptimizerApp({
  onClose,
  dict,
  lang = "es",
}: ImageOptimizerAppProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
  }, []);

  const handleSampleSelect = useCallback(async (src: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const name = src.split("/").pop() || "sample.jpg";
      const sampleFile = new File([blob], name, { type: blob.type || "image/jpeg" });
      setFile(sampleFile);
    } catch (e) {
      console.error("Failed to load sample image:", e);
    }
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
  }, []);

  const handleNewFile = useCallback((f: File) => {
    setFile(f);
  }, []);

  if (!file) {
    return (
      <OptimizerUpload
        onFileSelect={handleFileSelect}
        onSampleSelect={handleSampleSelect}
        onClose={onClose}
        dict={dict}
        lang={lang}
      />
    );
  }

  return (
    <OptimizerWorkspace
      file={file}
      onReset={handleReset}
      onClose={onClose}
      onNewFile={handleNewFile}
      lang={lang}
    />
  );
}
