/**
 * TIPOGRAFIA - FISCALFLOW PREMIUM
 *
 * Fontes:
 * - Inter: UI, bodies, labels (Google Fonts)
 * - JetBrains Mono: Código, valores (Google Fonts)
 */

export const typography = {
  // Headlines - Impactantes, hierarquia clara
  headlines: {
    h1: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      className: 'text-4xl font-bold',
    },
    h2: {
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      className: 'text-3xl font-bold',
    },
    h3: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      className: 'text-2xl font-semibold',
    },
    h4: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 600,
      letterSpacing: '0em',
      className: 'text-xl font-semibold',
    },
    h5: {
      fontSize: '18px',
      lineHeight: '26px',
      fontWeight: 600,
      letterSpacing: '0em',
      className: 'text-lg font-semibold',
    },
  },

  // Body - Legibilidade máxima
  body: {
    lg: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
      letterSpacing: '0em',
      className: 'text-base',
    },
    base: {
      fontSize: '14px',
      lineHeight: '22px',
      fontWeight: 400,
      letterSpacing: '0em',
      className: 'text-sm',
    },
    sm: {
      fontSize: '13px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0em',
      className: 'text-xs',
    },
    xs: {
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 400,
      letterSpacing: '0em',
      className: 'text-xs',
    },
  },

  // Labels - Formulários, buttons, badges
  labels: {
    lg: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0em',
      className: 'text-sm font-medium',
    },
    base: {
      fontSize: '13px',
      lineHeight: '19px',
      fontWeight: 500,
      letterSpacing: '0em',
      className: 'text-xs font-medium',
    },
    sm: {
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 500,
      letterSpacing: '0em',
      className: 'text-xs font-medium',
    },
  },

  // Código - Monospace elegante
  code: {
    base: {
      fontSize: '13px',
      lineHeight: '20px',
      fontWeight: 400,
      fontFamily: "'JetBrains Mono', monospace",
      className: 'font-mono text-xs',
    },
    sm: {
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 400,
      fontFamily: "'JetBrains Mono', monospace",
      className: 'font-mono text-xs',
    },
  },

  // Caption - Pequenos detalhes
  caption: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.02em',
    className: 'text-xs',
  },

  // Overline - Rótulos pequenos
  overline: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    className: 'text-xs font-semibold uppercase',
  },
} as const;

// Font weights
export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

// Font families
export const fontFamilies = {
  primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  mono: '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
} as const;

export type TypographyKey = keyof typeof typography;
export type FontWeightKey = keyof typeof fontWeights;
