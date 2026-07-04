/**
 * PALETA DE CORES - FISCALFLOW PREMIUM
 *
 * Filosofia: Azul Marinho (confiança) + Branco (limpeza) + Dourado (destaque)
 * Dark mode completo, accessible, WCAG AA
 */

export const colors = {
  // Primária: Azul Marinho (Confiança, corporativo)
  primary: {
    50: '#F0F4F9',
    100: '#D4E3F7',
    200: '#A8C7EF',
    300: '#7CAAE7',
    400: '#508EDF',
    500: '#2472D7',  // Principal
    600: '#1D5AB8',
    700: '#164299',
    800: '#0F2A7A',
    900: '#0B1F3A',   // Azul Marinho
  },

  // Secundária: Branco (Limpeza)
  secondary: {
    50: '#FAFBFC',
    100: '#F4F7FB',
    200: '#E8EEF7',
    300: '#DCE5F3',
    400: '#D0DCEF',
    500: '#FFFFFF',   // Puro
    600: '#F9FAFB',
    700: '#F3F4F6',
    800: '#E5E7EB',
    900: '#D1D5DB',
  },

  // Destaque: Dourado (Premium, attention)
  accent: {
    50: '#FFFBF0',
    100: '#FFF3D6',
    200: '#FFE7AD',
    300: '#FFDB84',
    400: '#FFCF5B',
    500: '#C9A227',  // Dourado Principal
    600: '#A68620',
    700: '#836A1A',
    800: '#6B5515',
    900: '#4A3A0F',
  },

  // Sucesso (Verde elegante)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Verde
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#145231',
  },

  // Aviso (Amarelo moderno)
  warning: {
    50: '#FEFCE8',
    100: '#FEF08A',
    200: '#FDE047',
    300: '#FACC15',
    400: '#EAB308',
    500: '#CA8A04',  // Amarelo
    600: '#A16207',
    700: '#854D0E',
    800: '#713F12',
    900: '#54340F',
  },

  // Erro (Vermelho elegante)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Vermelho
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Informação (Azul claro)
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',  // Azul Info
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Neutros (Cinzas Premium)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0F0F0F',
  },

  // Borders
  border: {
    light: '#E5E7EB',
    dark: '#424242',
  },

  // Backgrounds
  background: {
    light: '#FFFFFF',
    dark: '#0F1117',
    darkSecondary: '#161B22',
  },

  // Text
  text: {
    light: {
      primary: '#212121',
      secondary: '#616161',
      tertiary: '#9E9E9E',
      disabled: '#BDBDBD',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      tertiary: '#BDBDBD',
      disabled: '#757575',
    },
  },
} as const;

// Aliases para uso simplificado
export const colorAliases = {
  // Light Mode
  light: {
    bg: colors.neutral[0],
    bgSecondary: colors.neutral[50],
    bgTertiary: colors.neutral[100],
    border: colors.border.light,
    text: colors.text.light.primary,
    textSecondary: colors.text.light.secondary,
    textTertiary: colors.text.light.tertiary,
  },
  // Dark Mode
  dark: {
    bg: colors.background.dark,
    bgSecondary: colors.background.darkSecondary,
    bgTertiary: colors.neutral[800],
    border: colors.border.dark,
    text: colors.text.dark.primary,
    textSecondary: colors.text.dark.secondary,
    textTertiary: colors.text.dark.tertiary,
  },
};

export type ColorKey = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
