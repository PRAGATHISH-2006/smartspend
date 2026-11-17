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
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck, Mail, Lock, Sparkles, ArrowLeft } from 'lucide-react-native';
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
      } else {
        navigation.navigate('Main' as any);
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
      navigation.navigate('Main' as any);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo session');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Back to Home */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Landing' as any);
            }
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={16} color="#EAB308" />
          <Text style={styles.backHomeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

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
            <View style={styles.leaderFrame}>
              <Image
                source={require('../../../assets/brand/leader_square.png')}
                style={styles.leaderImage}
                resizeMode="cover"
              />
              <View style={styles.emblemBadge}>
                <Image
                  source={require('../../../assets/brand/emblem.png')}
                  style={styles.emblemIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.appName}>வெற்றி நிதி மேலாண்மை</Text>
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
  topBar: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    alignSelf: 'flex-start',
  },
  backHomeBtnText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
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
  leaderFrame: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#EAB308',
    padding: 2,
    backgroundColor: '#0F172A',
    marginBottom: THEME.spacing.md,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  leaderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  emblemBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  emblemIcon: {
    width: '100%',
    height: '100%',
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
