/**
 * DESIGN SYSTEM - TOKENS EXPORT
 *
 * Central hub para todos os design tokens
 * Use: import { colors, spacing, shadows } from '@/design-system/tokens'
 */

export * from './colors';
export * from './typography';
export * from './effects';

// Convenience exports
export const designTokens = {
  colors: require('./colors').colors,
  colorAliases: require('./colors').colorAliases,
  typography: require('./typography').typography,
  fontWeights: require('./typography').fontWeights,
  fontFamilies: require('./typography').fontFamilies,
  spacing: require('./effects').spacing,
  shadows: require('./effects').shadows,
  borders: require('./effects').borders,
  transitions: require('./effects').transitions,
  easing: require('./effects').easing,
  zIndex: require('./effects').zIndex,
} as const;
