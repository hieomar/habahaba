"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificationsService } from "@/lib/api/notifications";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, unreadCount: count } = await notificationsService.list();
      setNotifications(data ?? []);
      setUnreadCount(count ?? 0);
    } catch {
      /* Silently ignore — notification failures shouldn't block the UI */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationsService.markAllRead();
    } catch {
      // Revert on failure — refetch to get authoritative state
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationsService.markRead(id);
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, refetch: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
