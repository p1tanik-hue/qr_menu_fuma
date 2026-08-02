import { cn } from '@/lib/utils';

const SIZES = {
  sm: { mark: 'h-7 w-7 text-base', title: 'text-xl', sub: 'text-[0.55rem] tracking-[0.5em]' },
  md: { mark: 'h-9 w-9 text-lg', title: 'text-2xl sm:text-3xl', sub: 'text-[0.6rem] sm:text-xs tracking-[0.55em]' },
  lg: { mark: 'h-12 w-12 text-2xl', title: 'text-4xl sm:text-5xl', sub: 'text-xs sm:text-sm tracking-[0.6em]' },
} as const;

export function Logo({
  className,
  subtitle = true,
  size = 'md',
}: {
  className?: string;
  subtitle?: boolean;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];
  return (
    <div className={cn('flex max-w-full flex-col items-center select-none', className)}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            'inline-flex items-center justify-center rounded-full border border-gold/40 font-display font-semibold gold-text',
            s.mark,
          )}
        >
          F
        </span>
        <span className={cn('font-display font-semibold tracking-[0.25em] gold-text', s.title)}>
          FUMA
        </span>
      </div>
      {subtitle && (
        <span className={cn('mt-1 font-light text-sand-muted', s.sub)}>LOUNGE</span>
      )}
    </div>
  );
}
