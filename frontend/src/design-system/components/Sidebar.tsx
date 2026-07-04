'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Building2,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

/**
 * SIDEBAR - Navegação principal
 *
 * Features:
 * - Recolhível (mobile)
 * - Links ativos
 * - Grupos de menu
 * - Dark mode
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 size={20} /> },
    ],
  },
  {
    title: 'Negócio',
    items: [
      { label: 'Empresas', href: '/dashboard/companies', icon: <Building2 size={20} /> },
      { label: 'Clientes', href: '/dashboard/clients', icon: <Users size={20} /> },
      { label: 'Notas Fiscais', href: '/dashboard/invoices', icon: <FileText size={20} /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Usuários', href: '/dashboard/users', icon: <Users size={20} /> },
      { label: 'Configurações', href: '/dashboard/settings', icon: <Settings size={20} /> },
    ],
  },
];

export const Sidebar = React.forwardRef<HTMLDivElement, { collapsed?: boolean }>(
  ({ collapsed = false }, ref) => {
    const [isOpen, setIsOpen] = useState(!collapsed);
    const pathname = usePathname();

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          ref={ref}
          className={cn(
            'fixed left-0 top-0 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800',
            'transition-all duration-300 z-50 md:z-0',
            'flex flex-col',
            isOpen ? 'w-64' : 'w-20'
          )}
        >
          {/* Header */}
          <div className="h-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4">
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                  FF
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">
                  FiscalFlow
                </span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors md:hidden"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-6 space-y-8">
            {navGroups.map((group) => (
              <div key={group.title}>
                {isOpen && (
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 px-3">
                    {group.title}
                  </p>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link href={item.href}>
                          <div
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                              isActive
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            )}
                          >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {isOpen && (
                              <span className="flex-1 font-medium text-sm">{item.label}</span>
                            )}
                            {isOpen && item.badge && (
                              <span className="ml-auto px-2 py-1 bg-error-500 text-white text-xs rounded-full font-semibold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer */}
          {isOpen && (
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
              <button className="w-full px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                Sair
              </button>
            </div>
          )}
        </aside>

        {/* Spacer for desktop */}
        <div className={cn('hidden md:block', isOpen ? 'w-64' : 'w-20')} />
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';
