import Image from 'next/image';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: { className: 'h-10', sizes: '42px' },
  md: { className: 'h-24', sizes: '98px' },
  lg: { className: 'h-36 sm:h-44', sizes: '(min-width: 640px) 178px, 146px' },
} as const;

export function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  subtitle?: boolean;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];
  return (
    <div className={cn('flex max-w-full items-center justify-center select-none', className)}>
      <Image
        src="/logo.png"
        alt="FUMA LOUNGE"
        width={377}
        height={372}
        sizes={s.sizes}
        priority={size === 'lg'}
        className={cn('block w-auto max-w-full object-contain', s.className)}
      />
    </div>
  );
}
