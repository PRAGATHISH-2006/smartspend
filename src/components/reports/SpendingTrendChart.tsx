// SpendingTrendChart: Daily spending trend bar chart with custom styling

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface DayPoint {
  date: string;
  dayLabel: string;
  amount: number;
}

interface SpendingTrendChartProps {
  data: DayPoint[];
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data }) => {
  const maxAmount = Math.max(...data.map((d) => d.amount), 100);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Daily Spending Trend</Text>

      <View style={styles.chartContainer}>
        {data.map((item, idx) => {
          const heightPct = Math.max(8, Math.round((item.amount / maxAmount) * 100));
          const hasSpending = item.amount > 0;

          return (
            <View key={item.date || idx} style={styles.barCol}>
              {hasSpending && (
                <Text style={styles.barValue}>{formatINR(item.amount, { compact: true })}</Text>
              )}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: hasSpending ? THEME.colors.primary : THEME.colors.border,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{item.dayLabel}</Text>
            </View>
          );
        })}
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
    marginBottom: THEME.spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingBottom: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 20,
    height: 95,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barValue: {
    fontSize: 9,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
    marginTop: 6,
  },
});
