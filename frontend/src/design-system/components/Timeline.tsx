'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * TIMELINE - Histórico de atividades
 *
 * Features:
 * - Linha vertical elegante
 * - Ícones customizáveis
 * - Timestamps
 * - Descrições
 */

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-700',
  success: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 border-success-200 dark:border-success-700',
  warning: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-700',
  error: 'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300 border-error-200 dark:border-error-700',
  info: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-300 border-info-200 dark:border-info-700',
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
};

const lineColors = {
  primary: 'bg-primary-200 dark:bg-primary-700',
  success: 'bg-success-200 dark:bg-success-700',
  warning: 'bg-warning-200 dark:bg-warning-700',
  error: 'bg-error-200 dark:bg-error-700',
  info: 'bg-info-200 dark:bg-info-700',
  neutral: 'bg-neutral-200 dark:bg-neutral-700',
};

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ items, className }, ref) => {
    const formatTime = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `${diffMins}m atrás`;
      if (diffHours < 24) return `${diffHours}h atrás`;
      if (diffDays < 7) return `${diffDays}d atrás`;

      return date.toLocaleDateString('pt-BR', {
        day: 'short',
        month: 'short',
      });
    };

    return (
      <div ref={ref} className={cn('space-y-6', className)}>
        {items.map((item, index) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-4 flex items-center justify-center flex-shrink-0',
                  colorClasses[item.color || 'primary']
                )}
              >
                {item.icon || (
                  <div className="w-2 h-2 bg-current rounded-full" />
                )}
              </div>

              {/* Connector line */}
              {index < items.length - 1 && (
                <div
                  className={cn(
                    'w-1 flex-1 mt-4 mb-0',
                    lineColors[item.color || 'primary']
                  )}
                  style={{ minHeight: '60px' }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 flex-shrink-0 whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

Timeline.displayName = 'Timeline';

export type { TimelineProps, TimelineItem };
