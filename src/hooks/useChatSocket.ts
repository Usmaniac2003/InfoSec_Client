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
import { MITM } from "@/lib/FLAG";

export function useChatSocket() {
  const { token, user, initialized } = useAuthContext();
  const { groupKey } = useCryptoContext();

  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  // ⭐ SIMPLE FLAG: true = encrypted, false = plaintext
  const [mitmEnabled, setMitmEnabled] = useState<boolean>(MITM);

  // ---------------------------------------------------
  // INIT SOCKET
  // ---------------------------------------------------
  useEffect(() => {
    if (!initialized || !token) return;

    const s = getSocket(token);
    setSocket(s);

    s.on("connect", () => console.log("🟢 WebSocket connected:", s.id));

    // ---------------------------------------------------
    // INCOMING MESSAGE
    // ---------------------------------------------------
    s.on("receive_message", async (msg: any) => {
      try {
        if (!mitmEnabled) {
          // ⚠ NO ENCRYPTION/DECRYPTION (PLAINTEXT MODE)
          if (msg.type === "text") {
            msg.text = msg.text ?? "[PLAINTEXT MESSAGE]";
          }

          if (msg.type === "file") {
            msg.file = {
              name: msg.fileName,
              size: msg.size,
              type: msg.mimeType,
              base64: msg.base64 ?? "",
            };
          }

          setMessages(prev => [...prev, msg]);
          return;
        }

        // 🔐 MITM ENABLED → decrypt normally
        if (msg.type === "text" && groupKey && msg.iv && msg.ciphertext) {
          msg.text = await decryptText(groupKey, msg.ciphertext, msg.iv);
        }

        if (msg.type === "file" && groupKey && msg.iv && msg.ciphertext) {
          const decrypted = await decryptFile(groupKey, msg.ciphertext, msg.iv);
          msg.file = {
            name: msg.fileName,
            size: msg.size,
            type: msg.mimeType,
            base64: URL.createObjectURL(
              new Blob([decrypted], { type: msg.mimeType })
            ),
          };
        }
      } catch (err) {
        console.error("❌ Decryption failed:", err);
        msg.text = "**Decryption Failed**";
      }

      setMessages(prev => [...prev, msg]);
    });

    return () => {
      s.off("receive_message");
    };
  }, [initialized, token, groupKey, mitmEnabled]);

  // ---------------------------------------------------
  // SEND TEXT
  // ---------------------------------------------------
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!socket) return console.warn("Socket not ready");

      if (!mitmEnabled) {
        // ⚠ SEND IN PLAINTEXT
        socket.emit("send_message", {
          senderId: user.id,
          sender: user.firstName,
          type: "text",
          text,
        });
        return;
      }

      // 🔐 SEND ENCRYPTED
      if (!groupKey) return;

      const { iv, ciphertext } = await encryptText(groupKey, text);

      socket.emit("send_message", {
        senderId: user.id,
        sender: user.firstName,
        type: "text",
        iv,
        ciphertext,
      });
    },
    [socket, user, groupKey, mitmEnabled]
  );

  // ---------------------------------------------------
  // SEND FILE
  // ---------------------------------------------------
  const sendFileMessage = useCallback(
    async (file: File) => {
      if (!socket) return console.warn("Socket not ready");

      if (!mitmEnabled) {
        // ⚠ SEND FILE IN PLAINTEXT
        const reader = new FileReader();
        reader.onload = () => {
          socket.emit("send_file", {
            senderId: user.id,
            sender: user.firstName,
            type: "file",
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            base64: reader.result,
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      // 🔐 ENCRYPTED FILE SEND
      if (!groupKey) return;

      const encrypted = await encryptFile(groupKey, file);

      socket.emit("send_file", {
        senderId: user.id,
        sender: user.firstName,
        type: "file",
        ...encrypted,
      });
    },
    [socket, user, groupKey, mitmEnabled]
  );

  return {
    messages,
    sendTextMessage,
    sendFileMessage,

    // ⭐ Expose flag & setter so UI can toggle it
    mitmEnabled,
    setMitmEnabled,
  };
}
