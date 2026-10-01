// CategoryPieChart: Clean category spending distribution and progress bars

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { CategorySpending } from '../../types/financial';
import { formatINR } from '../../utils/currency';

interface CategoryPieChartProps {
  categories: CategorySpending[];
  totalExpenses: number;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  categories,
  totalExpenses,
}) => {
  if (categories.length === 0 || totalExpenses === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Spending by Category</Text>
        <Text style={styles.emptyText}>No category expenses recorded in this period.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Spending by Category</Text>
        <Text style={styles.totalBadge}>Total: {formatINR(totalExpenses)}</Text>
      </View>

      {/* Multi-segment segmented progress bar */}
      <View style={styles.segmentedBar}>
        {categories.map((cat, idx) => {
          const widthPct = Math.max(2, cat.percentage);
          return (
            <View
              key={cat.name}
              style={[
                styles.barSegment,
                {
                  width: `${widthPct}%`,
                  backgroundColor: cat.color || THEME.colors.primary,
                  borderTopLeftRadius: idx === 0 ? 6 : 0,
                  borderBottomLeftRadius: idx === 0 ? 6 : 0,
                  borderTopRightRadius: idx === categories.length - 1 ? 6 : 0,
                  borderBottomRightRadius: idx === categories.length - 1 ? 6 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Category list items */}
      <View style={styles.list}>
        {categories.map((cat) => (
          <View key={cat.name} style={styles.categoryRow}>
            <View style={styles.categoryLeft}>
              <View style={[styles.colorDot, { backgroundColor: cat.color || THEME.colors.primary }]} />
              <Text style={styles.categoryName}>{cat.name}</Text>
            </View>

            <View style={styles.categoryRight}>
              <Text style={styles.categoryAmount}>{formatINR(cat.amount)}</Text>
              <Text style={styles.categoryPct}>{cat.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
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
  title: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  totalBadge: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.surfaceSubtle,
    overflow: 'hidden',
    marginBottom: THEME.spacing.md,
  },
  barSegment: {
    height: '100%',
  },
  list: {
    gap: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: THEME.borderRadius.full,
  },
  categoryName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textPrimary,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryAmount: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  categoryPct: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
