// WarningBanner: Actionable alert banners for Low Balance, Fixed Expense warnings and 5-Day alerts

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface WarningBannerProps {
  isLowBalance: boolean;
  isFixedExpenseWarning: boolean;
  isSafeToSpendNegative: boolean;
  isFiveDaysRemaining: boolean;
  currentBalance: number;
  upcomingFixedExpenses: number;
  safeToSpend: number;
  daysRemaining: number;
  lowBalanceThreshold: number;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  isLowBalance,
  isFixedExpenseWarning,
  isSafeToSpendNegative,
  isFiveDaysRemaining,
  currentBalance,
  upcomingFixedExpenses,
  safeToSpend,
  daysRemaining,
  lowBalanceThreshold,
}) => {
  // If no warning conditions exist, render nothing
  if (
    !isLowBalance &&
    !isFixedExpenseWarning &&
    !isSafeToSpendNegative &&
    !isFiveDaysRemaining
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 1. Safe To Spend Negative Warning */}
      {isSafeToSpendNegative && (
        <View style={[styles.banner, styles.bannerDanger]}>
          <View style={styles.iconCircleDanger}>
            <AlertCircle size={20} color={THEME.colors.danger} />
          </View>
          <View style={styles.content}>
            <Text style={styles.titleDanger}>🔴 INSUFFICIENT FOR FIXED EXPENSES</Text>
            <Text style={styles.textDanger}>
              Your balance ({formatINR(currentBalance)}) cannot cover upcoming fixed commitments ({formatINR(upcomingFixedExpenses)}). Shortfall: {formatINR(Math.abs(safeToSpend))}.
            </Text>
          </View>
        </View>
      )}

      {/* 2. Fixed Expense Warning (High proportion) */}
      {!isSafeToSpendNegative && isFixedExpenseWarning && (
        <View style={[styles.banner, styles.bannerWarning]}>
          <View style={styles.iconCircleWarning}>
            <AlertTriangle size={20} color="#B45309" />
          </View>
          <View style={styles.content}>
            <Text style={styles.titleWarning}>🔴 FIXED EXPENSE WARNING</Text>
            <Text style={styles.textWarning}>
              {formatINR(upcomingFixedExpenses)} is required for upcoming fixed expenses. Only {formatINR(safeToSpend)} is currently safe to spend.
            </Text>
          </View>
        </View>
      )}

      {/* 3. Low Balance Warning */}
      {isLowBalance && !isSafeToSpendNegative && (
        <View style={[styles.banner, styles.bannerWarning]}>
          <View style={styles.iconCircleWarning}>
            <AlertTriangle size={20} color="#B45309" />
          </View>
          <View style={styles.content}>
            <Text style={styles.titleWarning}>⚠️ LOW BALANCE</Text>
            <Text style={styles.textWarning}>
              Your balance is below your configured threshold ({formatINR(lowBalanceThreshold)}).
              Days Remaining: {daysRemaining} | Expected Fixed: {formatINR(upcomingFixedExpenses)} | Safe: {formatINR(safeToSpend)}
            </Text>
          </View>
        </View>
      )}

      {/* 4. Five Day Milestone Alert */}
      {isFiveDaysRemaining && (
        <View style={[styles.banner, styles.bannerInfo]}>
          <View style={styles.iconCircleInfo}>
            <Clock size={20} color={THEME.colors.indigo} />
          </View>
          <View style={styles.content}>
            <Text style={styles.titleInfo}>⚠️ 5 DAYS REMAINING</Text>
            <Text style={styles.textInfo}>
              {isLowBalance
                ? `Only ${formatINR(currentBalance)} remains and ${formatINR(upcomingFixedExpenses)} is expected for fixed expenses.`
                : 'You have 5 days remaining in your current budget period.'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
    gap: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    borderWidth: 1.5,
  },
  content: {
    flex: 1,
    marginLeft: THEME.spacing.sm,
  },
  bannerDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  iconCircleDanger: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleDanger: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.heavy,
    color: '#991B1B',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  textDanger: {
    fontSize: THEME.typography.sizes.xs,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  bannerWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  iconCircleWarning: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWarning: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.heavy,
    color: '#92400E',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  textWarning: {
    fontSize: THEME.typography.sizes.xs,
    color: '#78350F',
    lineHeight: 18,
  },
  bannerInfo: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  iconCircleInfo: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfo: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.heavy,
    color: '#3730A3',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  textInfo: {
    fontSize: THEME.typography.sizes.xs,
    color: '#312E81',
    lineHeight: 18,
  },
});
