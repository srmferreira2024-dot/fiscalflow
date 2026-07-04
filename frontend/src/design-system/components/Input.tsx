'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * INPUT - Componente Premium
 *
 * Suporta:
 * - Texto, email, password, number, etc
 * - Ícones (left e right)
 * - Estados: focus, disabled, error, success
 * - Sizes: sm, base, lg
 */

const inputVariants = cva(
  // Base styles
  'w-full px-4 py-2.5 rounded-md border-2 bg-white text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus-visible:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-600 dark:disabled:bg-neutral-900',
  {
    variants: {
      variant: {
        default:
          'border-neutral-200 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200 hover:border-neutral-300 dark:border-neutral-700 dark:focus-visible:ring-primary-900 dark:hover:border-neutral-600',

        error:
          'border-error-500 focus-visible:border-error-600 focus-visible:ring-2 focus-visible:ring-error-200 dark:border-error-500 dark:focus-visible:ring-error-900',

        success:
          'border-success-500 focus-visible:border-success-600 focus-visible:ring-2 focus-visible:ring-success-200 dark:border-success-500 dark:focus-visible:ring-success-900',
      },

      size: {
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
  }
);

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
  success?: boolean;
  label?: string;
  description?: string;
}

/**
 * Input Component
 *
 * @example
 * <Input placeholder="seu@email.com" type="email" />
 *
 * @example
 * <Input
 *   label="Senha"
 *   type="password"
 *   error="Senha muito curta"
 * />
 *
 * @example
 * <Input
 *   icon={<Search size={18} />}
 *   placeholder="Buscar..."
 *   iconPosition="left"
 * />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      iconPosition = 'left',
      error,
      success,
      label,
      description,
      disabled,
      type,
      ...props
    },
    ref
  ) => {
    const resolvedVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2 dark:text-neutral-200">
            {label}
            {props.required && <span className="text-error-600 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none dark:text-neutral-400">
              {icon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              inputVariants({ variant: resolvedVariant, size }),
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none dark:text-neutral-400">
              {icon}
            </div>
          )}
        </div>

        {description && !error && (
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}

        {error && (
          <p className="mt-1.5 text-xs text-error-600 dark:text-error-400">
            {error}
          </p>
        )}

        {success && !error && (
          <p className="mt-1.5 text-xs text-success-600 dark:text-success-400">
            ✓ Válido
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants, type InputProps };
