/**
 * DESIGN SYSTEM - COMPONENTES EXPORT
 *
 * Central hub para componentes reutilizáveis
 * Use: import { Button, Input, Card } from '@/design-system/components'
 */

// Primitivos
export { Button, buttonVariants, type ButtonProps } from './Button';
export { Input, inputVariants, type InputProps } from './Input';
export { Badge, badgeVariants, type BadgeProps } from './Badge';
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  type CardProps,
} from './Card';

// Tema
export { ThemeProvider, useTheme, useThemeToggle, type Theme } from '@/design-system/theme/ThemeProvider';
