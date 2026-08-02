'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AdminCategory, AdminProduct } from '@/lib/menu';
import { api } from '@/lib/admin-client';
import { ImageUploader } from './ImageUploader';

interface VariantForm {
  label: string;
  volume: string;
  price: string;
  description: string;
  isDefault: boolean;
}

function emptyVariant(isDefault = false): VariantForm {
  return { label: '', volume: '', price: '', description: '', isDefault };
}

export function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const leafCategories = categories.filter(
    (c) => c.parentId !== null || !categories.some((x) => x.parentId === c.id),
  );

  const [name, setName] = useState(product?.name ?? '');
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? leafCategories[0]?.id ?? '',
  );
  const [description, setDescription] = useState(product?.description ?? '');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [image, setImage] = useState({
    imageUrl: product?.imageUrl ?? null,
    thumbUrl: product?.thumbUrl ?? null,
    blurData: product?.blurData ?? null,
  });
  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants.length
      ? product.variants.map((v) => ({
          label: v.label ?? '',
          volume: v.volume?.toString() ?? '',
          price: v.price.toString(),
          description: v.description ?? '',
          isDefault: v.isDefault,
        }))
      : [emptyVariant(true)],
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function updateVariant(i: number, patch: Partial<VariantForm>) {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    );
  }
  function setDefault(i: number) {
    setVariants((prev) => prev.map((v, idx) => ({ ...v, isDefault: idx === i })));
  }

  async function save() {
    setError('');
    if (!name.trim()) return setError('Введите название');
    if (!categoryId) return setError('Выберите категорию');
    const parsedVariants = variants
      .filter((v) => v.price !== '')
      .map((v) => ({
        label: v.label.trim() || null,
        volume: v.volume ? Number(v.volume) : null,
        volumeUnit: 'мл',
        price: Number(v.price),
        description: v.description.trim() || null,
        isDefault: v.isDefault,
      }));
    if (parsedVariants.length === 0)
      return setError('Добавьте хотя бы один вариант с ценой');

    setSaving(true);
    try {
      const payload = {
        categoryId,
        name: name.trim(),
        description: description.trim() || null,
        imageUrl: image.imageUrl,
        thumbUrl: image.thumbUrl,
        blurData: image.blurData,
        isFeatured,
        isActive,
        variants: parsedVariants,
      };
      if (product) {
        await api(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          aria-label="Закрыть"
          onClick={onClose}
          className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-gold/20 bg-ink-800 p-5 shadow-card sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-sand">
              {product ? 'Редактировать товар' : 'Новый товар'}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-sand hover:text-gold"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Фото">
              <ImageUploader
                value={image.imageUrl}
                onUploaded={(r) => setImage(r)}
                onRemove={() =>
                  setImage({ imageUrl: null, thumbUrl: null, blurData: null })
                }
              />
            </Field>

            <Field label="Название">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Категория">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input"
              >
                {leafCategories.map((c) => {
                  const parent = categories.find((p) => p.id === c.parentId);
                  return (
                    <option key={c.id} value={c.id}>
                      {parent ? `${parent.name} → ` : ''}
                      {c.name}
                    </option>
                  );
                })}
              </select>
            </Field>

            <Field label="Описание">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input resize-none"
              />
            </Field>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-sand">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-gold"
                />
                Хит
              </label>
              <label className="flex items-center gap-2 text-sm text-sand">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-gold"
                />
                Активен
              </label>
            </div>

            {/* Variants */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-sand-muted">
                  Варианты (объём / цена)
                </span>
                <button
                  type="button"
                  onClick={() => setVariants((p) => [...p, emptyVariant()])}
                  className="rounded-full border border-gold/30 px-2.5 py-1 text-xs text-gold hover:bg-gold/10"
                >
                  + Вариант
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gold/15 bg-ink-700/40 p-3"
                  >
                    <div className="mb-2 grid grid-cols-3 gap-2">
                      <input
                        placeholder="Метка"
                        value={v.label}
                        onChange={(e) => updateVariant(i, { label: e.target.value })}
                        className="input"
                      />
                      <input
                        placeholder="Объём (мл)"
                        inputMode="numeric"
                        value={v.volume}
                        onChange={(e) =>
                          updateVariant(i, {
                            volume: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        className="input"
                      />
                      <input
                        placeholder="Цена ₽"
                        inputMode="numeric"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(i, {
                            price: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        className="input"
                      />
                    </div>
                    <input
                      placeholder="Описание варианта (необязательно)"
                      value={v.description}
                      onChange={(e) =>
                        updateVariant(i, { description: e.target.value })
                      }
                      className="input mb-2"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-sand-muted">
                        <input
                          type="radio"
                          name="default-variant"
                          checked={v.isDefault}
                          onChange={() => setDefault(i)}
                          className="accent-gold"
                        />
                        По умолчанию
                      </label>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setVariants((p) => p.filter((_, idx) => idx !== i))
                          }
                          className="text-xs text-red-400 hover:underline"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="sticky bottom-0 -mx-5 mt-2 flex gap-3 border-t border-gold/10 bg-ink-800 px-5 py-4 sm:-mx-6 sm:px-6">
              <button
                onClick={save}
                disabled={saving}
                className="btn-gold flex-1 rounded-lg py-3 text-sm disabled:opacity-60"
              >
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-graphite-light/50 px-5 text-sm text-sand-muted hover:text-sand"
              >
                Отмена
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest text-sand-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
