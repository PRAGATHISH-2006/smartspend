// SplashScreen: Initial launch screen with animation and session routing

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { THEME } from '../../constants/theme';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { session, loading, devQuickLogin } = useAuth();

  useEffect(() => {
    let active = true;
    if (!loading) {
      if (!session) {
        // Land directly on Home Page by auto-initializing the workspace
        devQuickLogin().catch(() => {
          if (active) {
            navigation.replace('Login');
          }
        });
      }
    }
    return () => {
      active = false;
    };
  }, [session, loading, navigation, devQuickLogin]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
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
        <Text style={styles.tagline}>Intelligent Mobile Financial Engine</Text>
        <View style={styles.mottoPill}>
          <Text style={styles.mottoText}>நாளைய வெற்றிக்கு இன்றைய நிதி மேலாண்மை</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#EAB308" />
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
    marginTop: 110,
  },
  leaderFrame: {
    position: 'relative',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#EAB308',
    padding: 3,
    backgroundColor: '#0F172A',
    marginBottom: THEME.spacing.lg,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  leaderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  emblemBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  emblemIcon: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 30,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
    marginTop: 6,
  },
  mottoPill: {
    marginTop: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  mottoText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
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
