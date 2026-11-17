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
            <ArrowUpRight size={14} color="#FACC15" />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Added</Text>
            <Text style={styles.statValueAdded}>{formatINR(totalMoneyAdded, { showSign: true })}</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconCircleSpent}>
            <ArrowDownLeft size={14} color="#EF4444" />
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
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: '#DC2626', // Vibrant Red Accent
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
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
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: THEME.typography.sizes.sm,
    color: '#CBD5E1',
    fontWeight: THEME.typography.weights.medium,
    letterSpacing: 0.2,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAB308', // Warm Gold button
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  addMoneyText: {
    color: '#090D16',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
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
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircleSpent: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: '#94A3B8',
    fontWeight: THEME.typography.weights.regular,
  },
  statValueAdded: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: '#FACC15',
    marginTop: 2,
  },
  statValueSpent: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: '#EF4444',
    marginTop: 2,
  },
});
