import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[22px] border-4 border-ink bg-card p-4 text-card-foreground shadow-sticker',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Закрыть"
          className="absolute right-3 top-3 grid size-11 cursor-pointer place-items-center rounded-full border-4 border-ink bg-pink font-display text-xl text-white shadow-sticker-sm"
        >
          <span aria-hidden>×</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription };
