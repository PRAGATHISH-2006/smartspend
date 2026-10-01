// FinancialSummaryCards: High-density financial health KPI dashboard

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface FinancialSummaryCardsProps {
  startingBalance: number;
  moneyAdded: number;
  manualExpenses: number;
  fixedExpenses: number;
  totalExpenses: number;
  remainingBalance: number;
  upcomingFixedExpenses: number;
  safeToSpend: number;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  startingBalance,
  moneyAdded,
  manualExpenses,
  fixedExpenses,
  totalExpenses,
  remainingBalance,
  upcomingFixedExpenses,
  safeToSpend,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Hero Pair */}
      <View style={styles.heroRow}>
        <View style={[styles.heroCard, styles.heroCardBalance]}>
          <Text style={styles.heroLabel}>Remaining Balance</Text>
          <Text style={styles.heroValueBalance}>{formatINR(remainingBalance)}</Text>
          <Text style={styles.heroSub}>In Wallet</Text>
        </View>

        <View style={[styles.heroCard, styles.heroCardSafe]}>
          <Text style={styles.heroLabel}>Safe to Spend</Text>
          <Text style={styles.heroValueSafe}>{formatINR(safeToSpend)}</Text>
          <Text style={styles.heroSub}>After Fixed Reserve</Text>
        </View>
      </View>

      {/* Grid of details */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Starting Balance</Text>
          <Text style={styles.gridValue}>{formatINR(startingBalance)}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Money Added</Text>
          <Text style={[styles.gridValue, styles.valuePositive]}>+{formatINR(moneyAdded)}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Manual Expenses</Text>
          <Text style={[styles.gridValue, styles.valueNegative]}>-{formatINR(manualExpenses)}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Fixed Completed</Text>
          <Text style={[styles.gridValue, styles.valueNegative]}>-{formatINR(fixedExpenses)}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Total Expenses</Text>
          <Text style={[styles.gridValue, styles.valueNegativeBold]}>-{formatINR(totalExpenses)}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Upcoming Fixed</Text>
          <Text style={[styles.gridValue, styles.valueWarning]}>{formatINR(upcomingFixedExpenses)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  heroCard: {
    flex: 1,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.md,
    borderWidth: 1.5,
    ...THEME.shadows.subtle,
  },
  heroCardBalance: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  heroCardSafe: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  heroLabel: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroValueBalance: {
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: THEME.typography.weights.heavy,
    color: '#15803D',
    marginTop: 4,
  },
  heroValueSafe: {
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: THEME.typography.weights.heavy,
    color: '#047857',
    marginTop: 4,
  },
  heroSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  gridItem: {
    width: '48%',
    paddingVertical: 4,
  },
  gridLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
  },
  gridValue: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  valuePositive: {
    color: THEME.colors.primary,
  },
  valueNegative: {
    color: THEME.colors.rose,
  },
  valueNegativeBold: {
    color: THEME.colors.danger,
    fontWeight: THEME.typography.weights.heavy,
  },
  valueWarning: {
    color: '#B45309',
  },
});
