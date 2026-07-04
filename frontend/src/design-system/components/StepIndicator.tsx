'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * STEP INDICATOR - Para formulários multi-step
 *
 * Features:
 * - Indicador visual de progresso
 * - Estados: pending, active, completed, error
 * - Customizável
 * - Responsivo
 */

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  errors?: Record<number, boolean>;
}

export const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ steps, currentStep, onStepClick, errors = {} }, ref) => {
    return (
      <div ref={ref} className="space-y-6">
        {/* Steps */}
        <div className="flex gap-4 md:gap-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const hasError = errors[index];

            return (
              <div key={step.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  disabled={index > currentStep}
                  className="w-full text-left disabled:cursor-not-allowed group"
                >
                  {/* Step number/icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full mb-3 transition-all duration-200',
                      isCompleted &&
                        'bg-success-500 text-white',
                      isActive &&
                        'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900',
                      !isCompleted &&
                        !isActive &&
                        'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
                      hasError &&
                        'bg-error-500 text-white',
                      index <= currentStep &&
                        'group-hover:shadow-md'
                    )}
                  >
                    {isCompleted ? (
                      <Check size={20} strokeWidth={3} />
                    ) : (
                      <span className="font-semibold text-sm">{index + 1}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        'font-semibold text-sm transition-colors',
                        isActive &&
                          'text-primary-600 dark:text-primary-400',
                        isCompleted &&
                          'text-success-600 dark:text-success-400',
                        !isCompleted &&
                          !isActive &&
                          'text-neutral-600 dark:text-neutral-400'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'hidden md:block absolute left-[26px] top-10 w-0.5 h-12 -ml-px',
                      isCompleted || (isActive && index + 1 <= currentStep)
                        ? 'bg-success-500'
                        : 'bg-neutral-200 dark:bg-neutral-700'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar (mobile) */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Passo {currentStep + 1} de {steps.length}
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden dark:bg-neutral-700">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

StepIndicator.displayName = 'StepIndicator';

export type { StepIndicatorProps, Step };
