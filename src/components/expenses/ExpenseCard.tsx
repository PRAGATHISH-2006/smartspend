// ExpenseCard: Formatted transaction card for expense feeds & history

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Repeat, AlertCircle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { UnifiedTransaction } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { getCategoryMeta } from '../../constants/categories';
import { Badge } from '../common/Badge';

interface ExpenseCardProps {
  transaction: UnifiedTransaction;
  onPress?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ transaction, onPress }) => {
  const isIncome = transaction.rawType === 'income';
  const isSkipped = transaction.rawType === 'skipped';
  const meta = getCategoryMeta(transaction.category);

  const getTypeBadge = () => {
    switch (transaction.type) {
      case 'money_added':
        return <Badge label="Top-up" variant="success" size="sm" />;
      case 'fixed_expense':
        return <Badge label="Fixed" variant="indigo" size="sm" />;
      case 'skipped_fixed_expense':
        return <Badge label="Skipped (₹0)" variant="warning" size="sm" />;
      case 'manual_expense':
      default:
        return <Badge label="Manual" variant="neutral" size="sm" />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isIncome
                ? THEME.colors.primaryMuted
                : isSkipped
                ? THEME.colors.amberLight
                : meta.bgColor || THEME.colors.surfaceSubtle,
            },
          ]}
        >
          {isIncome ? (
            <ArrowUpRight size={18} color={THEME.colors.primaryDark} />
          ) : isSkipped ? (
            <AlertCircle size={18} color="#B45309" />
          ) : transaction.type === 'fixed_expense' ? (
            <Repeat size={18} color={THEME.colors.indigo} />
          ) : (
            <ArrowDownLeft size={18} color={meta.color || THEME.colors.rose} />
          )}
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={1}>
            {transaction.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{transaction.category}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>{formatFriendlyDate(transaction.date)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.amount,
            isIncome && styles.amountIncome,
            isSkipped && styles.amountSkipped,
          ]}
        >
          {isIncome
            ? `+${formatINR(transaction.amount)}`
            : isSkipped
            ? `₹0`
            : `-${formatINR(transaction.amount)}`}
        </Text>
        <View style={styles.badgeWrapper}>{getTypeBadge()}</View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.xl,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  category: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  dot: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  date: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.roseDark,
  },
  amountIncome: {
    color: THEME.colors.primaryDark,
  },
  amountSkipped: {
    color: THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  badgeWrapper: {
    marginTop: 2,
  },
});
