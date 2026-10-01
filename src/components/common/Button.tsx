// Button: Reusable touch-friendly button with variants and loading state

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { THEME } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'subtle' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: THEME.borderRadius.lg,
      opacity: disabled ? 0.5 : 1,
    };

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = 8;
        base.paddingHorizontal = 12;
        base.minHeight = 36;
        break;
      case 'lg':
        base.paddingVertical = 16;
        base.paddingHorizontal = 24;
        base.minHeight = 54;
        break;
      case 'md':
      default:
        base.paddingVertical = 12;
        base.paddingHorizontal = 18;
        base.minHeight = 46;
        break;
    }

    // Variant
    switch (variant) {
      case 'primary':
        base.backgroundColor = THEME.colors.primary;
        base.shadowColor = THEME.colors.primary;
        base.shadowOffset = { width: 0, height: 4 };
        base.shadowOpacity = 0.2;
        base.shadowRadius = 8;
        base.elevation = 3;
        break;
      case 'secondary':
        base.backgroundColor = THEME.colors.indigo;
        break;
      case 'danger':
        base.backgroundColor = THEME.colors.danger;
        break;
      case 'warning':
        base.backgroundColor = THEME.colors.warning;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = THEME.colors.border;
        break;
      case 'subtle':
        base.backgroundColor = THEME.colors.surfaceSubtle;
        break;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: THEME.typography.weights.semibold,
      textAlign: 'center',
    };

    switch (size) {
      case 'sm':
        base.fontSize = THEME.typography.sizes.sm;
        break;
      case 'lg':
        base.fontSize = THEME.typography.sizes.md;
        break;
      case 'md':
      default:
        base.fontSize = THEME.typography.sizes.md;
        break;
    }

    switch (variant) {
      case 'outline':
        base.color = THEME.colors.textPrimary;
        break;
      case 'subtle':
        base.color = THEME.colors.textPrimary;
        break;
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'warning':
      default:
        base.color = THEME.colors.textInverse;
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'subtle' ? THEME.colors.primary : '#FFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
