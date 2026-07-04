'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AUTH LAYOUT - Container para páginas de autenticação
 *
 * Features:
 * - Background elegante com gradiente
 * - Formulário centrado
 * - Logo e branding
 * - Responsivo (mobile/tablet/desktop)
 * - Dark mode support
 */

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  className?: string;
}

export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ children, title, subtitle, logo, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative min-h-screen w-full flex items-center justify-center',
          'bg-gradient-to-br from-primary-50 via-white to-primary-100',
          'dark:from-primary-900 dark:via-neutral-900 dark:to-neutral-950',
          'px-4 py-8 sm:px-6 md:px-8',
          className
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Blob 1 */}
          <div
            className="absolute top-0 -right-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:bg-primary-700 dark:opacity-10"
            style={{ animation: 'blob 7s infinite' }}
          />
          {/* Blob 2 */}
          <div
            className="absolute -bottom-1/4 left-1/4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:bg-accent-700 dark:opacity-10"
            style={{ animation: 'blob 7s infinite 2s' }}
          />
        </div>

        {/* Content container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Logo + Branding */}
          {logo && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3">
                {logo}
                <span className="text-2xl font-bold text-primary-900 dark:text-white">
                  FiscalFlow
                </span>
              </div>
            </div>
          )}

          {/* Título e subtítulo */}
          {title && (
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-base text-neutral-600 dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Form container */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 space-y-6">
            {children}
          </div>

          {/* Footer text */}
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            © 2026 FiscalFlow. Todos os direitos reservados.
          </p>
        </div>

        {/* Blob animation */}
        <style jsx>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
        `}</style>
      </div>
    );
  }
);

AuthLayout.displayName = 'AuthLayout';

export type { AuthLayoutProps };
