"use client";

import { useState } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

export default function GradientExtractorApp({ onClose, dict }: { onClose: () => void; dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  return (
    <>
      {!imageSrc ? (
        <UploadSection onUpload={setImageSrc} onClose={onClose} dict={dict} />
      ) : (
        <EditorSection imageSrc={imageSrc} onReset={() => setImageSrc(null)} onClose={onClose} dict={dict} />
      )}
    </>
  );
}
