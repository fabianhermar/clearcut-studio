"use client";

import { useState, useCallback } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface BatchWatermarkerAppProps {
  onClose: () => void;
  dict?: any;
  lang?: string;
}

export default function BatchWatermarkerApp({
  onClose,
  dict,
  lang = "es",
}: BatchWatermarkerAppProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleSampleSelect = useCallback(async (src: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const name = src.split("/").pop() || "sample.jpg";
      setFiles([new File([blob], name, { type: blob.type || "image/jpeg" })]);
    } catch (e) {
      console.error("Failed to load sample:", e);
    }
  }, []);

  return (
    <>
      {files.length === 0 ? (
        <UploadSection
          onUpload={setFiles}
          onSampleSelect={handleSampleSelect}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      ) : (
        <EditorSection
          files={files}
          onReset={() => setFiles([])}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      )}
    </>
  );
}
