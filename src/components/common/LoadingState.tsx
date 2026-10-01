// LoadingState: Full-screen or inline spinner with custom message

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading your financial data...',
  fullScreen = false,
  style,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size="large" color={THEME.colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xxl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  message: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
});
