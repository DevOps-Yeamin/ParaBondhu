import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toast: { title: string; message: string; category: string } | null;
  clearToast: () => void;
  markAsRead: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  toast: null,
  clearToast: () => {},
  markAsRead: async () => {},
  refreshNotifications: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState<{ title: string; message: string; category: string } | null>(null);

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // Ignore if unauthenticated
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifs();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Real-time WebSocket connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connectWs() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In Vite proxy or direct host
      const host = window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/notifications/ws${user ? `?user_id=${user.id}` : ''}`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          // Connected
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'TRAFFIC_ALERT') {
              setToast({
                title: `🚨 Traffic Alert: ${data.data.title}`,
                message: `${data.data.location_name} - ${data.data.severity.toUpperCase()} impact`,
                category: 'traffic',
              });
            } else if (data.type === 'TOKEN_CALLED') {
              setToast({
                title: `🎫 Token ${data.data.token_code} Called!`,
                message: `${data.data.provider_name} is now serving your token.`,
                category: 'lineless',
              });
            }
            fetchNotifs();
          } catch {
            // Non-JSON ping
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 5000);
        };
      } catch {
        // Fallback gracefully
      }
    }

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [user]);

  const markAsRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const clearToast = () => setToast(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        clearToast,
        markAsRead,
        refreshNotifications: fetchNotifs,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
