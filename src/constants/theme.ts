// SmartSpend Theme & Design System
// Striking modern aesthetic with Vibrant Red accents and Warm Golden Yellow highlights on a sleek dark surface.

export const THEME = {
  colors: {
    // Primary Brand: Vibrant Red (#DC2626)
    primary: '#DC2626',
    primaryDark: '#B91C1C',
    primaryLight: '#EF4444',
    primaryMuted: 'rgba(220, 38, 38, 0.12)',
    primaryBorder: 'rgba(220, 38, 38, 0.35)',

    // Warm Golden Yellow Brand Accent (#EAB308 / #FACC15)
    accentYellow: '#EAB308',
    accentYellowLight: '#FEF08A',
    accentYellowDark: '#CA8A04',
    accentYellowMuted: 'rgba(234, 179, 8, 0.12)',
    accentYellowBorder: 'rgba(234, 179, 8, 0.35)',

    brandRed: '#DC2626',
    brandYellow: '#EAB308',
    brandDark: '#090D16',
    brandCardDark: '#111726',

    // Secondary & Status
    indigo: '#6366F1',
    indigoLight: '#EEF2FF',
    indigoBorder: '#C7D2FE',

    amber: '#F59E0B',
    amberLight: '#FFFBEB',
    amberBorder: '#FDE68A',

    rose: '#DC2626',
    roseDark: '#991B1B',
    roseLight: '#FEF2F2',
    roseBorder: '#FECACA',

    cyan: '#06B6D4',
    purple: '#8B5CF6',

    // Neutrals / Surfaces (Sleek dark theme that makes Red & Yellow pop brilliantly)
    background: '#090D16',
    backgroundLight: '#F8FAFC',
    surface: '#111726',
    surfaceElevated: '#182136',
    surfaceSubtle: '#1C2740',
    surfaceDark: '#060910',
    surfaceDarkCard: '#111726',

    // Text colors
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textInverse: '#090D16',
    textPrimaryDark: '#F8FAFC',

    // Status colors
    success: '#10B981',
    warning: '#EAB308',
    danger: '#EF4444',
    info: '#3B82F6',

    // Borders & Dividers
    border: '#1E293B',
    borderLight: '#334155',
    borderDark: '#0A0F1D',
    borderGold: '#EAB308',
    borderRed: '#DC2626',
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 3,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 6,
    },
    glowGreen: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    glowAmber: {
      shadowColor: '#EAB308',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    glowRed: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 7,
    },
    glowYellow: {
      shadowColor: '#EAB308',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 7,
    },
  },
};
