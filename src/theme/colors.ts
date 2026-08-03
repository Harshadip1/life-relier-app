/**
 * Centralized theme palette — Material Design 3 compliant
 * Use these via useTheme() — never hardcode colors in screens.
 */

export const lightColors = {
  // Brand
  primary:        '#0D9488',
  primaryLight:   '#CCFBF1',
  primaryDark:    '#0F766E',
  // Backgrounds
  background:     '#F8FAFC',
  surface:        '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  // Cards / elevation
  card:           '#FFFFFF',
  cardBorder:     '#E2E8F0',
  // Text
  textPrimary:    '#0F172A',
  textSecondary:  '#64748B',
  textMuted:      '#94A3B8',
  textInverse:    '#FFFFFF',
  // Inputs
  inputBg:        '#F8FAFC',
  inputBorder:    '#E2E8F0',
  placeholder:    '#94A3B8',
  // Status
  danger:         '#EF4444',
  dangerBg:       '#FEF2F2',
  success:        '#10B981',
  successBg:      '#F0FDF4',
  warning:        '#F59E0B',
  warningBg:      '#FFFBEB',
  info:           '#3B82F6',
  infoBg:         '#EFF6FF',
  // Navigation / bars
  tabBar:         '#FFFFFF',
  tabBarBorder:   '#F1F5F9',
  tabActive:      '#0D9488',
  tabInactive:    '#94A3B8',
  header:         '#FFFFFF',
  headerText:     '#0F172A',
  statusBar:      'dark' as 'dark' | 'light',
  // Misc
  divider:        '#F1F5F9',
  shadow:         '#000000',
  overlay:        'rgba(0,0,0,0.45)',
  breadcrumb:     '#E8F5F4',
  breadcrumbText: '#64748B',
  scanFab:        '#0D9488',
};

export const darkColors: typeof lightColors = {
  // Brand — same primary works on dark
  primary:        '#14B8A6',
  primaryLight:   '#134E4A',
  primaryDark:    '#0F766E',
  // Backgrounds — Material 3 dark surfaces
  background:     '#121212',
  surface:        '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  // Cards / elevation
  card:           '#1E1E1E',
  cardBorder:     '#2E2E2E',
  // Text
  textPrimary:    '#F1F5F9',
  textSecondary:  '#94A3B8',
  textMuted:      '#64748B',
  textInverse:    '#0F172A',
  // Inputs
  inputBg:        '#2A2A2A',
  inputBorder:    '#3E3E3E',
  placeholder:    '#64748B',
  // Status
  danger:         '#F87171',
  dangerBg:       '#3B1515',
  success:        '#34D399',
  successBg:      '#0F2E1E',
  warning:        '#FBBF24',
  warningBg:      '#2E1F00',
  info:           '#60A5FA',
  infoBg:         '#172554',
  // Navigation / bars
  tabBar:         '#1E1E1E',
  tabBarBorder:   '#2A2A2A',
  tabActive:      '#14B8A6',
  tabInactive:    '#64748B',
  header:         '#1E1E1E',
  headerText:     '#F1F5F9',
  statusBar:      'light' as 'dark' | 'light',
  // Misc
  divider:        '#2A2A2A',
  shadow:         '#000000',
  overlay:        'rgba(0,0,0,0.65)',
  breadcrumb:     '#1A2E2A',
  breadcrumbText: '#94A3B8',
  scanFab:        '#14B8A6',
};

export type AppColors = typeof lightColors;
