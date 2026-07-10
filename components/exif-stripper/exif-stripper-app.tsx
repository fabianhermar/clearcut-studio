"use client";

import { useState } from "react";
import { UploadSection } from "./upload-section";
import { EditorSection } from "./editor-section";

interface ExifStripperAppProps {
  onClose: () => void;
  dict?: any;
}

export default function ExifStripperApp({ onClose, dict }: ExifStripperAppProps) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      {!file ? (
        <UploadSection onUpload={setFile} onClose={onClose} dict={dict} />
      ) : (
        <EditorSection file={file} onReset={() => setFile(null)} onClose={onClose} dict={dict} />
      )}
    </>
  );
}
