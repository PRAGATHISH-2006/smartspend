// ResetPasswordScreen: Screen for entering and confirming new password

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Lock, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpdate = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await updatePassword(newPassword);
      if (res.error) {
        setError(res.error.message || 'Failed to update password');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Lock size={32} color={THEME.colors.primaryDark} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your new secure password below</Text>
          </View>

          <View style={styles.formCard}>
            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Password Updated! 🎉</Text>
                <Text style={styles.successDesc}>Your password has been successfully changed.</Text>
                <Button
                  title="Go to Login"
                  onPress={() => navigation.navigate('Login')}
                  variant="primary"
                  size="md"
                  fullWidth
                />
              </View>
            ) : (
              <>
                <Input
                  label="New Password"
                  placeholder="At least 6 characters"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={(t) => {
                    setNewPassword(t);
                    setError(null);
                  }}
                  leftIcon={<Lock size={18} color={THEME.colors.textMuted} />}
                />

                <Input
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    setError(null);
                  }}
                  leftIcon={<Check size={18} color={THEME.colors.textMuted} />}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button
                  title="Update Password"
                  onPress={handleUpdate}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  fullWidth
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.elevated,
  },
  errorText: {
    backgroundColor: THEME.colors.roseLight,
    color: THEME.colors.danger,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
  },
  successTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryDark,
    marginBottom: 6,
  },
  successDesc: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
});
