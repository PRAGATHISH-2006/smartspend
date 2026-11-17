// HistoricalComparisonBarChart: Multi-month grouped bar chart comparing Current Month vs Archived Closed Months with Income (Gold) vs Expenses (Red)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Svg, { Rect, Line, G, Text as SvgText } from 'react-native-svg';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';
import { BarChart3, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react-native';

export interface MonthComparisonItem {
  id: string;
  monthName: string;
  shortName: string;
  totalIncome: number;
  totalExpense: number;
  netSurplus: number;
  isCurrent: boolean;
}

interface HistoricalComparisonBarChartProps {
  data: MonthComparisonItem[];
  onSelectMonth?: (id: string) => void;
  selectedMonthId?: string;
}

export const HistoricalComparisonBarChart: React.FC<HistoricalComparisonBarChartProps> = ({
  data,
  onSelectMonth,
  selectedMonthId,
}) => {
  const { width } = useWindowDimensions();
  const [activeItem, setActiveItem] = useState<MonthComparisonItem | null>(null);

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <BarChart3 size={18} color="#EAB308" />
            <Text style={styles.title}>Historical Multi-Month Comparison</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>
          Close your first monthly financial cycle to start seeing historical month-by-month trends here.
        </Text>
      </View>
    );
  }

  // Chart layout calculations
  const chartWidth = Math.min(width - 48, 860);
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const plotWidth = Math.max(120, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(60, chartHeight - paddingTop - paddingBottom);

  const maxVal = Math.max(
    1000,
    ...data.map((d) => Math.max(d.totalIncome, d.totalExpense))
  );

  const groupCount = data.length;
  const groupWidth = plotWidth / groupCount;
  const barWidth = Math.min(22, Math.max(10, (groupWidth - 14) / 2));

  const selected = activeItem || data.find((d) => d.id === selectedMonthId) || data[data.length - 1];

  return (
    <View style={styles.card}>
      {/* Header and Legend */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleRow}>
            <BarChart3 size={18} color="#EAB308" />
            <Text style={styles.title}>Historical Multi-Month Comparison</Text>
          </View>
          <Text style={styles.subtitle}>Current cycle vs. Archived months stored in Previous Details</Text>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
            <Text style={styles.legendText}>Income (Gold)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
            <Text style={styles.legendText}>Expenses (Red)</Text>
          </View>
        </View>
      </View>

      {/* Interactive Selected Month Tooltip */}
      {selected && (
        <View style={styles.tooltipCard}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipMonthTitle}>
              {selected.monthName} {selected.isCurrent ? '(Active Cycle)' : '(Archived)'}
            </Text>
            {onSelectMonth && !selected.isCurrent && (
              <TouchableOpacity
                style={styles.drillDownBtn}
                onPress={() => onSelectMonth(selected.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.drillDownBtnText}>Filter Analytics To This Month →</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tooltipStatsRow}>
            <View style={styles.tooltipStat}>
              <Text style={styles.tooltipStatLabel}>Income:</Text>
              <Text style={[styles.tooltipStatVal, { color: '#FACC15' }]}>
                +{formatINR(selected.totalIncome)}
              </Text>
            </View>

            <View style={styles.tooltipStat}>
              <Text style={styles.tooltipStatLabel}>Spent:</Text>
              <Text style={[styles.tooltipStatVal, { color: '#EF4444' }]}>
                -{formatINR(selected.totalExpense)}
              </Text>
            </View>

            <View style={styles.tooltipStat}>
              <Text style={styles.tooltipStatLabel}>Net Savings:</Text>
              <Text style={[styles.tooltipStatVal, { color: selected.netSurplus >= 0 ? '#EAB308' : '#EF4444' }]}>
                {formatINR(selected.netSurplus)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* SVG Grouped Bar Chart */}
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((lvl, idx) => {
            const y = paddingTop + plotHeight * (1 - lvl);
            return (
              <Line
                key={idx}
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + plotWidth}
                y2={y}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray={lvl === 0 ? undefined : '3,3'}
              />
            );
          })}

          {/* Grouped Bars */}
          {data.map((item, idx) => {
            const groupCenterX = paddingLeft + (idx + 0.5) * groupWidth;
            const incomeH = (item.totalIncome / maxVal) * plotHeight;
            const expenseH = (item.totalExpense / maxVal) * plotHeight;

            const incomeY = paddingTop + plotHeight - incomeH;
            const expenseY = paddingTop + plotHeight - expenseH;

            const isItemActive = selected?.id === item.id;

            return (
              <G
                key={item.id}
                onPress={() => {
                  setActiveItem(item);
                  if (onSelectMonth) onSelectMonth(item.id);
                }}
              >
                {/* Active Group Highlight Backing */}
                {isItemActive && (
                  <Rect
                    x={groupCenterX - groupWidth / 2 + 2}
                    y={paddingTop - 6}
                    width={groupWidth - 4}
                    height={plotHeight + 12}
                    fill="rgba(234, 179, 8, 0.08)"
                    rx={6}
                  />
                )}

                {/* Income Bar (Gold Yellow) */}
                <Rect
                  x={groupCenterX - barWidth - 2}
                  y={incomeY}
                  width={barWidth}
                  height={Math.max(2, incomeH)}
                  fill="#EAB308"
                  rx={3}
                />

                {/* Expense Bar (Vibrant Red) */}
                <Rect
                  x={groupCenterX + 2}
                  y={expenseY}
                  width={barWidth}
                  height={Math.max(2, expenseH)}
                  fill="#DC2626"
                  rx={3}
                />

                {/* Current cycle indicator dot */}
                {item.isCurrent && (
                  <Rect
                    x={groupCenterX - 3}
                    y={paddingTop + plotHeight + 18}
                    width={6}
                    height={6}
                    rx={3}
                    fill="#FACC15"
                  />
                )}
              </G>
            );
          })}

          {/* Baseline */}
          <Line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={paddingLeft + plotWidth}
            y2={paddingTop + plotHeight}
            stroke="#334155"
            strokeWidth="1.5"
          />
        </Svg>
      </View>

      {/* Month Labels under chart */}
      <View style={[styles.labelsRow, { paddingLeft, paddingRight }]}>
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.labelBtn, selected?.id === item.id && styles.labelBtnActive]}
            onPress={() => {
              setActiveItem(item);
              if (onSelectMonth) onSelectMonth(item.id);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.labelText, selected?.id === item.id && styles.labelTextActive]}>
              {item.shortName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: THEME.typography.weights.semibold,
  },
  tooltipCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  tooltipMonthTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  drillDownBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  drillDownBtnText: {
    color: '#FACC15',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  tooltipStatsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  tooltipStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tooltipStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  tooltipStatVal: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 2,
  },
  labelBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  labelBtnActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  labelText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: THEME.typography.weights.bold,
  },
  labelTextActive: {
    color: '#FACC15',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

