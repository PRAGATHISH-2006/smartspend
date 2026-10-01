// ForgotPasswordScreen: Password recovery request screen

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
import { KeyRound, Mail, ArrowLeft } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await resetPasswordForEmail(email);
      if (res.error) {
        setError(res.error.message || 'Failed to send reset link');
      } else {
        setSuccessMessage('Password reset instructions sent to your email.');
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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={THEME.colors.textPrimary} />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <KeyRound size={32} color={THEME.colors.primaryDark} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter the email address associated with your account and we will send you a reset link.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              leftIcon={<Mail size={18} color={THEME.colors.textMuted} />}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

            <Button
              title="Send Reset Instructions"
              onPress={handleReset}
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
            />
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
    paddingVertical: THEME.spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: THEME.spacing.xl,
  },
  backText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
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
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: THEME.spacing.md,
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
  successText: {
    backgroundColor: THEME.colors.primaryMuted,
    color: THEME.colors.primaryDark,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
});
