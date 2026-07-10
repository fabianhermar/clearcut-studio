"use client";

import { useState } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface FaviconGeneratorAppProps {
  onClose: () => void;
  dict: any;
}

export default function FaviconGeneratorApp({ onClose, dict }: FaviconGeneratorAppProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleReset = () => {
    setImageSrc(null);
  };

  return (
    <>
      {imageSrc ? (
        <EditorSection imageSrc={imageSrc} onReset={handleReset} onClose={onClose} dict={dict} />
      ) : (
        <UploadSection onUpload={setImageSrc} onClose={onClose} dict={dict} />
      )}
    </>
  );
}
