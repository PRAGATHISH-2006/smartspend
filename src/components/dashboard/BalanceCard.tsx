// BalanceCard: Hero financial wallet balance card

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, Wallet } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { formatINR } from '../../utils/currency';

interface BalanceCardProps {
  currentBalance: number;
  totalMoneyAdded: number;
  totalSpent: number;
  onAddMoneyPress: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  currentBalance,
  totalMoneyAdded,
  totalSpent,
  onAddMoneyPress,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.walletIconCircle}>
            <Wallet size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.label}>Current Balance</Text>
        </View>

        <TouchableOpacity
          style={styles.addMoneyBtn}
          onPress={onAddMoneyPress}
          activeOpacity={0.8}
        >
          <PlusCircle size={16} color="#FFFFFF" />
          <Text style={styles.addMoneyText}>Add Money</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.balanceAmount}>{formatINR(currentBalance)}</Text>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconCircleAdded}>
            <ArrowUpRight size={14} color={THEME.colors.primaryLight} />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Added</Text>
            <Text style={styles.statValueAdded}>{formatINR(totalMoneyAdded, { showSign: true })}</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconCircleSpent}>
            <ArrowDownLeft size={14} color={THEME.colors.rose} />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValueSpent}>-{formatINR(totalSpent)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: THEME.colors.surfaceDark,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderDark,
    ...THEME.shadows.elevated,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconCircle: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.medium,
    letterSpacing: 0.2,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addMoneyText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
  },
  balanceAmount: {
    fontSize: THEME.typography.sizes.hero,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginVertical: THEME.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: THEME.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statIconCircleAdded: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircleSpent: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.regular,
  },
  statValueAdded: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
    marginTop: 2,
  },
  statValueSpent: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.rose,
    marginTop: 2,
  },
});
