// ExpenseComparisonBar: Visualizes proportion of Fixed vs Manual Expenses

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface ExpenseComparisonBarProps {
  manualExpenses: number;
  fixedExpenses: number;
}

export const ExpenseComparisonBar: React.FC<ExpenseComparisonBarProps> = ({
  manualExpenses,
  fixedExpenses,
}) => {
  const total = manualExpenses + fixedExpenses;
  const manualPct = total > 0 ? Math.round((manualExpenses / total) * 100) : 0;
  const fixedPct = total > 0 ? Math.round((fixedExpenses / total) * 100) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Fixed vs. Manual Spending</Text>

      {/* Comparison Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.fixedBar, { width: `${Math.max(2, fixedPct)}%` }]} />
        <View style={[styles.manualBar, { width: `${Math.max(2, manualPct)}%` }]} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: THEME.colors.indigo }]} />
            <Text style={styles.label}>Fixed Recurring</Text>
          </View>
          <Text style={styles.value}>{formatINR(fixedExpenses)} ({fixedPct}%)</Text>
        </View>

        <View style={styles.statCol}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: THEME.colors.amber }]} />
            <Text style={styles.label}>Manual Spending</Text>
          </View>
          <Text style={styles.value}>{formatINR(manualExpenses)} ({manualPct}%)</Text>
        </View>
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
  title: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.md,
  },
  progressBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.colors.surfaceSubtle,
    overflow: 'hidden',
    marginBottom: THEME.spacing.md,
  },
  fixedBar: {
    backgroundColor: THEME.colors.indigo,
    height: '100%',
  },
  manualBar: {
    backgroundColor: THEME.colors.amber,
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: THEME.borderRadius.full,
  },
  label: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  value: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginLeft: 14,
  },
});
