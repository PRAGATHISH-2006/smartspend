// AppHeader: Clean modern mobile header with branding, greeting and notification badge

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useNotification } from '../../context/NotificationContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showNotificationBell?: boolean;
  onNotificationPress?: () => void;
  rightElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'SmartSpend',
  subtitle,
  showNotificationBell = true,
  onNotificationPress,
  rightElement,
}) => {
  const { unreadCount } = useNotification();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.actionsContainer}>
        {rightElement}
        {showNotificationBell && (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Bell size={22} color={THEME.colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: THEME.colors.danger,
    borderRadius: THEME.borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: THEME.colors.surface,
  },
  badgeText: {
    color: THEME.colors.textInverse,
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
});
