// SafeToSpendCard: Visualizes Safe-to-Spend limit, reserved fixed expenses, and daily allowance

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Calendar, Lock, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface SafeToSpendCardProps {
  safeToSpend: number;
  upcomingFixedExpenses: number;
  daysRemaining: number;
  safeDailySpending: number;
  periodType: 'weekly' | 'monthly' | 'custom';
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  safeToSpend,
  upcomingFixedExpenses,
  daysRemaining,
  safeDailySpending,
  periodType,
}) => {
  const isNegative = safeToSpend < 0;

  return (
    <View style={[styles.container, isNegative && styles.containerNegative]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.shieldCircle, isNegative && styles.shieldCircleNegative]}>
            {isNegative ? (
              <AlertTriangle size={18} color={THEME.colors.danger} />
            ) : (
              <ShieldCheck size={18} color={THEME.colors.primary} />
            )}
          </View>
          <View>
            <Text style={styles.title}>Safe to Spend</Text>
            <Text style={styles.subtitle}>After reserved fixed commitments</Text>
          </View>
        </View>

        <View style={styles.daysPill}>
          <Calendar size={12} color={THEME.colors.indigo} />
          <Text style={styles.daysText}>{daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Left</Text>
        </View>
      </View>

      <Text style={[styles.safeAmount, isNegative && styles.safeAmountNegative]}>
        {formatINR(safeToSpend)}
      </Text>

      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <View style={styles.colHeader}>
            <Lock size={12} color={THEME.colors.amber} />
            <Text style={styles.colLabel}>Reserved for Fixed</Text>
          </View>
          <Text style={styles.colValue}>{formatINR(upcomingFixedExpenses)}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.gridCol}>
          <View style={styles.colHeader}>
            <TrendingUp size={12} color={THEME.colors.primary} />
            <Text style={styles.colLabel}>Daily Allowance</Text>
          </View>
          <Text style={styles.colValue}>
            {isNegative ? '₹0 / day' : `${formatINR(safeDailySpending)} / day`}
          </Text>
        </View>
      </View>
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
    borderWidth: 1.5,
    borderColor: THEME.colors.primaryBorder,
    ...THEME.shadows.card,
  },
  containerNegative: {
    borderColor: THEME.colors.roseBorder,
    backgroundColor: '#FFF5F5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldCircle: {
    width: 34,
    height: 34,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldCircleNegative: {
    backgroundColor: THEME.colors.roseLight,
  },
  title: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
  },
  daysPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.indigoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
  },
  daysText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.indigo,
    fontWeight: THEME.typography.weights.semibold,
  },
  safeAmount: {
    fontSize: THEME.typography.sizes.display,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.primaryDark,
    letterSpacing: -0.5,
    marginVertical: THEME.spacing.xs,
  },
  safeAmountNegative: {
    color: THEME.colors.danger,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.xs,
  },
  gridCol: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.border,
    marginHorizontal: THEME.spacing.sm,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  colLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.regular,
  },
  colValue: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
});
