import { screenUrl } from '@/lib/screens';
import { cn } from '@/lib/utils';

interface FrameProps {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

/** A TV: thick bezel, 16:9 picture, a stand. */
export function TvFrame({ name, alt, className, eager }: FrameProps) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="w-full overflow-hidden rounded-[18px] border-[6px] border-ink bg-ink shadow-sticker">
        <img
          src={screenUrl(name)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="block aspect-video w-full object-cover"
        />
      </div>
      <div aria-hidden className="h-3 w-1/4 border-x-4 border-ink bg-ink/80" />
      <div aria-hidden className="h-2.5 w-2/5 rounded-full border-4 border-ink bg-violet-2" />
    </div>
  );
}

/** A phone: rounded body, speaker slit, tall picture. */
export function PhoneFrame({ name, alt, className, eager }: FrameProps) {
  return (
    <div className={cn('relative rounded-[28px] border-[6px] border-ink bg-ink p-1.5 shadow-sticker', className)}>
      <div aria-hidden className="absolute left-1/2 top-2 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-violet-2" />
      <img
        src={screenUrl(name)}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="block aspect-[9/19] w-full rounded-[20px] object-cover"
      />
    </div>
  );
}
