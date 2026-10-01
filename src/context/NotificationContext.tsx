// NotificationContext: In-App Notifications & Settings State

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import { NotificationRow, NotificationSettingsRow } from '../types/database';
import { registerForPushNotificationsAsync } from '../services/notificationService';

interface NotificationContextType {
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  settings: NotificationSettingsRow | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateSettings: (updates: Partial<NotificationSettingsRow>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [settings, setSettings] = useState<NotificationSettingsRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      const [notifsRes, settingsRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (notifsRes.data) {
        setNotifications(notifsRes.data as NotificationRow[]);
      }
      if (settingsRes.data) {
        setSettings(settingsRes.data as NotificationSettingsRow);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();

    // Register push token if logged in
    if (user?.id) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          supabase
            .from('notification_settings')
            .upsert({ user_id: user.id, expo_push_token: token }, { onConflict: 'user_id' });
        }
      });
    }
  }, [fetchNotifications, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Error marking all as read:', err);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettingsRow>) => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select('*')
        .single();

      if (!error && data) {
        setSettings(data as NotificationSettingsRow);
      }
    } catch (err) {
      console.warn('Error updating notification settings:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        settings,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead,
        updateSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
