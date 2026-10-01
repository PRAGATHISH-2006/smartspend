// SplashScreen: Initial launch screen with animation and session routing

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        navigation.replace('Login');
      }
    }
  }, [session, loading, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoCircle}>
          <ShieldCheck size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>SmartSpend</Text>
        <Text style={styles.tagline}>Intelligent Mobile Financial Engine</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={THEME.colors.primary} />
        <Text style={styles.footerText}>Securing your financial workspace...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.huge,
    paddingHorizontal: THEME.spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 140,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: THEME.borderRadius.xxl,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.glowGreen,
  },
  appName: {
    fontSize: 32,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
  },
});
