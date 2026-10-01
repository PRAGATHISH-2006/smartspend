// Card: Reusable rounded card container

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outlined' | 'dark' | 'gradient';
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  onPress,
  padding = 'md',
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return THEME.spacing.sm;
      case 'lg':
        return THEME.spacing.xl;
      case 'md':
      default:
        return THEME.spacing.lg;
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: THEME.colors.surfaceSubtle,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: THEME.colors.surface,
          borderWidth: 1,
          borderColor: THEME.colors.border,
        };
      case 'dark':
        return {
          backgroundColor: THEME.colors.surfaceDark,
          borderWidth: 1,
          borderColor: THEME.colors.borderDark,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: THEME.colors.surface,
          borderWidth: 1,
          borderColor: THEME.colors.border,
          ...THEME.shadows.card,
        };
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: THEME.borderRadius.xl,
    padding: getPadding(),
    ...getVariantStyle(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
