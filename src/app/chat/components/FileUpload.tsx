"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: (fileData: any) => void;
}

export default function FileUpload({ open, onClose, onSend }: Props) {
  const [file, setFile] = useState<File | null>(null);

  function handleSend() {
    if (!file) return;

    const msg = {
      id: Date.now(),
      sender: "You",
      type: "file",
      fileName: file.name,
      time: new Date().toLocaleTimeString(),
      // TODO: encrypted file URL after AES-GCM
      url: URL.createObjectURL(file),
    };

    onSend(msg);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Send a File">
      <input
        type="file"
        className="mb-4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button className="w-full" onClick={handleSend} disabled={!file}>
        Send File
      </Button>
    </Modal>
  );
}
