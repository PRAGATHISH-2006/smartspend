// Badge: Status pill badge

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { THEME } from '../../constants/theme';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'indigo';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: THEME.colors.primaryMuted,
          text: THEME.colors.primaryDark,
          border: THEME.colors.primaryBorder,
        };
      case 'warning':
        return {
          bg: THEME.colors.amberLight,
          text: '#B45309',
          border: THEME.colors.amberBorder,
        };
      case 'danger':
        return {
          bg: THEME.colors.roseLight,
          text: THEME.colors.roseDark,
          border: THEME.colors.roseBorder,
        };
      case 'info':
        return {
          bg: '#EFF6FF',
          text: '#1D4ED8',
          border: '#BFDBFE',
        };
      case 'indigo':
        return {
          bg: THEME.colors.indigoLight,
          text: THEME.colors.indigo,
          border: THEME.colors.indigoBorder,
        };
      case 'neutral':
      default:
        return {
          bg: THEME.colors.surfaceSubtle,
          text: THEME.colors.textSecondary,
          border: THEME.colors.border,
        };
    }
  };

  const colors = getBadgeColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? 10 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: THEME.typography.weights.semibold,
  },
});
