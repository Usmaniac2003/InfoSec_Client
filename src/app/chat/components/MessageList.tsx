"use client";

import { useAuthContext } from "@/context/AuthContext";
import React from "react";

interface MessageListProps {
  messages: any[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuthContext();

  function renderFilePreview(msg: any, isOwn: boolean) {
    const file = msg.file;
    const linkClass = isOwn
      ? "block text-green-400 underline mt-1"
      : "block text-gray-400 underline mt-1";

    if (file.type.startsWith("image/")) {
      return (
        <div className="mt-2">
          <img
            src={file.base64}
            alt={file.name}
            className="max-w-xs max-h-60 rounded shadow"
          />
          <a href={file.base64} download={file.name} className={linkClass}>
            Download {file.name}
          </a>
        </div>
      );
    }

    if (file.type.startsWith("video/")) {
      return (
        <div className="mt-2">
          <video
            src={file.base64}
            controls
            className="max-w-xs max-h-60 rounded shadow"
          />
          <a href={file.base64} download={file.name} className={linkClass}>
            Download {file.name}
          </a>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <a
          href={file.base64}
          download={file.name}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {file.name} ({Math.round(file.size / 1024)} KB)
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950 rounded-md scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-900 flex flex-col">
      {messages.map((msg: any) => {
        const isOwn = user?.id === msg.senderId;

        return (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[70%] ${
              isOwn ? "self-end items-end" : "self-start items-start"
            }`}
          >
            <p
              className={`font-semibold text-sm ${
                isOwn ? "text-green-400" : "text-gray-400"
              }`}
            >
              {msg.sender} {isOwn && "(You)"}
            </p>

            <div
              className={`p-3 rounded-xl shadow-md ${
                isOwn ? "bg-green-800 text-white" : "bg-gray-800 text-white"
              }`}
            >
              {msg.type === "text" && (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
              {msg.type === "file" && renderFilePreview(msg, isOwn)}{" "}
            </div>

            <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
          </div>
        );
      })}
    </div>
  );
}
