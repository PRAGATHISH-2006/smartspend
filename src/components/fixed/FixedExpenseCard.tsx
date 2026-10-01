// FixedExpenseCard: Card representing a recurring rule with Pause, Edit and Delete controls

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Edit2, Trash2, Repeat, Calendar } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { FixedExpenseRow } from '../../types/database';
import { formatINR } from '../../utils/currency';
import { Badge } from '../common/Badge';
import { getCategoryMeta } from '../../constants/categories';

interface FixedExpenseCardProps {
  rule: FixedExpenseRow;
  onEdit: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
}

export const FixedExpenseCard: React.FC<FixedExpenseCardProps> = ({
  rule,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const meta = getCategoryMeta(rule.category_name);

  return (
    <View style={[styles.card, !rule.active && styles.cardInactive]}>
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: rule.active ? meta.bgColor || THEME.colors.primaryMuted : THEME.colors.surfaceSubtle },
            ]}
          >
            <Repeat
              size={18}
              color={rule.active ? meta.color || THEME.colors.primary : THEME.colors.textMuted}
            />
          </View>
          <View>
            <Text style={[styles.ruleName, !rule.active && styles.textInactive]}>{rule.name}</Text>
            <Text style={styles.categoryName}>
              {rule.category_name} • Starts {rule.start_date}
            </Text>
          </View>
        </View>

        <View style={styles.rightAmount}>
          <Text style={[styles.amount, !rule.active && styles.textInactive]}>
            {formatINR(rule.amount)}
          </Text>
          <Text style={styles.frequencyLabel}>per {rule.frequency === 'daily' ? 'day' : rule.frequency.replace('ly', '')}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.badgeGroup}>
          <Badge
            label={rule.frequency.toUpperCase()}
            variant={rule.frequency === 'daily' ? 'success' : rule.frequency === 'monthly' ? 'indigo' : 'info'}
            size="sm"
          />
          <Badge
            label={rule.active ? 'Active' : 'Paused'}
            variant={rule.active ? 'success' : 'neutral'}
            size="sm"
          />
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onEdit}
            activeOpacity={0.7}
            accessibilityLabel="Edit rule"
          >
            <Edit2 size={16} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={onDelete}
            activeOpacity={0.7}
            accessibilityLabel="Delete rule"
          >
            <Trash2 size={16} color={THEME.colors.danger} />
          </TouchableOpacity>

          <Switch
            value={rule.active}
            onValueChange={onToggleActive}
            trackColor={{ false: THEME.colors.border, true: THEME.colors.primaryBorder }}
            thumbColor={rule.active ? THEME.colors.primary : THEME.colors.textMuted}
            style={styles.switch}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  cardInactive: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderColor: THEME.colors.borderLight,
    opacity: 0.8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleName: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  categoryName: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  rightAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.primaryDark,
  },
  frequencyLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.medium,
  },
  textInactive: {
    color: THEME.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.borderLight,
    marginVertical: THEME.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: THEME.colors.roseLight,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});
