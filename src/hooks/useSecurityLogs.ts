"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api/api";
import { API_ROUTES } from "@/lib/api/routes";

export function useSecurityLogs(refreshInterval = 2000) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get(API_ROUTES.keyExchange.logs);
      setLogs(res.data.reverse());
      setError(null);
    } catch (err) {
      console.error("Failed to load logs:", err);
      setError("Unable to fetch logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchLogs, refreshInterval]);

  return { logs, loading, error, refresh: fetchLogs };
}
