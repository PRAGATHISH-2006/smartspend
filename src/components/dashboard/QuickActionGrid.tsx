// QuickActionGrid: Fast touch-friendly buttons for instant operations

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Wallet, Repeat, BarChart3 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface QuickActionGridProps {
  onAddExpensePress: () => void;
  onAddMoneyPress: () => void;
  onAddFixedPress: () => void;
  onReportsPress: () => void;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onAddExpensePress,
  onAddMoneyPress,
  onAddFixedPress,
  onReportsPress,
}) => {
  const actions = [
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: <Plus size={20} color={THEME.colors.primaryDark} />,
      bg: THEME.colors.primaryMuted,
      border: THEME.colors.primaryBorder,
      onPress: onAddExpensePress,
    },
    {
      id: 'add-money',
      label: 'Top-up Wallet',
      icon: <Wallet size={20} color={THEME.colors.indigo} />,
      bg: THEME.colors.indigoLight,
      border: THEME.colors.indigoBorder,
      onPress: onAddMoneyPress,
    },
    {
      id: 'add-fixed',
      label: 'New Fixed',
      icon: <Repeat size={20} color="#B45309" />,
      bg: THEME.colors.amberLight,
      border: THEME.colors.amberBorder,
      onPress: onAddFixedPress,
    },
    {
      id: 'reports',
      label: 'Analytics',
      icon: <BarChart3 size={20} color="#0E7490" />,
      bg: '#ECFEFF',
      border: '#A5F3FC',
      onPress: onReportsPress,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.actionBtn, { backgroundColor: action.bg, borderColor: action.border }]}
          onPress={action.onPress}
          activeOpacity={0.75}
        >
          <View style={styles.iconWrapper}>{action.icon}</View>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    ...THEME.shadows.subtle,
  },
  iconWrapper: {
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
  },
});
