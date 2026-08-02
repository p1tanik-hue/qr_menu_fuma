'use client';

import { useState } from 'react';
import { api } from '@/lib/admin-client';

export function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDone(false);
    if (next.length < 8) return setError('Новый пароль не короче 8 символов');
    if (next !== confirm) return setError('Пароли не совпадают');
    setBusy(true);
    try {
      await api('/api/admin/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-surface rounded-2xl p-5">
      <h2 className="mb-1 font-display text-lg text-sand">Смена пароля</h2>
      <p className="mb-4 text-sm text-sand-muted">
        Рекомендуем сменить пароль после первого входа.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs text-sand-muted">
            Текущий пароль
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-sand-muted">
            Новый пароль
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-sand-muted">
            Повторите новый пароль
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input"
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {done && (
          <p className="text-sm text-emerald-400">Пароль успешно изменён.</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-gold self-start rounded-lg px-5 py-2.5 text-sm disabled:opacity-60"
        >
          {busy ? 'Сохранение…' : 'Сменить пароль'}
        </button>
      </form>
    </div>
  );
}
