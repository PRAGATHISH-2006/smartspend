// AppHeader: Responsive modern header with navigation drawer toggle, branding, greeting and notification badge

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, Menu, LogIn, User } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
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
  showLoginButton?: boolean;
  onLoginPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'வெற்றி நிதி மேலாண்மை',
  subtitle,
  showNotificationBell = true,
  onNotificationPress,
  rightElement,
  showBrandLogo = false,
  showLeaderPhoto = true,
  showLoginButton = true,
  onLoginPress,
}) => {
  const { session, profile, user } = useAuth();
  const { unreadCount } = useNotification();
  const { isDesktop, toggleMobileMenu } = useSidebar();

  // Desktop Header (Single unified horizontal row)
  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <View style={styles.desktopBrandingRow}>
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
          <View style={styles.desktopTextContainer}>
            <Text style={styles.desktopTitle} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.desktopSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.desktopActionsContainer}>
          {rightElement}

          {showLoginButton && (
            !session ? (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={onLoginPress}
                activeOpacity={0.8}
                accessibilityLabel="Login to Account"
              >
                <View style={styles.loginIconCircle}>
                  <LogIn size={13} color="#090D16" />
                </View>
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.userProfilePill}
                onPress={onLoginPress}
                activeOpacity={0.8}
                accessibilityLabel="Account Profile"
              >
                <View style={styles.onlineDot} />
                <User size={13} color="#FACC15" />
                <Text style={styles.userProfileText} numberOfLines={1}>
                  {profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                </Text>
              </TouchableOpacity>
            )
          )}

          {showNotificationBell && (
            <TouchableOpacity
              style={styles.bellButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell size={19} color={THEME.colors.textPrimary} />
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
  }

  // Mobile Header: Two-tier layout preventing horizontal squishing
  // Tier 1: Action Bar (Menu, Leader Avatar, Profile Pill, Bell)
  // Tier 2: Full-width Title & Subtitle (Zero word breaks or vertical single-letter columns)
  return (
    <View style={styles.mobileContainer}>
      {/* Tier 1: Mobile Top Action Bar */}
      <View style={styles.mobileTopBar}>
        <View style={styles.mobileLeftGroup}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleMobileMenu}
            activeOpacity={0.7}
            accessibilityLabel="Open Navigation Sidebar"
          >
            <Menu size={20} color="#F8FAFC" />
          </TouchableOpacity>

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
        </View>

        <View style={styles.mobileRightGroup}>
          {rightElement}

          {showLoginButton && (
            !session ? (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={onLoginPress}
                activeOpacity={0.8}
                accessibilityLabel="Login to Account"
              >
                <View style={styles.loginIconCircle}>
                  <LogIn size={12} color="#090D16" />
                </View>
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.userProfilePill,
                  rightElement ? styles.userProfilePillCompact : null,
                ]}
                onPress={onLoginPress}
                activeOpacity={0.8}
                accessibilityLabel="Account Profile"
              >
                <View style={styles.onlineDot} />
                <User size={12} color="#FACC15" />
                {!rightElement && (
                  <Text style={styles.userProfileText} numberOfLines={1}>
                    {profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                  </Text>
                )}
              </TouchableOpacity>
            )
          )}

          {showNotificationBell && (
            <TouchableOpacity
              style={styles.bellButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color={THEME.colors.textPrimary} />
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

      {/* Tier 2: Mobile Title & Subtitle Block (FULL WIDTH, NO WRAPPING BUGS) */}
      <View style={styles.mobileTitleBlock}>
        <Text style={styles.mobileTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.mobileSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Mobile Header Styles
  mobileContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileTitleBlock: {
    marginTop: 10,
    width: '100%',
  },
  mobileTitle: {
    fontSize: 20,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  mobileSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 17,
  },

  // Desktop Header Styles
  desktopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  desktopBrandingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desktopTextContainer: {
    flex: 1,
  },
  desktopTitle: {
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  desktopSubtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  desktopActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },

  // Common Elements
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    width: 34,
    height: 34,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAB308', // Warm Gold
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1.5,
    borderColor: '#FACC15',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  loginIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: 0.3,
  },
  userProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: '#DC2626',
    maxWidth: 130,
  },
  userProfilePillCompact: {
    paddingHorizontal: 8,
    maxWidth: 44,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  userProfileText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: '#111726',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    ...THEME.shadows.subtle,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: THEME.colors.danger,
    borderRadius: THEME.borderRadius.full,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#111726',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: THEME.typography.weights.heavy,
  },
});

