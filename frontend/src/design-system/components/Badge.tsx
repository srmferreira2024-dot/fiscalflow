'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * BADGE - Componente Premium
 *
 * Rótulos pequenos com estilo
 * Perfeito para status, tags, categorias
 */

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-full text-xs whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        // Variances
        default:
          'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',

        success:
          'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',

        warning:
          'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',

        error:
          'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',

        info:
          'bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200',

        neutral:
          'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',

        accent:
          'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
      },

      size: {
        sm: 'px-2 py-1 text-xs',
        base: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2 text-sm',
      },

      style: {
        solid: '',
        outline:
          'border border-current bg-transparent',
        dot: 'gap-2',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'base',
      style: 'solid',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  icon?: React.ReactNode;
}

/**
 * Badge Component
 *
 * @example
 * <Badge variant="success">Aprovado</Badge>
 *
 * @example
 * <Badge variant="warning" dot>
 *   Pendente
 * </Badge>
 *
 * @example
 * <Badge variant="error" icon={<AlertCircle size={14} />}>
 *   Erro
 * </Badge>
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, size, style, dot, icon, children, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, style }),
          className
        )}
        {...props}
      >
        {dot && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1" />
        )}
        {icon && <span className="inline-flex mr-1">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants, type BadgeProps };
