// AppHeader: Clean modern mobile header with branding, greeting and notification badge

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, Menu } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useNotification } from '../../context/NotificationContext';
import { useSidebar } from '../../context/SidebarContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showNotificationBell?: boolean;
  onNotificationPress?: () => void;
  rightElement?: React.ReactNode;
  showBrandLogo?: boolean;
  showLeaderPhoto?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'வெற்றி நிதி மேலாண்மை',
  subtitle,
  showNotificationBell = true,
  onNotificationPress,
  rightElement,
  showBrandLogo = false,
  showLeaderPhoto = true,
}) => {
  const { unreadCount } = useNotification();
  const { isDesktop, toggleMobileMenu } = useSidebar();

  return (
    <View style={styles.container}>
      <View style={styles.brandingRow}>
        {!isDesktop && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleMobileMenu}
            activeOpacity={0.7}
            accessibilityLabel="Open Navigation Sidebar"
          >
            <Menu size={20} color="#F8FAFC" />
          </TouchableOpacity>
        )}
        {showLeaderPhoto ? (
          <View style={styles.leaderAvatarWrapper}>
            <Image
              source={require('../../../assets/brand/leader_square.png')}
              style={styles.leaderAvatar}
              resizeMode="cover"
            />
          </View>
        ) : showBrandLogo ? (
          <Image
            source={require('../../../assets/brand/emblem.png')}
            style={styles.brandEmblem}
            resizeMode="contain"
          />
        ) : null}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
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
  brandingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EAB308',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  leaderAvatar: {
    width: '100%',
    height: '100%',
  },
  brandEmblem: {
    width: 36,
    height: 36,
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
