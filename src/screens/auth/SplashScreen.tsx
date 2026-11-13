// SplashScreen: Initial launch screen with animation and session routing

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
        <Image
          source={require('../../../assets/brand/app_icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.appName}>வெற்றி நிதி மேலாண்மை</Text>
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
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: THEME.spacing.lg,
    backgroundColor: '#FFFFFF',
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
