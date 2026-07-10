"use client";

import { useState } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface BatchWatermarkerAppProps {
  onClose: () => void;
  dict?: any;
}

export default function BatchWatermarkerApp({ onClose, dict }: BatchWatermarkerAppProps) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      {files.length === 0 ? (
        <UploadSection onUpload={setFiles} onClose={onClose} dict={dict} />
      ) : (
        <EditorSection files={files} onReset={() => setFiles([])} onClose={onClose} dict={dict} />
      )}
    </>
  );
}
