'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminCategory, AdminProduct } from '@/lib/menu';
import { api } from '@/lib/admin-client';
import { formatPrice, formatVolume, normalizeSearch } from '@/lib/utils';
import { CategoryManager } from './CategoryManager';
import { ProductEditor } from './ProductEditor';

export function AdminDashboard({
  initialCategories,
  initialProducts,
}: {
  initialCategories: AdminCategory[];
  initialProducts: AdminProduct[];
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const [search, setSearch] = useState('');
  // undefined = closed, null = new product, object = edit
  const [editor, setEditor] = useState<AdminProduct | null | undefined>(undefined);

  const leafCategories = useMemo(
    () =>
      initialCategories.filter(
        (c) =>
          c.parentId !== null ||
          !initialCategories.some((x) => x.parentId === c.id),
      ),
    [initialCategories],
  );

  const q = normalizeSearch(search);
  const searching = q.length > 0;
  const filtered = searching
    ? initialProducts.filter((p) => normalizeSearch(p.name).includes(q))
    : initialProducts;

  function catName(id: string) {
    const c = initialCategories.find((x) => x.id === id);
    if (!c) return '—';
    const parent = initialCategories.find((p) => p.id === c.parentId);
    return parent ? `${parent.name} → ${c.name}` : c.name;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-sand">Меню</h1>
          <p className="text-sm text-sand-muted">
            {initialProducts.length} товаров · {leafCategories.length} категорий
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Поиск товара…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input sm:w-56"
          />
          <button
            onClick={() => setEditor(null)}
            className="btn-gold whitespace-nowrap rounded-lg px-4 py-2.5 text-sm"
          >
            + Товар
          </button>
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm text-gold hover:underline">
          Управление категориями
        </summary>
        <div className="mt-3">
          <CategoryManager categories={initialCategories} onChanged={refresh} />
        </div>
      </details>

      {searching ? (
        <div className="card-surface rounded-2xl p-4">
          <h2 className="mb-3 font-display text-lg text-sand">
            Результаты: {filtered.length}
          </h2>
          <div className="flex flex-col gap-2">
            {filtered.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                categoryLabel={catName(p.categoryId)}
                onEdit={() => setEditor(p)}
                onChanged={refresh}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-sand-muted">
                Ничего не найдено
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {leafCategories.map((cat) => {
            const products = initialProducts
              .filter((p) => p.categoryId === cat.id)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            return (
              <ProductGroup
                key={`${cat.id}:${products.map((p) => p.id).join(',')}`}
                categoryId={cat.id}
                title={catName(cat.id)}
                products={products}
                onEdit={(p) => setEditor(p)}
                onChanged={refresh}
              />
            );
          })}
        </div>
      )}

      {editor !== undefined && (
        <ProductEditor
          product={editor}
          categories={initialCategories}
          onClose={() => setEditor(undefined)}
          onSaved={() => {
            setEditor(undefined);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ProductGroup({
  categoryId,
  title,
  products,
  onEdit,
  onChanged,
}: {
  categoryId: string;
  title: string;
  products: AdminProduct[];
  onEdit: (p: AdminProduct) => void;
  onChanged: () => void;
}) {
  const [items, setItems] = useState(products);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    await api('/api/admin/products/reorder', {
      method: 'POST',
      body: JSON.stringify({ categoryId, ids: next.map((i) => i.id) }),
    }).catch(() => onChanged());
  }

  return (
    <div className="card-surface rounded-2xl p-4">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-gold/80">
        {title}{' '}
        <span className="text-sand-muted/60">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-sand-muted">Нет товаров</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {items.map((p) => (
                <SortableProductRow
                  key={p.id}
                  product={p}
                  onEdit={() => onEdit(p)}
                  onChanged={onChanged}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableProductRow({
  product,
  onEdit,
  onChanged,
}: {
  product: AdminProduct;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <ProductRow
        product={product}
        onEdit={onEdit}
        onChanged={onChanged}
        dragHandle={{ attributes, listeners }}
      />
    </div>
  );
}

function ProductRow({
  product,
  categoryLabel,
  onEdit,
  onChanged,
  dragHandle,
}: {
  product: AdminProduct;
  categoryLabel?: string;
  onEdit: () => void;
  onChanged: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandle?: { attributes: any; listeners: any };
}) {
  const def =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];

  async function remove() {
    if (!confirm(`Удалить товар «${product.name}»?`)) return;
    await api(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    onChanged();
  }
  async function toggleActive() {
    await api(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    onChanged();
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gold/10 bg-ink-700/40 p-2.5">
      {dragHandle && (
        <button
          className="cursor-grab px-1 text-sand-muted/60 hover:text-gold active:cursor-grabbing"
          {...dragHandle.attributes}
          {...dragHandle.listeners}
          aria-label="Переместить"
        >
          ⠿
        </button>
      )}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-900">
        {product.thumbUrl && (
          <Image
            src={product.thumbUrl}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sand">
          {product.name}
          {!product.isActive && (
            <span className="ml-2 text-xs text-red-400">(скрыт)</span>
          )}
        </p>
        <p className="truncate text-xs text-sand-muted">
          {categoryLabel ? `${categoryLabel} · ` : ''}
          {def ? formatPrice(def.price) : '—'}
          {def?.volume ? ` · ${formatVolume(def.volume, def.volumeUnit)}` : ''}
          {product.variants.length > 1 ? ` · ${product.variants.length} вар.` : ''}
        </p>
      </div>
      <button
        onClick={toggleActive}
        title={product.isActive ? 'Скрыть' : 'Показать'}
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          product.isActive ? 'bg-emerald-400' : 'bg-graphite-light'
        }`}
      />
      <button
        onClick={onEdit}
        className="rounded-lg border border-gold/30 px-3 py-1.5 text-xs text-gold hover:bg-gold/10"
      >
        Изменить
      </button>
      <button
        onClick={remove}
        className="rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
      >
        ✕
      </button>
    </div>
  );
}
