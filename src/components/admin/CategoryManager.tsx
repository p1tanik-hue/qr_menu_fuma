'use client';

import { useState } from 'react';
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
import type { AdminCategory } from '@/lib/menu';
import { api } from '@/lib/admin-client';

export function CategoryManager({
  categories,
  onChanged,
}: {
  categories: AdminCategory[];
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newParent, setNewParent] = useState('');
  const [busy, setBusy] = useState(false);

  const tops = categories.filter((c) => c.parentId === null);

  async function createCategory() {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      await api('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          emoji: newEmoji.trim() || null,
          parentId: newParent || null,
        }),
      });
      setNewName('');
      setNewEmoji('');
      setNewParent('');
      setAdding(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-surface rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-sand">Категории</h2>
        <button
          onClick={() => setAdding((a) => !a)}
          className="rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold hover:bg-gold/10"
        >
          {adding ? 'Отмена' : '+ Категория'}
        </button>
      </div>

      {adding && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-gold/15 bg-ink-700/40 p-3 sm:flex-row">
          <input
            placeholder="Эмодзи"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            className="input sm:w-20"
          />
          <input
            placeholder="Название категории"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input flex-1"
          />
          <select
            value={newParent}
            onChange={(e) => setNewParent(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">— Верхний уровень —</option>
            {tops.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={createCategory}
            disabled={busy}
            className="btn-gold rounded-lg px-4 py-2 text-sm disabled:opacity-60"
          >
            Добавить
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {tops.map((top) => {
          const kids = categories.filter((c) => c.parentId === top.id);
          return (
            <CategoryGroup
              key={`${top.id}:${kids.map((k) => k.id).join(',')}`}
              top={top}
              childCats={kids}
              onChanged={onChanged}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryGroup({
  top,
  childCats,
  onChanged,
}: {
  top: AdminCategory;
  childCats: AdminCategory[];
  onChanged: () => void;
}) {
  const [items, setItems] = useState(childCats);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    await api('/api/admin/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    }).catch(() => onChanged());
  }

  return (
    <div>
      <CategoryRow category={top} onChanged={onChanged} isTop />
      {items.length > 0 && (
        <div className="mt-2 pl-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-1.5">
                {items.map((c) => (
                  <SortableCategoryRow key={c.id} category={c} onChanged={onChanged} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

function SortableCategoryRow({
  category,
  onChanged,
}: {
  category: AdminCategory;
  onChanged: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
    >
      <CategoryRow category={category} onChanged={onChanged} dragHandle={{ attributes, listeners }} />
    </div>
  );
}

function CategoryRow({
  category,
  onChanged,
  isTop = false,
  dragHandle,
}: {
  category: AdminCategory;
  onChanged: () => void;
  isTop?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandle?: { attributes: any; listeners: any };
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [emoji, setEmoji] = useState(category.emoji ?? '');

  async function save() {
    await api(`/api/admin/categories/${category.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: name.trim(), emoji: emoji.trim() || null }),
    });
    setEditing(false);
    onChanged();
  }
  async function remove() {
    if (!confirm(`Удалить категорию «${category.name}» со всем содержимым?`)) return;
    await api(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
    onChanged();
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-2 ${
        isTop ? 'bg-gold/5 font-medium' : 'bg-ink-700/40'
      }`}
    >
      {dragHandle && (
        <button
          className="cursor-grab text-sand-muted/60 hover:text-gold active:cursor-grabbing"
          {...dragHandle.attributes}
          {...dragHandle.listeners}
          aria-label="Переместить"
        >
          ⠿
        </button>
      )}
      {editing ? (
        <>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="input w-14" />
          <input value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" />
          <button onClick={save} className="text-xs text-gold hover:underline">
            OK
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-sand">
            {category.emoji ? `${category.emoji} ` : ''}
            {category.name}
            {!category.isActive && (
              <span className="ml-2 text-xs text-red-400">(скрыта)</span>
            )}
          </span>
          <button onClick={() => setEditing(true)} className="text-xs text-sand-muted hover:text-gold">
            ✎
          </button>
          <button onClick={remove} className="text-xs text-red-400 hover:underline">
            ✕
          </button>
        </>
      )}
    </div>
  );
}
