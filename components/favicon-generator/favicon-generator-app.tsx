"use client";

import { useState } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface FaviconGeneratorAppProps {
  initialImage?: string | null;
  onClose: () => void;
  dict?: any;
  lang?: string;
}

export default function FaviconGeneratorApp({
  initialImage = null,
  onClose,
  dict,
  lang = "es",
}: FaviconGeneratorAppProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage);

  const handleReset = () => {
    setImageSrc(null);
  };

  return (
    <>
      {imageSrc ? (
        <EditorSection
          imageSrc={imageSrc}
          onReset={handleReset}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      ) : (
        <UploadSection
          onUpload={setImageSrc}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      )}
    </>
  );
}
