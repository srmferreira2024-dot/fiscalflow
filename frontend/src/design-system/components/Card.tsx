'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * CARD - Componente Premium
 *
 * Container elegante para conteúdo
 * Usa sombra, borda, padding, e espaçamento apropriados
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'elevated', interactive, hover = true, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base
          'rounded-lg border p-6',
          // Light mode
          'bg-white border-neutral-200 shadow-sm',
          // Dark mode
          'dark:bg-neutral-800 dark:border-neutral-700',
          // Variants
          variant === 'elevated' &&
            'shadow-base dark:shadow-md',
          variant === 'outlined' &&
            'border-2 shadow-none',
          variant === 'filled' &&
            'bg-neutral-50 border-transparent shadow-none dark:bg-neutral-900',
          // Interactive
          interactive &&
            'cursor-pointer transition-all duration-200',
          interactive && hover &&
            'hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border-b border-neutral-200 pb-4 -m-6 mb-4 px-6 pt-6 dark:border-neutral-700', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1', className)}
      {...props}
    />
  )
);
CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border-t border-neutral-200 pt-4 mt-4 -m-6 mt-4 px-6 pb-6 dark:border-neutral-700', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// Title and Description
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-semibold text-neutral-900 dark:text-white',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-neutral-600 mt-1 dark:text-neutral-400',
        className
      )}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  type CardProps,
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps,
  type CardTitleProps,
  type CardDescriptionProps,
};
