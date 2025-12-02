"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useAuthContext } from "@/context/AuthContext";

export function useChatSocket() {
  const { token, user, initialized } = useAuthContext();

  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!token) return;

    const s = getSocket(token);
    setSocket(s);

    console.log("🔌 Connecting to WebSocket…");

    s.on("receive_message", (msg: any) => {
      console.log("📩 Received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.off("receive_message");
    };
  }, [initialized, token]);

  // SEND TEXT MESSAGE
  const sendTextMessage = useCallback(
    (text: string) => {
      if (!socket) return;

      socket.emit("send_message", {
        sender: user?.firstName || "Unknown",
        type: "text",
        text,
      });
    },
    [socket, user]
  );

  // SEND FILE MESSAGE
  const sendFileMessage = useCallback(
    (fileData: any) => {
      if (!socket) return;

      socket.emit("send_file", {
        sender: user?.firstName || "Unknown",
        type: "file",
        file: {
          name: fileData.name,
          size: fileData.size,
          type: fileData.type,
          base64: fileData.base64,
        },
      });
    },
    [socket, user]
  );

  return { messages, sendTextMessage, sendFileMessage };
}
