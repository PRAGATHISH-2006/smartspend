// SignUpScreen: User registration screen with name, email, password and confirmation

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
import { ShieldCheck, User as UserIcon, Mail, Lock, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await signUp(email, password, name);
      if (res.error) {
        setError(res.error.message || 'Registration failed');
      } else {
        setSuccessMessage('Account created successfully! Signing in...');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <ShieldCheck size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.welcomeText}>Start tracking smart finances with SmartSpend</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input
              label="Full Name"
              placeholder="Alex Johnson"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              leftIcon={<UserIcon size={18} color={THEME.colors.textMuted} />}
            />

            <Input
              label="Email Address"
              placeholder="alex@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              leftIcon={<Mail size={18} color={THEME.colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="At least 6 characters"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              leftIcon={<Lock size={18} color={THEME.colors.textMuted} />}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setError(null);
              }}
              leftIcon={<Check size={18} color={THEME.colors.textMuted} />}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

            <Button
              title="Create Account"
              onPress={handleSignUp}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.submitBtn}
              fullWidth
            />
          </View>

          {/* Footer Link to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
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
    paddingVertical: THEME.spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: THEME.borderRadius.xxl,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.glowGreen,
  },
  appName: {
    fontSize: THEME.typography.sizes.xxl,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
  submitBtn: {
    marginTop: THEME.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: THEME.spacing.xl,
    gap: 6,
  },
  footerText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
  },
  loginLink: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
});
