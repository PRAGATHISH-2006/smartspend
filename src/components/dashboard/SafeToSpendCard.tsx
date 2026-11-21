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
              <AlertTriangle size={18} color="#EF4444" />
            ) : (
              <ShieldCheck size={18} color="#EAB308" />
            )}
          </View>
          <View>
            <Text style={styles.title}>Safe to Spend</Text>
            <Text style={styles.subtitle}>
              {safeToSpend === 0 && !isNegative
                ? 'Add funds to activate daily allowance'
                : 'After reserved fixed commitments'}
            </Text>
          </View>
        </View>

        <View style={styles.daysPill}>
          <Calendar size={12} color="#FACC15" />
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
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: '#EAB308', // Warm Golden Yellow
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  containerNegative: {
    borderColor: '#DC2626',
    backgroundColor: '#111726',
    shadowColor: '#DC2626',
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
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldCircleNegative: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  title: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: '#94A3B8',
  },
  daysPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  daysText: {
    fontSize: THEME.typography.sizes.xs,
    color: '#FACC15',
    fontWeight: THEME.typography.weights.bold,
  },
  safeAmount: {
    fontSize: THEME.typography.sizes.display,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FACC15',
    letterSpacing: -0.5,
    marginVertical: THEME.spacing.xs,
  },
  safeAmountNegative: {
    color: '#EF4444',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070A12',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.xs,
    borderWidth: 1,
    borderColor: '#1E293B',
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
