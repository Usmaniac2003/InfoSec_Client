"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { Paperclip } from "lucide-react";

interface Props {
  onSend: (msg: string) => void;
  onFile: () => void;
}

export default function MessageInput({ onSend, onFile }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: any) {
    e.preventDefault();
    onSend(text);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 bg-gray-800 text-white border-gray-600"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Button
        type="button"
        variant="secondary"
        onClick={onFile}
        className="flex items-center justify-center"
      >
        <Paperclip className="w-5 h-5" />
      </Button>

      <Button
        type="submit"
        className="bg-green-600 text-white hover:bg-green-700"
      >
        Send
      </Button>
    </form>
  );
}
