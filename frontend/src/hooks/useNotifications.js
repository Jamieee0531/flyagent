import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const WS_BASE = (import.meta.env.VITE_GATEWAY_WS_URL || 'ws://localhost:8001');

export function useNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/ws/notifications?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications((prev) => [...prev, { ...data, id: Date.now() }]);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => {
      // silently ignore — user may not have Google Calendar connected
    };

    // Send a keep-alive ping every 30 s to prevent proxy timeouts
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping');
    }, 30_000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [token]);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => setNotifications([]), []);

  return { notifications, dismiss, dismissAll };
}
