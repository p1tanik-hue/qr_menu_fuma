'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { ProductDTO } from '@/lib/types';
import { formatPrice, formatVolume } from '@/lib/utils';

export function ProductModal({
  product,
  onClose,
}: {
  product: ProductDTO | null;
  onClose: () => void;
}) {
  const [variantId, setVariantId] = useState<string | null>(null);

  // Reset selected variant whenever the product changes.
  useEffect(() => {
    if (product) {
      const def =
        product.variants.find((v) => v.isDefault) ?? product.variants[0];
      setVariantId(def?.id ?? null);
    }
  }, [product]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!product) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  const activeVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) => v.id === variantId) ?? product.variants[0]
    );
  }, [product, variantId]);

  return (
    <AnimatePresence>
      {product && activeVariant && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <button
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-gold/20 bg-ink-800 shadow-card sm:rounded-3xl"
          >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ink-900">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 512px"
                  placeholder={product.blurData ? 'blur' : 'empty'}
                  blurDataURL={product.blurData ?? undefined}
                  className="object-cover"
                  priority
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent" />
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-ink/60 text-sand backdrop-blur transition-colors hover:border-gold hover:text-gold"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto p-5 sm:p-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-sand">
                  {product.name}
                </h2>
                <div className="gold-divider mt-3" />
              </div>

              {/* Variant switcher */}
              {product.variants.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const active = v.id === activeVariant.id;
                    const label =
                      v.label ??
                      formatVolume(v.volume, v.volumeUnit) ??
                      formatPrice(v.price);
                    return (
                      <button
                        key={v.id}
                        onClick={() => setVariantId(v.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ease-premium ${
                          active
                            ? 'border-gold bg-gold/15 text-gold'
                            : 'border-graphite-light/60 text-sand-muted hover:border-gold/40'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.p
                  key={activeVariant.id + '-desc'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm leading-relaxed text-sand-muted"
                >
                  {activeVariant.description ??
                    product.description ??
                    'Изысканный вкус в атмосфере FUMA LOUNGE.'}
                </motion.p>
              </AnimatePresence>

              {/* Add-ons */}
              {product.addons.length > 0 && (
                <div className="rounded-xl border border-gold/15 bg-ink-700/50 p-3">
                  <p className="mb-2 text-[0.7rem] uppercase tracking-widest text-sand-muted">
                    Добавки
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {product.addons.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between text-sm text-sand"
                      >
                        <span>{a.name}</span>
                        <span className="text-gold">+{formatPrice(a.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price row */}
              <div className="mt-1 flex items-center justify-between rounded-2xl border border-gold/20 bg-ink-700/40 px-5 py-4">
                <div className="flex flex-col">
                  {activeVariant.volume ? (
                    <span className="text-xs text-sand-muted">
                      {formatVolume(activeVariant.volume, activeVariant.volumeUnit)}
                    </span>
                  ) : null}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeVariant.id + '-price'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="font-display text-3xl font-semibold text-gold"
                    >
                      {formatPrice(activeVariant.price)}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="text-right text-xs leading-relaxed text-sand-muted">
                  Уточните заказ
                  <br />у официанта
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
