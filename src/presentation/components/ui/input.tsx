'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'flex w-full bg-transparent text-surface-900 placeholder:text-surface-400',
    'transition-all duration-200',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'dark:text-surface-50 dark:placeholder:text-surface-500',
  ],
  {
    variants: {
      variant: {
        default: [
          'border border-surface-300 rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'dark:border-surface-700 dark:focus:ring-primary-400 dark:focus:border-primary-400',
        ],
        filled: [
          'border-0 bg-surface-100 rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'dark:bg-surface-800 dark:focus:ring-primary-400',
        ],
        underline: [
          'border-0 border-b-2 border-surface-300 rounded-none px-0',
          'focus:outline-none focus:border-primary-500',
          'dark:border-surface-700 dark:focus:border-primary-400',
        ],
        ghost: [
          'border-0 rounded-xl',
          'hover:bg-surface-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface-50',
          'dark:hover:bg-surface-800 dark:focus:bg-surface-900',
        ],
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm',
        default: 'h-11 px-4 text-sm',
        lg: 'h-13 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, inputSize }),
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };

