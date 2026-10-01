// TodayFixedWidget: Interactive widget for today's recurring expenses with Pay, Edit Amount, and Skip actions

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, XCircle, Clock, Repeat, ArrowRight, Edit3 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { TodayFixedExpenseItem } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { Badge } from '../common/Badge';
import { getCategoryMeta } from '../../constants/categories';

interface TodayFixedWidgetProps {
  items: TodayFixedExpenseItem[];
  onPay: (occurrenceId: string, customAmount?: number) => void;
  onEdit: (item: TodayFixedExpenseItem) => void;
  onSkip: (occurrenceId: string) => void;
  onViewAllPress: () => void;
}

export const TodayFixedWidget: React.FC<TodayFixedWidgetProps> = ({
  items,
  onPay,
  onEdit,
  onSkip,
  onViewAllPress,
}) => {
  const totalDueToday = items.reduce((sum, item) => sum + item.amount, 0);
  const totalPaidToday = items
    .filter((i) => i.status === 'completed')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Repeat size={16} color={THEME.colors.primary} />
          </View>
          <Text style={styles.title}>Today's Fixed Expenses</Text>
        </View>

        <TouchableOpacity
          onPress={onViewAllPress}
          style={styles.viewAllBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Manage</Text>
          <ArrowRight size={14} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No recurring expenses due today.</Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {items.map((item) => {
            const isCompleted = item.status === 'completed';
            const isSkipped = item.status === 'skipped';
            const isPending = item.status === 'pending';
            const meta = getCategoryMeta(item.category);

            return (
              <View key={item.occurrenceId} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: meta.color || THEME.colors.primary },
                    ]}
                  />
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category} • {item.frequency}</Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <Text
                    style={[
                      styles.itemAmount,
                      isCompleted && styles.amountCompleted,
                      isSkipped && styles.amountSkipped,
                    ]}
                  >
                    {formatINR(item.amount)}
                  </Text>

                  {isPending && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnPay]}
                        onPress={() => onPay(item.occurrenceId)}
                        activeOpacity={0.8}
                      >
                        <CheckCircle2 size={13} color="#FFF" />
                        <Text style={styles.btnPayText}>Pay</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnEdit]}
                        onPress={() => onEdit(item)}
                        activeOpacity={0.8}
                      >
                        <Edit3 size={12} color={THEME.colors.primary} />
                        <Text style={styles.btnEditText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnSkip]}
                        onPress={() => onSkip(item.occurrenceId)}
                        activeOpacity={0.8}
                      >
                        <XCircle size={13} color={THEME.colors.textSecondary} />
                        <Text style={styles.btnSkipText}>Skip</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isCompleted && (
                    <View style={styles.completedRow}>
                      <Badge label={`Paid ${formatINR(item.amount)}`} variant="success" size="sm" />
                      <TouchableOpacity
                        style={styles.adjustSmallBtn}
                        onPress={() => onEdit(item)}
                        activeOpacity={0.7}
                      >
                        <Edit3 size={11} color={THEME.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {isSkipped && (
                    <View style={styles.completedRow}>
                      <Badge label="Skipped" variant="warning" size="sm" />
                      <TouchableOpacity
                        style={styles.adjustSmallBtn}
                        onPress={() => onEdit(item)}
                        activeOpacity={0.7}
                      >
                        <Edit3 size={11} color={THEME.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>
              Total Due: <Text style={styles.footerBold}>{formatINR(totalDueToday)}</Text>
            </Text>
            <Text style={styles.footerLabel}>
              Paid Today: <Text style={styles.footerPaidBold}>{formatINR(totalPaidToday)}</Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primary,
  },
  emptyBox: {
    paddingVertical: THEME.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: THEME.borderRadius.full,
  },
  itemName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
  itemCategory: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textTransform: 'capitalize',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemAmount: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  amountCompleted: {
    color: THEME.colors.primaryDark,
  },
  amountSkipped: {
    color: THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: THEME.borderRadius.sm,
  },
  btnPay: {
    backgroundColor: THEME.colors.primary,
  },
  btnPayText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFF',
  },
  btnEdit: {
    backgroundColor: THEME.colors.primaryMuted,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  btnEditText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  btnSkip: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  btnSkipText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adjustSmallBtn: {
    padding: 3,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    marginTop: 4,
  },
  footerLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
  },
  footerBold: {
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  footerPaidBold: {
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryDark,
  },
});
