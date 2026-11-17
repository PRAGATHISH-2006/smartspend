// AnalyticsSummaryCards: Top-level executive metric cards for income, expenses, net savings, and daily average burn

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Flame,
  TrendingUp,
  AlertTriangle,
  Wallet,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface AnalyticsSummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  dailyAverage: number;
  daysCount: number;
  inflowCount: number;
  outflowCount: number;
  savingsRate?: number;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  netSavings,
  dailyAverage,
  daysCount,
  inflowCount,
  outflowCount,
  savingsRate = 0,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const isSurplus = netSavings >= 0;
  const spendRatio = totalIncome > 0 ? Math.min(999, Math.round((totalExpenses / totalIncome) * 100)) : 100;
  const calculatedSavingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  return (
    <View style={[styles.grid, isDesktop ? styles.gridDesktop : styles.gridMobile]}>
      {/* 1. Total Income Card */}
      <View style={[styles.card, styles.cardIncome]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, styles.iconIncome]}>
            <ArrowDownLeft size={16} color="#EAB308" />
          </View>
          <View style={styles.badgeGold}>
            <TrendingUp size={11} color="#FACC15" />
            <Text style={styles.badgeGoldText}>+{inflowCount} deposits</Text>
          </View>
        </View>

        <Text style={styles.cardLabel}>TOTAL INCOME</Text>
        <Text style={[styles.cardValue, { color: '#FACC15' }]}>
          {formatINR(totalIncome)}
        </Text>

        <Text style={styles.cardSubtext}>
          Total cash additions & deposits this cycle
        </Text>
      </View>

      {/* 2. Total Expenses Card */}
      <View style={[styles.card, styles.cardExpense]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, styles.iconExpense]}>
            <ArrowUpRight size={16} color="#EF4444" />
          </View>
          <View style={styles.badgeRed}>
            <Text style={styles.badgeRedText}>{spendRatio}% of income</Text>
          </View>
        </View>

        <Text style={styles.cardLabel}>TOTAL EXPENSES</Text>
        <Text style={[styles.cardValue, { color: '#EF4444' }]}>
          {formatINR(totalExpenses)}
        </Text>

        <Text style={styles.cardSubtext}>
          {outflowCount} combined expenses & fixed commitments
        </Text>
      </View>

      {/* 3. Net Savings / Surplus Card */}
      <View style={[styles.card, isSurplus ? styles.cardSurplus : styles.cardDeficit]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, isSurplus ? styles.iconSurplus : styles.iconDeficit]}>
            {isSurplus ? (
              <Sparkles size={16} color="#FACC15" />
            ) : (
              <AlertTriangle size={16} color="#EF4444" />
            )}
          </View>
          <View style={isSurplus ? styles.badgeSurplus : styles.badgeDeficit}>
            <Text style={isSurplus ? styles.badgeSurplusText : styles.badgeDeficitText}>
              {isSurplus ? `${calculatedSavingsRate}% Saved` : 'Over Budget'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardLabel}>
          {isSurplus ? 'NET SURPLUS / SAVINGS' : 'NET DEFICIT'}
        </Text>
        <Text style={[styles.cardValue, { color: isSurplus ? '#EAB308' : '#EF4444' }]}>
          {formatINR(netSavings)}
        </Text>

        <Text style={styles.cardSubtext}>
          {isSurplus
            ? 'Positive cash flow ready for month rollover'
            : 'Expenses exceeded income in this period'}
        </Text>
      </View>

      {/* 4. Daily Average Spend Card */}
      <View style={[styles.card, styles.cardDaily]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, styles.iconDaily]}>
            <Flame size={16} color="#EAB308" />
          </View>
          <View style={styles.badgeDaily}>
            <Text style={styles.badgeDailyText}>{daysCount} days active</Text>
          </View>
        </View>

        <Text style={styles.cardLabel}>DAILY AVERAGE SPEND</Text>
        <Text style={[styles.cardValue, { color: '#F8FAFC' }]}>
          {formatINR(dailyAverage)} <Text style={styles.unitText}>/ day</Text>
        </Text>

        <Text style={styles.cardSubtext}>
          Average daily burn rate across the month
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    marginBottom: THEME.spacing.md,
  },
  gridDesktop: {
    flexDirection: 'row',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
  },
  cardIncome: {
    borderColor: '#EAB308', // Warm Gold
    shadowColor: '#EAB308',
  },
  cardExpense: {
    borderColor: '#DC2626', // Vibrant Red
    shadowColor: '#DC2626',
  },
  cardSurplus: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
  },
  cardDeficit: {
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  cardDaily: {
    borderColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconIncome: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  iconExpense: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  iconSurplus: {
    backgroundColor: 'rgba(234, 179, 8, 0.18)',
  },
  iconDeficit: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  iconDaily: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
  badgeGold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  badgeGoldText: {
    color: '#FACC15',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  badgeRed: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  badgeRedText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  badgeSurplus: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
  },
  badgeSurplusText: {
    color: '#FACC15',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  badgeDeficit: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  badgeDeficitText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  badgeDaily: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeDailyText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: THEME.typography.weights.semibold,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.heavy,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  unitText: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.medium,
    color: '#94A3B8',
  },
  cardSubtext: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
});

