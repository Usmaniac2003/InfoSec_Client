"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Spinner from "@/components/Spinner";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      // TODO: fetch from backend → GET /logs
      // Example placeholder:
      setTimeout(() => {
        setLogs([
          {
            id: 1,
            type: "AUTH_SUCCESS",
            message: "User logged in successfully",
            time: "10:21:36 AM",
          },
          {
            id: 2,
            type: "KEY_EXCHANGE",
            message: "ECDH handshake completed",
            time: "10:22:01 AM",
          },
          {
            id: 3,
            type: "REPLAY_BLOCKED",
            message: "Replay attack detected and blocked",
            time: "10:25:12 AM",
          },
        ]);

        setLoading(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Security Logs 📜</h1>

      <Card className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Security Events
        </h2>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No security logs found.
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="bg-gray-100 p-3 rounded-md border border-gray-200"
              >
                <p className="font-semibold text-blue-600">{log.type}</p>
                <p className="text-gray-700">{log.message}</p>
                <p className="text-sm text-gray-500 mt-1">{log.time}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
