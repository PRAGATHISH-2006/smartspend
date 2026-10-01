// CycleActionCard: Month-end reminder, period extension, and closing management widget
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, FolderArchive, ArrowRight, Sparkles, Coins } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface CycleActionCardProps {
  daysRemaining: number;
  periodStartFormatted?: string;
  periodEndFormatted?: string;
  currentBalance: number;
  onExtendPress: () => void;
  onCloseMonthPress: () => void;
}

export const CycleActionCard: React.FC<CycleActionCardProps> = ({
  daysRemaining,
  periodStartFormatted,
  periodEndFormatted,
  currentBalance,
  onExtendPress,
  onCloseMonthPress,
}) => {
  const isLastDay = daysRemaining <= 1;
  const isEndingSoon = daysRemaining <= 5;
  const rolloverSurplus = Math.max(0, currentBalance);

  return (
    <View
      style={[
        styles.card,
        isLastDay ? styles.cardLastDay : isEndingSoon ? styles.cardEndingSoon : styles.cardNormal,
      ]}
    >
      {/* Top Banner Row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.statusDot,
              isLastDay
                ? styles.dotDanger
                : isEndingSoon
                ? styles.dotWarning
                : styles.dotNormal,
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              isLastDay
                ? styles.badgeTextDanger
                : isEndingSoon
                ? styles.badgeTextWarning
                : styles.badgeTextNormal,
            ]}
          >
            {isLastDay
              ? '⚠️ LAST DAY REMINDER'
              : isEndingSoon
              ? `⏳ ${daysRemaining} DAYS REMAINING IN CYCLE`
              : '📅 ACTIVE BUDGET CYCLE'}
          </Text>
        </View>

        <Text style={styles.cycleDates}>
          {periodStartFormatted || 'Start'} – {periodEndFormatted || 'End'}
        </Text>
      </View>

      {/* Main Message */}
      <View style={styles.bodyContent}>
        <Text style={styles.mainTitle}>
          {isLastDay
            ? 'Cycle Ends Today! Should we close or extend?'
            : isEndingSoon
            ? `Your monthly cycle ends in ${daysRemaining} days.`
            : 'Spending Cycle Management'}
        </Text>
        <Text style={styles.bodyText}>
          {isLastDay
            ? 'You can extend this cycle by picking extra days (e.g. +5 days), or close this month now to rollover remaining funds to next month & archive transactions to Google Drive.'
            : 'Extend your period by +5 days (or a custom date), or close this month anytime to carry forward your surplus to next month.'}
        </Text>

        {/* Rollover Surplus Preview if > 0 */}
        {rolloverSurplus > 0 && (
          <View style={styles.surplusRow}>
            <Coins size={15} color="#059669" />
            <Text style={styles.surplusText}>
              Unspent surplus: <Text style={{ fontWeight: '800' }}>{formatINR(rolloverSurplus)}</Text> will roll over to next month's wallet!
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.extendBtn}
          onPress={onExtendPress}
          activeOpacity={0.8}
        >
          <Clock size={15} color={THEME.colors.primary} />
          <Text style={styles.extendBtnText}>Extend (+5 Days / Custom)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onCloseMonthPress}
          activeOpacity={0.8}
        >
          <FolderArchive size={15} color="#FFF" />
          <Text style={styles.closeBtnText}>Close This Month</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    borderWidth: 1.5,
    ...THEME.shadows.subtle,
  },
  cardLastDay: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  cardEndingSoon: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  cardNormal: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotDanger: {
    backgroundColor: '#DC2626',
  },
  dotWarning: {
    backgroundColor: '#D97706',
  },
  dotNormal: {
    backgroundColor: THEME.colors.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextDanger: {
    color: '#991B1B',
  },
  badgeTextWarning: {
    color: '#92400E',
  },
  badgeTextNormal: {
    color: THEME.colors.primary,
  },
  cycleDates: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  bodyContent: {
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
  },
  surplusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.md,
    marginTop: 8,
  },
  surplusText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  extendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.background,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.lg,
    gap: 6,
  },
  extendBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  closeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.lg,
    gap: 6,
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});
