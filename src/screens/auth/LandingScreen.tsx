// LandingScreen: Initial entry showcase page containing ONLY the Application Name, Person's Photo, and Top-Right Login option

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LogIn, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Floating & glowing pulse animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // 2. Continuous Floating Loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    // 3. Ambient Breathing Glow Loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScaleAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseScaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    floatLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Top Header with Login Option in the Top Right Corner */}
      <View style={styles.topHeader}>
        <View style={styles.topLeftBrand}>
          <Image
            source={require('../../../assets/brand/emblem.png')}
            style={styles.headerEmblem}
            resizeMode="contain"
          />
        </View>

        {/* Top Right Corner Login Option */}
        <TouchableOpacity
          style={styles.topRightLoginBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
          accessibilityLabel="Login to SmartSpend"
        >
          <View style={styles.loginIconWrap}>
            <LogIn size={15} color="#090D16" />
          </View>
          <Text style={styles.topRightLoginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Main Entry Showcase: ONLY App Name & Person Photo with Attractive Visual Effects */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {/* Ambient Glowing Halo Background */}
        <Animated.View
          style={[
            styles.ambientGlow,
            { transform: [{ scale: pulseScaleAnim }] },
          ]}
        />

        {/* Designated Person's Photo (Thalapathy Vijay) */}
        <View style={styles.photoWrapper}>
          <View style={styles.photoRingOuter}>
            <View style={styles.photoRingInner}>
              <Image
                source={require('../../../assets/brand/leader.png')}
                style={styles.leaderImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Victory Shield Emblem Badge at Corner */}
          <View style={styles.emblemBadgeCorner}>
            <Image
              source={require('../../../assets/brand/emblem.png')}
              style={styles.emblemBadgeIcon}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Motivation Pill */}
        <View style={styles.inspirationPill}>
          <Sparkles size={13} color="#EAB308" />
          <Text style={styles.inspirationPillText}>நமது உத்வேகம் • தளபதி விஜய்</Text>
        </View>

        {/* Prominent Application Name */}
        <View style={styles.appNameContainer}>
          <Text style={styles.appNameTitle}>வெற்றி நிதி மேலாண்மை</Text>
          <Text style={styles.appTagline}>FINANCE MANAGEMENT FOR ALL CITIZENS</Text>
        </View>

        {/* Tamil Motto */}
        <View style={styles.mottoContainer}>
          <View style={styles.goldBar} />
          <Text style={styles.mottoText}>
            "நாளைய வெற்றிக்கு இன்றைய நிதி மேலாண்மை"
          </Text>
          <View style={styles.goldBar} />
        </View>

        {/* Direct Action Prompt */}
        <TouchableOpacity
          style={styles.enterLoginCta}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.enterLoginCtaText}>Sign In to Dashboard</Text>
          <ChevronRight size={16} color="#090D16" />
        </TouchableOpacity>
      </Animated.View>

      {/* 3. Subtle Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          வெற்றி நிதி மேலாண்மை • Intelligent Financial Platform
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070A12', // Deep sleek obsidian slate
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  topLeftBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 36,
    height: 36,
  },
  topRightLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAB308', // Warm Gold
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1.5,
    borderColor: '#FACC15',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  loginIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightLoginBtnText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: 0.4,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 50,
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRingOuter: {
    width: 176,
    height: 216,
    borderRadius: 32,
    padding: 3,
    backgroundColor: '#DC2626', // Vibrant Red Outer Ring
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  photoRingInner: {
    flex: 1,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: '#EAB308', // Warm Gold Inner Ring
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  leaderImage: {
    width: '100%',
    height: '100%',
  },
  emblemBadgeCorner: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#070A12',
    borderWidth: 2,
    borderColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  emblemBadgeIcon: {
    width: '100%',
    height: '100%',
  },
  inspirationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    marginBottom: 16,
  },
  inspirationPillText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    letterSpacing: 0.3,
  },
  appNameContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appNameTitle: {
    fontSize: 32,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(220, 38, 38, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.heavy,
    color: '#EAB308', // Warm Gold
    letterSpacing: 2,
    marginTop: 6,
    textAlign: 'center',
  },
  mottoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 26,
    paddingHorizontal: 16,
  },
  goldBar: {
    width: 24,
    height: 2,
    backgroundColor: '#DC2626',
    borderRadius: 1,
  },
  mottoText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: THEME.typography.weights.medium,
  },
  enterLoginCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAB308',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: THEME.borderRadius.xl,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  enterLoginCtaText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: 0.3,
  },
  footer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
  },
});
