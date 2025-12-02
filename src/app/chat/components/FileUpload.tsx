"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { Upload } from "lucide-react";

export default function FileUpload({ open, onClose, onSend }: any) {
  const [file, setFile] = useState<File | null>(null);

  async function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSend() {
    if (!file) return;

    const base64 = await convertToBase64(file);

    onSend({
      name: file.name,
      size: file.size,
      type: file.type,
      base64,
    });

    setFile(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload File">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 border rounded px-3 py-2 w-full bg-gray-700 text-white border-gray-600"
      />

      <Button
        onClick={handleSend}
        disabled={!file}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" /> Send File
      </Button>
    </Modal>
  );
}
