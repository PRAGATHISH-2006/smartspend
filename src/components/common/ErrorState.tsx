// ErrorState: Error notice with retry callback

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading your data. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <AlertTriangle size={32} color={THEME.colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xxl,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.roseLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  message: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: THEME.spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
});
