'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * KPI CARD - Indicador chave de desempenho
 *
 * Features:
 * - Valor principal + secundário
 * - Trend (up/down/neutral)
 * - Ícone customizável
 * - Cores por tipo
 */

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  className?: string;
}

const variantColors = {
  primary: 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-200 border-primary-200 dark:border-primary-700',
  success: 'bg-success-50 dark:bg-success-900 text-success-700 dark:text-success-200 border-success-200 dark:border-success-700',
  warning: 'bg-warning-50 dark:bg-warning-900 text-warning-700 dark:text-warning-200 border-warning-200 dark:border-warning-700',
  error: 'bg-error-50 dark:bg-error-900 text-error-700 dark:text-error-200 border-error-200 dark:border-error-700',
  info: 'bg-info-50 dark:bg-info-900 text-info-700 dark:text-info-200 border-info-200 dark:border-info-700',
};

const iconColors = {
  primary: 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300',
  success: 'bg-success-100 dark:bg-success-800 text-success-600 dark:text-success-300',
  warning: 'bg-warning-100 dark:bg-warning-800 text-warning-600 dark:text-warning-300',
  error: 'bg-error-100 dark:bg-error-800 text-error-600 dark:text-error-300',
  info: 'bg-info-100 dark:bg-info-800 text-info-600 dark:text-info-300',
};

export const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  (
    {
      title,
      value,
      unit,
      subtext,
      icon,
      trend,
      variant = 'primary',
      onClick,
      className,
    },
    ref
  ) => {
    const trendIsPositive = trend?.direction === 'up';
    const trendIsNegative = trend?.direction === 'down';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-lg border p-6 transition-all duration-200',
          'hover:shadow-md',
          onClick && 'cursor-pointer',
          variantColors[variant],
          className
        )}
      >
        {/* Header: Title + Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-75">{title}</p>
          </div>
          {icon && (
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconColors[variant])}>
              {icon}
            </div>
          )}
        </div>

        {/* Main value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{value}</span>
            {unit && <span className="text-lg opacity-60">{unit}</span>}
          </div>
        </div>

        {/* Trend + Subtext */}
        <div className="flex items-center justify-between">
          <div>
            {subtext && <p className="text-xs opacity-75">{subtext}</p>}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {trendIsPositive && (
                <>
                  <TrendingUp size={14} />
                  <span>+{trend.value}%</span>
                </>
              )}
              {trendIsNegative && (
                <>
                  <TrendingDown size={14} />
                  <span>-{Math.abs(trend.value)}%</span>
                </>
              )}
              {trend.direction === 'neutral' && (
                <span>—</span>
              )}
              <span className="opacity-60">{trend.period}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

KPICard.displayName = 'KPICard';

export type { KPICardProps };
