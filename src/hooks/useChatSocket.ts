"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useAuthContext } from "@/context/AuthContext";
import { useCryptoContext } from "@/context/CryptoContext";
import {
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
} from "@/lib/crypto/aes";

export function useChatSocket() {
  const { token, user, initialized } = useAuthContext();
  const { groupKey } = useCryptoContext();

  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!initialized || !token) return;

    const s = getSocket(token);
    setSocket(s);

    s.on("receive_message", async (msg: any) => {
      // TEXT
      if (msg.type === "text" && groupKey) {
        msg.text = await decryptText(groupKey, msg.ciphertext, msg.iv);
      }

      // FILE
      if (msg.type === "file" && groupKey) {
        const decrypted = await decryptFile(groupKey, msg.ciphertext, msg.iv);

        msg.file = {
          name: msg.fileName,
          type: msg.mimeType,
          size: msg.size,
          base64: URL.createObjectURL(
            new Blob([decrypted], { type: msg.mimeType })
          ),
        };
      }

      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.off("receive_message");
    };
  }, [initialized, token, groupKey]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!socket || !groupKey) return;

      const { iv, ciphertext } = await encryptText(groupKey, text);

      socket.emit("send_message", {
        senderId: user.id,
        sender: user.firstName,
        type: "text",
        iv,
        ciphertext,
      });
    },
    [socket, groupKey, user]
  );

  const sendFileMessage = useCallback(
    async (file: File) => {
      if (!socket || !groupKey) return;

      const encrypted = await encryptFile(groupKey, file);

      socket.emit("send_file", {
        senderId: user.id,
        sender: user.firstName,
        type: "file",
        ...encrypted,
      });
    },
    [socket, groupKey, user]
  );

  return { messages, sendTextMessage, sendFileMessage };
}
