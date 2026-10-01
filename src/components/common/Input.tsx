// Input: Form input field with label, error message, and prefix/suffix support

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { THEME } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefix,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  helperText,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          props.editable === false ? styles.inputDisabled : null,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={THEME.colors.textMuted}
          selectionColor={THEME.colors.primary}
          {...props}
        />
        {rightIcon && <View style={styles.iconRightContainer}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: THEME.colors.danger,
    backgroundColor: THEME.colors.roseLight,
  },
  inputDisabled: {
    backgroundColor: THEME.colors.surfaceSubtle,
    opacity: 0.7,
  },
  prefix: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: THEME.typography.sizes.md,
    color: THEME.colors.textPrimary,
    paddingVertical: 10,
  },
  iconContainer: {
    marginRight: 8,
  },
  iconRightContainer: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.danger,
    marginTop: 4,
    fontWeight: THEME.typography.weights.medium,
  },
  helperText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
