'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '@/design-system/theme/ThemeProvider';

/**
 * NAVBAR - Barra superior do dashboard
 *
 * Features:
 * - Logo/título
 * - Search
 * - Notificações
 * - Theme toggle
 * - User menu
 */

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  ({ title, subtitle, showSearch = true }, ref) => {
    const { theme, setTheme } = useTheme();

    return (
      <nav
        ref={ref}
        className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800"
      >
        <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex-1 min-w-0">
            {title && (
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search - Hidden on mobile */}
            {showSearch && (
              <div className="hidden md:flex items-center">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-200"
                />
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <Bell size={20} className="text-neutral-600 dark:text-neutral-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <Moon size={20} className="text-neutral-600" />
              ) : (
                <Sun size={20} className="text-neutral-400" />
              )}
            </button>

            {/* User menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200 dark:border-neutral-800">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Admin User
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Administrador
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';

export type { NavbarProps };
