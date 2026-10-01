// Mobile Notification Service (Expo Notifications & Database Sync)

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { NotificationType } from '../types/database';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

/**
 * Register device for push notifications and get Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }

    // Attempt to get token (safe fallback for simulators / environments without projectId)
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch (tokenErr) {
      console.log('Push token not available in current environment:', tokenErr);
      return null;
    }
  } catch (err) {
    console.warn('Error configuring push notifications:', err);
    return null;
  }
}

/**
 * Schedule or immediately trigger a local on-device notification
 */
export async function sendLocalNotification(params: {
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: params.data || {},
        sound: true,
      },
      trigger: null, // trigger immediately
    });
  } catch (err) {
    console.log('Local notification suppressed or unavailable:', err);
  }
}

/**
 * Create an in-app notification record in Supabase and trigger local notification
 */
export async function createInAppNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    // 1. Insert into database
    await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
    });

    // 2. Fire local notification for instant user awareness
    await sendLocalNotification({
      title: params.title,
      body: params.message,
      data: { type: params.type, ...params.metadata },
    });
  } catch (err) {
    console.warn('Failed to record notification:', err);
  }
}
