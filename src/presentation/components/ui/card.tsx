import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  [
    'rounded-2xl transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white border border-surface-200',
          'dark:bg-surface-900 dark:border-surface-800',
        ],
        elevated: [
          'bg-white shadow-lg shadow-surface-200/50',
          'dark:bg-surface-900 dark:shadow-surface-950/50',
        ],
        glass: [
          'bg-white/70 backdrop-blur-xl border border-white/20',
          'dark:bg-surface-900/70 dark:border-surface-700/30',
        ],
        gradient: [
          'bg-gradient-to-br from-primary-500/10 to-accent-500/10',
          'border border-primary-200/50',
          'dark:from-primary-500/5 dark:to-accent-500/5 dark:border-primary-800/30',
        ],
        interactive: [
          'bg-white border border-surface-200 cursor-pointer',
          'hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10',
          'dark:bg-surface-900 dark:border-surface-800',
          'dark:hover:border-primary-700 dark:hover:shadow-primary-500/5',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight text-surface-900 dark:text-surface-50',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-surface-500 dark:text-surface-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

