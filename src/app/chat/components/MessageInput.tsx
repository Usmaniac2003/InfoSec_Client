"use client";

import { useState } from "react";
import Button from "@/components/Button";

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
        className="flex-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Button type="button" variant="secondary" onClick={onFile}>
        📎
      </Button>

      <Button type="submit">Send</Button>
    </form>
  );
}
