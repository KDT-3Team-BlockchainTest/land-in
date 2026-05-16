export const colors = {
  primary: '#fe6b70',
  primarySoft: 'rgba(254, 107, 112, 0.08)',
  primaryMid: 'rgba(254, 107, 112, 0.15)',
  success: '#22c55e',
  successSoft: 'rgba(34, 197, 94, 0.08)',
  warning: '#f59e0b',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  bg: '#f7f5f3',
  surface: '#ffffff',
  gray900: '#111827',
  gray600: '#4b5563',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
  gray100: '#f3f4f6',
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700', color: colors.gray900 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.gray900 },
  h3: { fontSize: 17, fontWeight: '600', color: colors.gray900 },
  body: { fontSize: 15, fontWeight: '400', color: colors.gray600 },
  caption: { fontSize: 13, fontWeight: '400', color: colors.gray500 },
  label: { fontSize: 12, fontWeight: '600', color: colors.gray500 },
};
