'use client';

import Image from 'next/image';
import type { ProductDTO } from '@/lib/types';
import { formatPrice, formatVolume } from '@/lib/utils';

export function ProductCard({
  product,
  onOpen,
  index = 0,
}: {
  product: ProductDTO;
  onOpen: (product: ProductDTO) => void;
  index?: number;
}) {
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const hasMultiple = product.variants.length > 1;
  const minPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="group card-surface relative flex w-full flex-col overflow-hidden rounded-2xl text-left shadow-soft transition-[transform,border-color,box-shadow] duration-500 ease-premium hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 active:scale-[0.98]"
      aria-label={`${product.name}. Подробнее`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-ink-800">
        {product.thumbUrl || product.imageUrl ? (
          <Image
            src={product.thumbUrl ?? product.imageUrl!}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
            className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
            loading={index < 6 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gold/40">
            <span className="font-display text-4xl">F</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-ink/70 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-widest text-gold backdrop-blur">
            Хит
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-sand">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-sand-muted">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            {defaultVariant?.volume ? (
              <span className="text-[0.7rem] text-sand-muted">
                {formatVolume(defaultVariant.volume, defaultVariant.volumeUnit)}
              </span>
            ) : null}
            <span className="font-display text-lg font-semibold text-gold">
              {hasMultiple ? `от ${formatPrice(minPrice)}` : formatPrice(defaultVariant?.price ?? 0)}
            </span>
          </div>
          <span className="rounded-full border border-gold/30 px-3 py-1.5 text-[0.7rem] font-medium text-gold transition-colors duration-300 group-hover:border-gold group-hover:bg-gold/10">
            Подробнее
          </span>
        </div>
      </div>
    </button>
  );
}
