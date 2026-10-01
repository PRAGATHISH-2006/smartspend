// RecurringPerformanceTable: Table summarizing recurring expense occurrences and paid vs skipped days

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface RecurringPerformanceItem {
  name: string;
  paidDays: number;
  skippedDays: number;
  amountPaid: number;
}

interface RecurringPerformanceTableProps {
  items: RecurringPerformanceItem[];
}

export const RecurringPerformanceTable: React.FC<RecurringPerformanceTableProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  const totalFixedPaid = items.reduce((sum, i) => sum + i.amountPaid, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Daily Recurring Performance</Text>
      <Text style={styles.subtitle}>Occurrences recorded in selected period</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.colName]}>Expense</Text>
        <Text style={[styles.headerCell, styles.colPaid]}>Paid</Text>
        <Text style={[styles.headerCell, styles.colSkipped]}>Skipped</Text>
        <Text style={[styles.headerCell, styles.colTotal]}>Total Paid</Text>
      </View>

      {items.map((item, idx) => (
        <View key={item.name + idx} style={styles.tableRow}>
          <Text style={[styles.cellText, styles.colName, styles.nameText]}>{item.name}</Text>
          <Text style={[styles.cellText, styles.colPaid, styles.paidText]}>{item.paidDays} days</Text>
          <Text style={[styles.cellText, styles.colSkipped, styles.skippedText]}>
            {item.skippedDays} days
          </Text>
          <Text style={[styles.cellText, styles.colTotal, styles.totalText]}>
            {formatINR(item.amountPaid)}
          </Text>
        </View>
      ))}

      <View style={styles.tableFooter}>
        <Text style={styles.footerLabel}>Total Recurring Paid</Text>
        <Text style={styles.footerValue}>{formatINR(totalFixedPaid)}</Text>
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
  },
  subtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  colName: {
    flex: 2.2,
  },
  colPaid: {
    flex: 1.2,
    textAlign: 'center',
  },
  colSkipped: {
    flex: 1.2,
    textAlign: 'center',
  },
  colTotal: {
    flex: 1.6,
    textAlign: 'right',
  },
  cellText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textPrimary,
  },
  nameText: {
    fontWeight: THEME.typography.weights.semibold,
  },
  paidText: {
    color: THEME.colors.primaryDark,
    fontWeight: THEME.typography.weights.semibold,
  },
  skippedText: {
    color: '#B45309',
  },
  totalText: {
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  footerLabel: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  footerValue: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.primaryDark,
  },
});
