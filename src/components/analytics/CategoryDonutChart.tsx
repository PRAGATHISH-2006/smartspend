// CategoryDonutChart: Modern interactive Donut chart visualizing expense distribution by category with center statistics & detail chips

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { THEME } from '../../constants/theme';
import { CategorySpending } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { PieChart, Tag, Sparkles } from 'lucide-react-native';

interface CategoryDonutChartProps {
  categories: CategorySpending[];
  totalExpenses: number;
}

const RED_YELLOW_PALETTE = [
  '#DC2626', // Vibrant Red
  '#EAB308', // Warm Gold
  '#EF4444', // Red 500
  '#FACC15', // Yellow 400
  '#B91C1C', // Dark Red
  '#CA8A04', // Dark Gold
  '#F97316', // Orange 500
  '#F59E0B', // Amber 500
  '#7F1D1D', // Deep Wine Red
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalExpenses,
}) => {
  const { width } = useWindowDimensions();
  const [selectedCat, setSelectedCat] = useState<CategorySpending | null>(null);

  if (!categories || categories.length === 0 || totalExpenses <= 0) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <PieChart size={18} color="#EAB308" />
            <Text style={styles.title}>Spending by Category</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>No category expenses recorded in this period.</Text>
      </View>
    );
  }

  // Svg donut parameters
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 92;
  const innerR = 64;

  // Compute donut slice paths
  let currentAngle = -90; // Start at top
  const slices = categories.map((cat, idx) => {
    const sliceAngle = Math.max(1, (cat.amount / totalExpenses) * 360);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle += sliceAngle;

    // Convert polar to cartesian
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + outerR * Math.cos(toRad(startAngle));
    const y1 = cy + outerR * Math.sin(toRad(startAngle));
    const x2 = cx + outerR * Math.cos(toRad(endAngle - 1)); // 1 deg gap for sleek separation
    const y2 = cy + outerR * Math.sin(toRad(endAngle - 1));

    const ix1 = cx + innerR * Math.cos(toRad(endAngle - 1));
    const iy1 = cy + innerR * Math.sin(toRad(endAngle - 1));
    const ix2 = cx + innerR * Math.cos(toRad(startAngle));
    const iy2 = cy + innerR * Math.sin(toRad(startAngle));

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

    const color = cat.color || RED_YELLOW_PALETTE[idx % RED_YELLOW_PALETTE.length];
    return { ...cat, d, color };
  });

  const activeSlice = selectedCat || categories[0];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <PieChart size={18} color="#EAB308" />
          <Text style={styles.title}>Spending by Category</Text>
        </View>
        <View style={styles.totalPill}>
          <Text style={styles.totalPillText}>{categories.length} Categories</Text>
        </View>
      </View>

      {/* Donut and Center Statistic Display */}
      <View style={styles.donutContainer}>
        <View style={styles.donutSvgWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G>
              {slices.map((slice, idx) => {
                const isSelected = selectedCat?.name === slice.name;
                return (
                  <Path
                    key={idx}
                    d={slice.d}
                    fill={slice.color}
                    opacity={selectedCat && !isSelected ? 0.45 : 1}
                    onPress={() => setSelectedCat(slice)}
                  />
                );
              })}
            </G>
          </Svg>

          {/* Center Callout */}
          <View style={styles.centerCallout}>
            <Text style={styles.centerLabel} numberOfLines={1}>
              {selectedCat ? selectedCat.name : 'Total Spent'}
            </Text>
            <Text style={styles.centerValue}>
              {formatINR(selectedCat ? selectedCat.amount : totalExpenses, { compact: true })}
            </Text>
            <Text style={styles.centerPct}>
              {selectedCat ? `${selectedCat.percentage}% of total` : `${categories.length} categories`}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown Cards */}
      <View style={styles.categoryGrid}>
        {categories.map((cat, idx) => {
          const isSelected = selectedCat?.name === cat.name;
          const color = cat.color || RED_YELLOW_PALETTE[idx % RED_YELLOW_PALETTE.length];

          return (
            <TouchableOpacity
              key={cat.name}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
              ]}
              onPress={() => setSelectedCat(isSelected ? null : cat)}
              activeOpacity={0.75}
            >
              <View style={styles.catLeft}>
                <View style={[styles.catColorDot, { backgroundColor: color }]} />
                <View style={styles.catNameCol}>
                  <Text style={[styles.catName, isSelected && { color: '#FACC15' }]}>
                    {cat.name}
                  </Text>
                  <Text style={styles.catAmount}>{formatINR(cat.amount)}</Text>
                </View>
              </View>

              <View style={styles.catRight}>
                <View style={[styles.pctBadge, { borderColor: color }]}>
                  <Text style={[styles.pctBadgeText, { color }]}>{cat.percentage}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  totalPill: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  totalPillText: {
    color: '#FACC15',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  donutSvgWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCallout: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.heavy,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerValue: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
    marginVertical: 2,
  },
  centerPct: {
    fontSize: 9,
    color: '#EAB308',
    fontWeight: THEME.typography.weights.semibold,
  },
  categoryGrid: {
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D16',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  categoryCardSelected: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  catColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catNameCol: {
    flex: 1,
  },
  catName: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: '#F8FAFC',
  },
  catAmount: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  catRight: {
    alignItems: 'flex-end',
  },
  pctBadge: {
    borderWidth: 1,
    borderRadius: THEME.borderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  pctBadgeText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

