import { cn } from '@/lib/utils';

/**
 * Elegant gold ornamental divider used between menu sections.
 * A thin beige-gold gradient line on each side of a small diamond motif.
 */
export function SectionDivider({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) {
  const center =
    size === 'md' ? 'h-2.5 w-2.5' : 'h-2 w-2';
  return (
    <div
      aria-hidden
      className={cn('flex items-center justify-center gap-3 sm:gap-4', className)}
    >
      <span className="h-px w-full max-w-[38%] bg-gradient-to-r from-transparent via-gold/25 to-gold/55" />
      <span className="flex items-center gap-1.5">
        <span className="h-1 w-1 rotate-45 bg-gold/55" />
        <span className={cn('rotate-45 border border-gold/70', center)} />
        <span className="h-1 w-1 rotate-45 bg-gold/55" />
      </span>
      <span className="h-px w-full max-w-[38%] bg-gradient-to-l from-transparent via-gold/25 to-gold/55" />
    </div>
  );
}
