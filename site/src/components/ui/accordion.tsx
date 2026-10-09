import { Accordion as AccordionPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Accordion({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root className={cn('flex flex-col gap-4', className)} {...props} />;
}

function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        'overflow-hidden rounded-[22px] border-4 border-ink bg-card text-card-foreground shadow-sticker-sm',
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="m-0 flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex min-h-14 flex-1 cursor-pointer items-center justify-between gap-4 px-5 py-3 text-left font-display text-lg leading-snug',
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-yellow text-xl leading-none transition-transform group-data-[state=open]:rotate-45 motion-reduce:transition-none"
        >
          +
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.2s_ease-out] data-[state=open]:animate-[accordion-down_0.2s_ease-out]"
      {...props}
    >
      <div className={cn('px-5 pb-5 pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
