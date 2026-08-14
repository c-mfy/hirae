// Core color palette
const palette = {
  'dark-sage': '#717D66',
  sage: '#E2E8DD',
  'pale-sage': '#F3F5F0',
  'muted-blue': '#7B8CC4',
  terracotta: '#C9603A',
  white: '#FFFFFF',
};

// Semantic color assignments
export const Colors = {
  background: palette['pale-sage'],
  surface: palette.white,
  surfaceTranslucent: 'rgba(255, 255, 255, 0.8)',
  surfaceHalf: 'rgba(255, 255, 255, 0.5)',
  primary: palette['dark-sage'],
  secondary: palette.sage,
  text: palette['dark-sage'],
  border: palette.sage,
  landmark: palette['muted-blue'],
  line: palette['dark-sage'],
  accent: palette.terracotta,
};

export type ThemeColor = keyof typeof Colors;

export const Spacing = {
  one: 2,
  two: 4,
  xs: 4,
  half: 6,
  three: 8,
  sm: 8,
  four: 12,
  md: 12,
  five: 16,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Fonts = {
  // Outfit — UI, numbers, body text
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  // Gaegu — handwritten accents (app name, greeting, section labels)
  handRegular: 'Gaegu_400Regular',
  handBold: 'Gaegu_700Bold',
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  card: 20,
  pill: 999,
};

export const ScreenPadding = 30;

export const MaxContentWidth = 600;
export const BottomTabInset = 60;