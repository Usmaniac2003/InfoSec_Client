"use client";

import { useState, useEffect, useRef } from "react";
import AuthGuard from "@/guards/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import { useChatSocket } from "@/hooks/useChatSocket";

import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import FileUpload from "./components/FileUpload";
import EncryptionBadge from "./components/EncryptionBadge";
import Card from "@/components/Card";

export default function ChatPage() {
  const { logout } = useAuthContext();
  const { messages, sendTextMessage, sendFileMessage } = useChatSocket();
  const [uploadOpen, setUploadOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-gray-950 text-white">
        {/* Header */}
        <header className="p-4 bg-gray-900 shadow-md flex justify-between items-center border-b border-gray-800">
          <h1 className="text-xl md:text-2xl font-bold text-green-400">
            CipherChat Group
          </h1>
          <div className="flex items-center gap-4">
            <EncryptionBadge />
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition text-white font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col items-center bg-gray-900 justify-center px-4 py-6">
          <Card className="w-full max-w-4xl h-[75vh] flex flex-col bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
            {/* Message List */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 rounded-lg bg-gray-950 custom-scrollbar"
            >
              <MessageList messages={messages} />
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
              <MessageInput
                onSend={sendTextMessage}
                onFile={() => setUploadOpen(true)}
              />
            </div>
          </Card>
        </main>

        {/* File Upload Modal */}
        <FileUpload
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSend={sendFileMessage}
        />

        {/* Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937; /* dark gray track */
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #22c55e; /* green thumb */
            border-radius: 9999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #16a34a;
          }

          /* Firefox */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #22c55e #1f2937;
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
