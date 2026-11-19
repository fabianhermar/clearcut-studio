"use client";

import { useState } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

export default function AspectRatioFitterApp({
  initialImage = null,
  onClose,
  dict,
  lang = "es",
}: {
  initialImage?: string | null;
  onClose: () => void;
  dict?: any;
  lang?: string;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage);

  return (
    <>
      {!imageSrc ? (
        <UploadSection
          onUpload={setImageSrc}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      ) : (
        <EditorSection
          imageSrc={imageSrc}
          onReset={() => setImageSrc(null)}
          onClose={onClose}
          dict={dict}
          lang={lang}
        />
      )}
    </>
  );
}
