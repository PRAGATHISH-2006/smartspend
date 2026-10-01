// LoginScreen: Supabase authentication sign in screen

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
import { ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn, devQuickLogin } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await devQuickLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo session');
    } finally {
      setDemoLoading(false);
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
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <ShieldCheck size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>SmartSpend</Text>
            <Text style={styles.welcomeText}>Welcome back! Sign in to continue</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input
              label="Email Address"
              placeholder="you@example.com"
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
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              leftIcon={<Lock size={18} color={THEME.colors.textMuted} />}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.submitBtn}
              fullWidth
            />

            {/* Quick Demo Login Helper for Easy Evaluation */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR FAST DEMO</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Quick Demo Account Sign In"
              onPress={handleDemoLogin}
              variant="outline"
              size="md"
              loading={demoLoading}
              icon={<Sparkles size={16} color={THEME.colors.primary} />}
              fullWidth
            />
          </View>

          {/* Footer to Sign Up */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign Up</Text>
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
    marginBottom: THEME.spacing.xl,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: THEME.borderRadius.xxl,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.glowGreen,
  },
  appName: {
    fontSize: THEME.typography.sizes.display,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  welcomeText: {
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: THEME.spacing.md,
    marginTop: -4,
  },
  forgotText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.primaryDark,
    fontWeight: THEME.typography.weights.semibold,
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
  submitBtn: {
    marginBottom: THEME.spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textMuted,
    marginHorizontal: 8,
    letterSpacing: 0.5,
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
  signUpLink: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
});
