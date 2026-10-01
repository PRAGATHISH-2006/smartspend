// SmartSpend Theme & Design System
// Mobile-first, modern financial aesthetic with rich emerald accents and dark slate tones.

export const THEME = {
  colors: {
    // Primary brand: Emerald & Forest
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#10B981',
    primaryMuted: '#ECFDF5',
    primaryBorder: '#A7F3D0',

    // Secondary & Accents
    indigo: '#6366F1',
    indigoLight: '#EEF2FF',
    indigoBorder: '#C7D2FE',

    amber: '#F59E0B',
    amberLight: '#FFFBEB',
    amberBorder: '#FDE68A',

    rose: '#EF4444',
    roseDark: '#DC2626',
    roseLight: '#FEF2F2',
    roseBorder: '#FECACA',

    cyan: '#06B6D4',
    purple: '#8B5CF6',

    // Neutrals / Surfaces
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    surfaceDark: '#0F172A',
    surfaceDarkCard: '#1E293B',

    // Text colors
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    textPrimaryDark: '#F8FAFC',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',

    // Borders & Dividers
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderDark: '#334155',
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      heavy: 'System',
    },
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      display: 32,
      hero: 40,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
    },
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  shadows: {
    subtle: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },
    elevated: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    glowGreen: {
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    glowAmber: {
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};
