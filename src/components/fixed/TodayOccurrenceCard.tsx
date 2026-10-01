// TodayOccurrenceCard: Focused card for a specific occurrence on today's schedule with Pay, Edit Amount, and Skip actions

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, X, Repeat, CheckCircle, Edit3 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { TodayFixedExpenseItem } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { Badge } from '../common/Badge';
import { getCategoryMeta } from '../../constants/categories';

interface TodayOccurrenceCardProps {
  item: TodayFixedExpenseItem;
  onPay: (occurrenceId: string, customAmount?: number) => void;
  onEdit: (item: TodayFixedExpenseItem) => void;
  onSkip: (occurrenceId: string) => void;
}

export const TodayOccurrenceCard: React.FC<TodayOccurrenceCardProps> = ({
  item,
  onPay,
  onEdit,
  onSkip,
}) => {
  const meta = getCategoryMeta(item.category);
  const isCompleted = item.status === 'completed';
  const isSkipped = item.status === 'skipped';
  const isPending = item.status === 'pending';

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={[styles.iconCircle, { backgroundColor: meta.bgColor || THEME.colors.primaryMuted }]}>
          <Repeat size={18} color={meta.color || THEME.colors.primary} />
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.category}>{item.category} • {item.frequency}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.amount,
            isCompleted && styles.amountPaid,
            isSkipped && styles.amountSkipped,
          ]}
        >
          {formatINR(item.amount)}
        </Text>

        {isPending && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPay]}
              onPress={() => onPay(item.occurrenceId)}
              activeOpacity={0.8}
            >
              <Check size={14} color="#FFF" />
              <Text style={styles.btnPayText}>Pay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnEdit]}
              onPress={() => onEdit(item)}
              activeOpacity={0.8}
            >
              <Edit3 size={13} color={THEME.colors.primary} />
              <Text style={styles.btnEditText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnSkip]}
              onPress={() => onSkip(item.occurrenceId)}
              activeOpacity={0.8}
            >
              <X size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.btnSkipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedBadgeRow}>
            <Badge label={`Paid ${formatINR(item.amount)}`} variant="success" size="sm" icon={<CheckCircle size={12} color={THEME.colors.primaryDark} />} />
            <TouchableOpacity
              style={styles.adjustPaidBtn}
              onPress={() => onEdit(item)}
              activeOpacity={0.7}
            >
              <Edit3 size={12} color={THEME.colors.primary} />
              <Text style={styles.adjustPaidText}>Adjust</Text>
            </TouchableOpacity>
          </View>
        )}

        {isSkipped && (
          <View style={styles.completedBadgeRow}>
            <Badge label="Skipped (₹0)" variant="warning" size="sm" />
            <TouchableOpacity
              style={styles.adjustPaidBtn}
              onPress={() => onEdit(item)}
              activeOpacity={0.7}
            >
              <Edit3 size={12} color={THEME.colors.primary} />
              <Text style={styles.adjustPaidText}>Pay</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  title: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  category: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
  },
  amountPaid: {
    color: THEME.colors.primaryDark,
  },
  amountSkipped: {
    color: THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.md,
  },
  btnPay: {
    backgroundColor: THEME.colors.primary,
  },
  btnPayText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFF',
  },
  btnEdit: {
    backgroundColor: THEME.colors.primaryMuted,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  btnEditText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  btnSkip: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  btnSkipText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
  },
  completedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  adjustPaidText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primary,
  },
});
