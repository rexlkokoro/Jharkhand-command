"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { WS_BASE } from "@/lib/constants";
import type { IntelEvent } from "@/lib/types";

export function useWebSocket() {
  const { addEvent, isLive } = useAppStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLive) {
      wsRef.current?.close();
      return;
    }

    function connect() {
      const ws = new WebSocket(`${WS_BASE}/api/v1/feed/live`);
      wsRef.current = ws;

      ws.onmessage = (evt) => {
        try {
          const event: IntelEvent = JSON.parse(evt.data);
          addEvent(event);
        } catch {
          // malformed message — ignore
        }
      };

      ws.onclose = () => {
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [isLive, addEvent]);
}
