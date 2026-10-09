import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// a slab with a lit top and a shaded lip, pressed by shifting into its own shadow
const buttonVariants = cva(
  [
    'inline-flex cursor-pointer items-center justify-center gap-2.5 text-center rounded-[18px] border-4 border-ink font-display font-normal no-underline',
    'sheen-btn shadow-[inset_0_-5px_0_rgba(27,16,51,0.22),5px_7px_0_var(--ink)]',
    'transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1.5 active:shadow-[inset_0_-2px_0_rgba(27,16,51,0.22),1px_1px_0_var(--ink)]',
    'motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        default: 'bg-yellow text-ink',
        pink: 'bg-pink text-white',
        ghost: 'bg-paper text-ink',
      },
      size: {
        default: 'min-h-14 px-6 py-3 text-lg',
        sm: 'min-h-11 px-4 py-2 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
