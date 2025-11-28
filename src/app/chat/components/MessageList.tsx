"use client";

interface Props {
  messages: any[];
}

export default function MessageList({ messages }: Props) {
  return (
    <div className="flex-1 overflow-y-auto pr-2">
      {messages.length === 0 && (
        <p className="text-gray-400 text-center mt-10">
          No messages yet. Say something 👋
        </p>
      )}

      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex flex-col bg-gray-100 p-3 rounded-lg max-w-[75%]"
          >
            <span className="font-semibold text-blue-600 text-sm">
              {msg.sender}
            </span>

            {msg.type === "text" && (
              <p className="text-gray-800">{msg.text}</p>
            )}

            {msg.type === "file" && (
              <a
                href={msg.url}
                className="text-blue-600 underline"
                download={msg.fileName}
              >
                📎 {msg.fileName}
              </a>
            )}

            <span className="text-xs text-gray-500 mt-1">{msg.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
