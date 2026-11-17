// LeaderInspirationBanner: Elegant motivational hero banner featuring Thalapathy Vijay with floating & glowing animations

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Platform } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export const LeaderInspirationBanner: React.FC = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 2200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScaleAnim, {
          toValue: 1.05,
          duration: 1800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseScaleAnim, {
          toValue: 1,
          duration: 1800,
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
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Glowing Yellow & Red Accent Halo */}
        <Animated.View
          style={[
            styles.glowHalo,
            { transform: [{ scale: pulseScaleAnim }] },
          ]}
        />

        {/* Left Content */}
        <View style={styles.contentCol}>
          <View style={styles.badgeRow}>
            <Sparkles size={13} color="#EAB308" />
            <Text style={styles.badgeText}>வெற்றி உத்வேகம்</Text>
          </View>

          <Text style={styles.quoteText}>
            "திட்டமிட்ட சேமிப்பும், சரியான நிதி ஒழுக்கமுமே வாழ்வின் உண்மையான வெற்றி!"
          </Text>

          <View style={styles.authorRow}>
            <View style={styles.goldLine} />
            <Text style={styles.authorName}>தளபதி விஜய்</Text>
          </View>
        </View>

        {/* Right Portrait with Floating Animation */}
        <Animated.View
          style={[
            styles.photoContainer,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <View style={styles.photoFrame}>
            <Image
              source={require('../../../assets/brand/leader.png')}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
          <View style={styles.emblemBadge}>
            <Image
              source={require('../../../assets/brand/emblem.png')}
              style={styles.emblemIcon}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#EAB308', // Gold border accent
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(220, 38, 38, 0.12)', // Subtle Red & Gold glow
  },
  contentCol: {
    flex: 1,
    paddingRight: THEME.spacing.md,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  badgeText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    letterSpacing: 0.3,
  },
  quoteText: {
    color: '#F8FAFC',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: THEME.typography.weights.medium,
    fontStyle: 'italic',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  goldLine: {
    width: 20,
    height: 2,
    backgroundColor: '#EAB308',
    borderRadius: 1,
  },
  authorName: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    letterSpacing: 0.5,
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFrame: {
    width: 76,
    height: 98,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#EAB308',
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emblemBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
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
});

