// EmptyState: Placeholder state with icon, message and optional action

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.xxxl,
    paddingHorizontal: THEME.spacing.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: THEME.spacing.lg,
  },
  actionButton: {
    marginTop: THEME.spacing.xs,
  },
});
