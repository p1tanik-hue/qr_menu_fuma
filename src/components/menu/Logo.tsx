import { cn } from '@/lib/utils';

export function Logo({
  className,
  subtitle = true,
}: {
  className?: string;
  subtitle?: boolean;
}) {
  return (
    <div className={cn('flex flex-col items-center select-none', className)}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 font-display text-lg font-semibold gold-text"
        >
          F
        </span>
        <span className="font-display text-2xl font-semibold tracking-[0.25em] gold-text sm:text-3xl">
          FUMA
        </span>
      </div>
      {subtitle && (
        <span className="mt-1 text-[0.6rem] font-light tracking-[0.55em] text-sand-muted sm:text-xs">
          LOUNGE
        </span>
      )}
    </div>
  );
}
