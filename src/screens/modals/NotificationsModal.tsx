// NotificationsModal: In-app notification center modal

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, Bell, CheckCheck, AlertTriangle, Repeat, Mail, Info } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useNotification } from '../../context/NotificationContext';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { EmptyState } from '../../components/common/EmptyState';
import { NotificationType } from '../../types/database';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'LOW_BALANCE':
      case 'FIXED_EXPENSE_WARNING':
      case 'FIVE_DAYS_REMAINING':
        return <AlertTriangle size={18} color={THEME.colors.amber} />;
      case 'DAILY_FIXED_EXPENSE':
      case 'FIXED_EXPENSE_DEDUCTED':
      case 'FIXED_EXPENSE_SKIPPED':
        return <Repeat size={18} color={THEME.colors.primary} />;
      case 'WEEKLY_REPORT':
        return <Mail size={18} color={THEME.colors.indigo} />;
      case 'INFO':
      default:
        return <Info size={18} color={THEME.colors.info} />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Bell size={20} color={THEME.colors.textPrimary} />
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn} activeOpacity={0.7}>
                <CheckCheck size={16} color={THEME.colors.primary} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* List of notifications */}
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} color={THEME.colors.primary} />}
            title="All caught up!"
            description="You don't have any notifications right now."
          />
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer}>
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                onPress={() => markAsRead(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>{getNotificationIcon(item.type)}</View>

                <View style={styles.textCol}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.notifTitle, !item.read && styles.unreadText]}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifDate}>{formatFriendlyDate(item.created_at)}</Text>
                  </View>

                  <Text style={styles.notifMessage}>{item.message}</Text>
                </View>

                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  badge: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.semibold,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: THEME.spacing.md,
    gap: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  unreadCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  unreadText: {
    fontWeight: THEME.typography.weights.bold,
  },
  notifDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginLeft: 8,
  },
  notifMessage: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primary,
    alignSelf: 'center',
    marginLeft: 8,
  },
});
