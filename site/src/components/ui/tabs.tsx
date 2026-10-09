import { Tabs as TabsPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-6', className)} {...props} />;
}

function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex w-full flex-nowrap gap-2 overflow-x-auto rounded-[22px] border-4 border-ink bg-ink/60 p-2 sm:w-fit sm:max-w-full sm:self-center',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'min-h-11 flex-none cursor-pointer whitespace-nowrap rounded-2xl border-4 border-transparent px-4 py-1.5 font-display text-base text-muted-foreground transition-colors hover:text-white',
        'data-[state=active]:border-ink data-[state=active]:bg-yellow data-[state=active]:text-ink data-[state=active]:shadow-sticker-sm',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('outline-offset-8', className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
