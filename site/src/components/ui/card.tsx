import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[22px] border-4 border-ink bg-card sheen-card text-card-foreground shadow-sticker',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 px-6 pt-6', className)} {...props} />;
}

function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('font-display text-xl leading-tight', className)} {...props} />;
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-6 pb-6 pt-3', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };
