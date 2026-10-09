import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-center leading-snug border-[3px] border-ink px-3 py-0.5 text-sm font-bold text-ink shadow-[2px_3px_0_var(--ink)]',
  {
    variants: {
      variant: {
        default: 'bg-yellow',
        pink: 'bg-pink text-white',
        cyan: 'bg-cyan',
        green: 'bg-green',
        paper: 'bg-paper',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Badge({ className, variant, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
