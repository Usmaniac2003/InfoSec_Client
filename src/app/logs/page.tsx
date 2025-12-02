"use client";

import Card from "@/components/Card";
import { useSecurityLogs } from "@/hooks/useSecurityLogs";


export default function LogsPage() {
  const { logs, loading, error } = useSecurityLogs();

  function color(status: string) {
    switch (status) {
      case "ok":
        return "text-green-400";
      case "failed":
      case "decrypt_failed":
        return "text-red-400";
      case "timestamp_expired":
      case "duplicate_nonce":
        return "text-orange-400";
      default:
        return "text-gray-300";
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <Card className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 p-8 shadow-xl rounded-xl">
        <h1 className="text-3xl font-bold text-green-400 mb-6">
          🔐 Security Logs
        </h1>

        {loading && <p className="text-gray-400">Loading logs...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="space-y-4">
          {logs.map((log, i) => (
            <div
              key={i}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              {/* Timestamp */}
              <p className="text-sm text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </p>

              {/* Event name */}
              <p className={`text-lg font-semibold ${color(log.status)}`}>
                {log.event} — {log.status}
              </p>

              {/* JSON details */}
              {log.details && (
                <pre className="text-gray-300 mt-2 text-sm bg-gray-900 p-3 rounded-lg overflow-auto">
{JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
