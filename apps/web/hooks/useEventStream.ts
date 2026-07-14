"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BusEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

type ConnectionStatus = "connecting" | "connected" | "error" | "closed";

export function useEventStream(maxEvents = 100) {
  const [events, setEvents] = useState<BusEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    setStatus("connecting");
    const es = new EventSource(`${API_BASE}/api/events/stream`);
    esRef.current = es;

    es.onopen = () => setStatus("connected");

    es.onmessage = (e) => {
      try {
        const event: BusEvent = JSON.parse(e.data);
        setEvents((prev) => {
          const next = [event, ...prev];
          return next.slice(0, maxEvents);
        });
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setStatus("error");
      es.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };
  }, [maxEvents]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);

  const clearEvents = () => setEvents([]);

  return { events, status, clearEvents };
}
