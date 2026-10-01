// PWA Install Banner Component for Mobile & Web
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Download, X, Smartphone, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { promptPWAInstall, subscribeToInstallPrompt } from '../../utils/pwaHelper';

export const PWAInstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS Safari
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = window.navigator.userAgent;
      const isIphone = /iPhone|iPad|iPod/i.test(ua);
      const isStandalone =
        (window.navigator as any).standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;

      if (isIphone && !isStandalone) {
        setIsIOS(true);
      }
    }

    const unsubscribe = subscribeToInstallPrompt((installable) => {
      setCanInstall(installable);
    });

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(!showIOSGuide);
      return;
    }

    const result = await promptPWAInstall();
    if (result.outcome === 'accepted') {
      setDismissed(true);
    }
  };

  // Only show if installable on Android/Desktop or on iOS browser
  if (dismissed || (!canInstall && !isIOS)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.bannerRow}>
        <View style={styles.iconCircle}>
          <Smartphone size={20} color="#ffffff" />
        </View>

        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Install SmartSpend App</Text>
            <View style={styles.badge}>
              <Sparkles size={10} color="#047857" />
              <Text style={styles.badgeText}>PWA</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {isIOS
              ? 'Tap Share ➔ "Add to Home Screen" to install'
              : 'Add to your Home Screen for full app experience'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.installBtn}
          onPress={handleInstallClick}
          activeOpacity={0.8}
        >
          <Download size={14} color="#ffffff" />
          <Text style={styles.installBtnText}>{isIOS ? 'How to Add' : 'Install'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {showIOSGuide && (
        <View style={styles.iosGuideBox}>
          <Text style={styles.iosStep}>1. Tap the <Text style={{ fontWeight: '700' }}>Share</Text> icon ⎋ at bottom of Safari.</Text>
          <Text style={styles.iosStep}>2. Scroll down and tap <Text style={{ fontWeight: '700' }}>"Add to Home Screen"</Text> ⊞.</Text>
          <Text style={styles.iosStep}>3. Tap <Text style={{ fontWeight: '700' }}>Add</Text> at the top right to install!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: THEME.borderRadius.xl,
    padding: 12,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.4)',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  installBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    padding: 4,
  },
  iosGuideBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  iosStep: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
});
