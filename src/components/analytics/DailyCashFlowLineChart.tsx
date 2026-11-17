// DailyCashFlowLineChart: Interactive Dual-Line SVG chart tracking daily Income vs. Expenses with Yellow & Red palette, gradients, and hover scrubber

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
  G,
  Rect,
} from 'react-native-svg';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';
import { TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

export interface DayCashFlowPoint {
  day: number;
  dateStr: string;
  dayLabel: string;
  income: number;
  expense: number;
}

interface DailyCashFlowLineChartProps {
  data: DayCashFlowPoint[];
  monthLabel: string;
}

export const DailyCashFlowLineChart: React.FC<DailyCashFlowLineChartProps> = ({
  data,
  monthLabel,
}) => {
  const { width } = useWindowDimensions();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Daily Cash Flow Trend</Text>
        <Text style={styles.emptyText}>No cash flow activity recorded in this period.</Text>
      </View>
    );
  }

  // Chart dimensions
  const chartWidth = Math.min(width - 48, 860);
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const plotWidth = Math.max(100, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(60, chartHeight - paddingTop - paddingBottom);

  const maxVal = Math.max(
    1000,
    ...data.map((d) => Math.max(d.income, d.expense))
  );

  // Compute point coordinates
  const n = data.length;
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, n - 1)) * plotWidth;
    const yIncome = paddingTop + plotHeight - (d.income / maxVal) * plotHeight;
    const yExpense = paddingTop + plotHeight - (d.expense / maxVal) * plotHeight;
    return { ...d, x, yIncome, yExpense };
  });

  // Generate smooth cubic bezier SVG paths
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const incomeLinePath = createSmoothPath(points.map((p) => ({ x: p.x, y: p.yIncome })));
  const expenseLinePath = createSmoothPath(points.map((p) => ({ x: p.x, y: p.yExpense })));

  const baselineY = paddingTop + plotHeight;
  const incomeAreaPath = `${incomeLinePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
  const expenseAreaPath = `${expenseLinePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

  // Grid horizontal lines
  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  const activePoint = activeIdx !== null && activeIdx >= 0 && activeIdx < points.length ? points[activeIdx] : null;

  const handleTouch = (evt: any) => {
    const locX = evt.nativeEvent.locationX;
    const ratio = (locX - paddingLeft) / plotWidth;
    const index = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
    setActiveIdx(index);
  };

  return (
    <View style={styles.card}>
      {/* Header with Title and Legend */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleRow}>
            <TrendingUp size={18} color="#EAB308" />
            <Text style={styles.title}>Daily Cash Flow Trend</Text>
          </View>
          <Text style={styles.subtitle}>Day-by-day Income vs. Expenses ({monthLabel})</Text>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FACC15' }]} />
            <Text style={styles.legendText}>Income (₹)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Expenses (₹)</Text>
          </View>
        </View>
      </View>

      {/* Interactive Tooltip Card */}
      {activePoint ? (
        <View style={styles.tooltipBar}>
          <Text style={styles.tooltipDate}>{activePoint.dayLabel} ({activePoint.dateStr}):</Text>
          <View style={styles.tooltipMetrics}>
            <Text style={styles.tooltipIncome}>+{formatINR(activePoint.income)}</Text>
            <Text style={styles.tooltipDivider}>|</Text>
            <Text style={styles.tooltipExpense}>-{formatINR(activePoint.expense)}</Text>
            <Text style={styles.tooltipDivider}>|</Text>
            <Text style={[styles.tooltipNet, { color: activePoint.income >= activePoint.expense ? '#EAB308' : '#EF4444' }]}>
              Net {formatINR(activePoint.income - activePoint.expense)}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.scrubberHint}>Tap or hover across the chart to inspect daily transactions</Text>
      )}

      {/* Responsive SVG Chart with Touch/Hover Scrubber */}
      <View
        style={styles.svgContainer}
        onStartShouldSetResponder={() => true}
        onResponderMove={handleTouch}
        onResponderGrant={handleTouch}
      >
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            {/* Income Gradient (Gold/Yellow) */}
            <LinearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#EAB308" stopOpacity={0.28} />
              <Stop offset="100%" stopColor="#EAB308" stopOpacity={0.0} />
            </LinearGradient>

            {/* Expense Gradient (Vibrant Red) */}
            <LinearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#DC2626" stopOpacity={0.28} />
              <Stop offset="100%" stopColor="#DC2626" stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid Background Lines & Y-axis labels */}
          {gridLevels.map((lvl, idx) => {
            const y = paddingTop + plotHeight * (1 - lvl);
            const val = Math.round(maxVal * lvl);
            return (
              <G key={idx}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + plotWidth}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray={lvl === 0 ? undefined : '3,3'}
                />
              </G>
            );
          })}

          {/* Area Fills */}
          <Path d={incomeAreaPath} fill="url(#incomeAreaGrad)" />
          <Path d={expenseAreaPath} fill="url(#expenseAreaGrad)" />

          {/* Lines */}
          <Path
            d={incomeLinePath}
            fill="none"
            stroke="#FACC15" // Vibrant Gold Yellow
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <Path
            d={expenseLinePath}
            fill="none"
            stroke="#EF4444" // Vibrant Red
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Vertical Active Scrubber Line */}
          {activePoint && (
            <G>
              <Line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={baselineY}
                stroke="#EAB308"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Highlight Dot Income */}
              <Circle
                cx={activePoint.x}
                cy={activePoint.yIncome}
                r="5"
                fill="#FACC15"
                stroke="#090D16"
                strokeWidth="2"
              />
              {/* Highlight Dot Expense */}
              <Circle
                cx={activePoint.x}
                cy={activePoint.yExpense}
                r="5"
                fill="#EF4444"
                stroke="#090D16"
                strokeWidth="2"
              />
            </G>
          )}

          {/* X Axis Baseline */}
          <Line
            x1={paddingLeft}
            y1={baselineY}
            x2={paddingLeft + plotWidth}
            y2={baselineY}
            stroke="#334155"
            strokeWidth="1.5"
          />
        </Svg>
      </View>

      {/* X-axis date milestones */}
      <View style={[styles.xAxisLabels, { paddingLeft, paddingRight }]}>
        {points
          .filter((_, i) => i === 0 || i === Math.floor(n / 2) || i === n - 1)
          .map((p, idx) => (
            <Text key={idx} style={styles.axisLabel}>
              {p.dayLabel} {p.day}
            </Text>
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
    marginBottom: 8,
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
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: THEME.typography.weights.semibold,
  },
  tooltipBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EAB308',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  tooltipDate: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
  },
  tooltipMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tooltipIncome: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  tooltipExpense: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  tooltipDivider: {
    color: '#475569',
    fontSize: 11,
  },
  tooltipNet: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  scrubberHint: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  axisLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: THEME.typography.weights.semibold,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

