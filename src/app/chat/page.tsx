"use client";

import ProtectedRoute from "@/guards/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import FileUpload from "./components/FileUpload";
import EncryptionBadge from "./components/EncryptionBadge";
import Card from "@/components/Card";
import AuthGuard from "@/guards/AuthGuard";

export default function ChatPage() {
  const { logout } = useAuthContext();

  const [messages, setMessages] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-blue-50">
        <header className="p-4 bg-white shadow flex justify-between items-center">
          <h1 className="text-xl font-semibold text-blue-600">
            CipherChat Group 🔐
          </h1>

          <div className="flex items-center gap-4">
            <EncryptionBadge />
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 py-4">
          <Card className="w-full max-w-3xl h-[70vh] flex flex-col">
            <MessageList messages={messages} />

            <div className="mt-4">
              <MessageInput
                onSend={(text) =>
                  setMessages((prev) => [...prev, { id: Date.now(), text }])
                }
                onFile={() => setUploadOpen(true)}
              />
            </div>
          </Card>
        </main>

        <FileUpload
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSend={(fileData) => setMessages((prev) => [...prev, fileData])}
        />
      </div>
    </AuthGuard>
  );
}
