'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * BUTTON - Componente Premium
 *
 * Variantes:
 * - solid: Fundo sólido (ação principal)
 * - outline: Borda apenas (ação secundária)
 * - ghost: Transparente (ação terciária)
 * - danger: Fundo vermelho (ações perigosas)
 *
 * Tamanhos:
 * - xs, sm, base, lg
 *
 * Estados:
 * - disabled, loading
 */

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Solid - Ação principal (Alto contraste)
        solid:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',

        // Outline - Ação secundária (Baixo contraste)
        outline:
          'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900 dark:active:bg-primary-800',

        // Ghost - Ação terciária (Minimal)
        ghost:
          'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',

        // Danger - Ações perigosas (Vermelho)
        danger:
          'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 dark:bg-error-600 dark:hover:bg-error-700',

        // Success - Ações confirmadas (Verde)
        success:
          'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 dark:bg-success-600 dark:hover:bg-success-700',

        // Warning - Alertas (Amarelo)
        warning:
          'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 focus-visible:ring-warning-500 dark:bg-warning-600 dark:hover:bg-warning-700',

        // Accent - Destaque premium (Dourado)
        accent:
          'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 focus-visible:ring-accent-400 dark:bg-accent-600 dark:hover:bg-accent-700',
      },

      size: {
        xs: 'px-3 py-1.5 text-xs gap-1.5',
        sm: 'px-3 py-2 text-sm gap-2',
        base: 'px-4 py-2.5 text-base gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
        xl: 'px-8 py-4 text-lg gap-3',
      },

      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
    },

    defaultVariants: {
      variant: 'solid',
      size: 'base',
      width: 'auto',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Button Component
 *
 * @example
 * <Button variant="solid" size="lg">
 *   Click me
 * </Button>
 *
 * @example
 * <Button variant="outline" isLoading>
 *   Loading...
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      width,
      isLoading,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, width }),
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{children}</span>
          </>
        ) : icon && iconPosition === 'left' ? (
          <>
            <span className="inline-flex">{icon}</span>
            <span>{children}</span>
          </>
        ) : icon && iconPosition === 'right' ? (
          <>
            <span>{children}</span>
            <span className="inline-flex">{icon}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants, type ButtonProps };
