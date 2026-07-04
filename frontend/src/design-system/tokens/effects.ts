/**
 * EFEITOS VISUAIS - FISCALFLOW PREMIUM
 *
 * Sombras, bordas, espaçamentos, animações
 * Filosofia: Elegância, subtileza, profundidade
 */

// Espaçamento - Base 4px
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
} as const;

// Sombras - Profundidade elegante
export const shadows = {
  // Sutil (hover, cards)
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

  // Base (cards elevados, modals)
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

  // Destaque (floating elements, dropdowns)
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Premium (full-screen modals, popovers)
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Inset (depressão, focus)
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',
};

// Borders - Linhas limpas
export const borders = {
  radius: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },

  width: {
    0: '0px',
    px: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
};

// Transições - Animações suaves
export const transitions = {
  fast: {
    duration: '150ms',
    timing: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  base: {
    duration: '200ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  normal: {
    duration: '300ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slow: {
    duration: '500ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Easing functions
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  backdrop: 1300,
  offcanvas: 1400,
  modal: 1500,
  popover: 1600,
  tooltip: 1700,
} as const;

export type SpacingKey = keyof typeof spacing;
export type ShadowKey = keyof typeof shadows;
export type RadiusKey = keyof typeof borders.radius;
export type TransitionKey = keyof typeof transitions;
