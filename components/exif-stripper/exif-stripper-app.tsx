"use client";

import { useState, useCallback } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface ExifStripperAppProps {
  initialFile?: File | null;
  onClose: () => void;
  dict?: any;
  lang?: string;
}

export default function ExifStripperApp({
  initialFile = null,
  onClose,
  dict,
  lang = "es",
}: ExifStripperAppProps) {
  const [file, setFile] = useState<File | null>(initialFile);

  const handleSampleSelect = useCallback(async (src: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const name = src.split("/").pop() || "sample.jpg";
      setFile(new File([blob], name, { type: blob.type || "image/jpeg" }));
    } catch (e) {
      console.error("Failed to load sample:", e);
    }
  }, []);

  return (
    <>
      {!file ? (
        <UploadSection
          onUpload={setFile}
          onSampleSelect={handleSampleSelect}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      ) : (
        <EditorSection
          file={file}
          onReset={() => setFile(null)}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      )}
    </>
  );
}
