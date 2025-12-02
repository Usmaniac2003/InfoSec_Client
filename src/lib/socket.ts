"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to WS:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket connect error:", err.message);
    });
  }

  return socket;
}
