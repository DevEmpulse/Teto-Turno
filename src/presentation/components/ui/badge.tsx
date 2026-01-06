import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary-100 text-primary-700',
          'dark:bg-primary-900/30 dark:text-primary-300',
        ],
        secondary: [
          'bg-surface-100 text-surface-700',
          'dark:bg-surface-800 dark:text-surface-300',
        ],
        success: [
          'bg-green-100 text-green-700',
          'dark:bg-green-900/30 dark:text-green-300',
        ],
        warning: [
          'bg-yellow-100 text-yellow-700',
          'dark:bg-yellow-900/30 dark:text-yellow-300',
        ],
        danger: [
          'bg-red-100 text-red-700',
          'dark:bg-red-900/30 dark:text-red-300',
        ],
        info: [
          'bg-blue-100 text-blue-700',
          'dark:bg-blue-900/30 dark:text-blue-300',
        ],
        outline: [
          'border border-current bg-transparent',
        ],
        glow: [
          'bg-primary-600 text-white shadow-glow',
        ],
      },
      size: {
        sm: 'text-xs px-2 py-0.5 rounded-md',
        default: 'text-xs px-2.5 py-1 rounded-lg',
        lg: 'text-sm px-3 py-1.5 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

