export const colors = {
  primary: '#6366f1',
  primarySoft: 'rgba(99,102,241,0.08)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.08)',
  success: '#22c55e',
  warning: '#f59e0b',
  bg: '#f8fafc',
  surface: '#ffffff',
  gray900: '#0f172a',
  gray700: '#334155',
  gray600: '#475569',
  gray500: '#64748b',
  gray400: '#94a3b8',
  gray300: '#cbd5e1',
  gray200: '#e2e8f0',
  gray100: '#f1f5f9',
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 22 };

export const shadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
};

export const typography = {
  h1: { fontSize: 22, fontWeight: '700', color: colors.gray900 },
  h2: { fontSize: 18, fontWeight: '700', color: colors.gray900 },
  h3: { fontSize: 15, fontWeight: '600', color: colors.gray900 },
  body: { fontSize: 14, color: colors.gray700 },
  caption: { fontSize: 12, color: colors.gray500 },
  label: { fontSize: 12, fontWeight: '600', color: colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
};
