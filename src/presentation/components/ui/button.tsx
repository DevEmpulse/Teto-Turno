'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'relative inline-flex cursor-pointer items-center justify-center gap-2',
    'font-medium transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700 hover:shadow-glow',
          'dark:bg-primary-500 dark:hover:bg-primary-600',
        ],
        secondary: [
          'bg-surface-200 text-surface-900',
          'hover:bg-surface-300',
          'dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700',
        ],
        outline: [
          'border-2 border-primary-500 text-primary-600 bg-transparent',
          'hover:bg-primary-50 hover:border-primary-600',
          'dark:text-primary-400 dark:hover:bg-primary-950/50',
        ],
        ghost: [
          'text-surface-600 bg-transparent',
          'hover:bg-surface-100 hover:text-surface-900',
          'dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100',
        ],
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'dark:bg-red-500 dark:hover:bg-red-600',
        ],
        link: [
          'text-primary-600 underline-offset-4 bg-transparent',
          'hover:underline hover:text-primary-700',
          'dark:text-primary-400 dark:hover:text-primary-300',
        ],
        glow: [
          'bg-gradient-to-r from-primary-600 to-accent-500 text-white',
          'hover:shadow-glow-lg hover:brightness-110',
          'before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-r',
          'before:from-primary-600 before:to-accent-500 before:opacity-0 before:blur-xl',
          'before:transition-opacity before:duration-300 hover:before:opacity-50',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        default: 'h-11 px-5 text-sm rounded-xl',
        lg: 'h-13 px-8 text-base rounded-xl',
        xl: 'h-14 px-10 text-lg rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

