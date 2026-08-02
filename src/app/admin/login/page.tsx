'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/menu/Logo';
import { api } from '@/lib/admin-client';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          token: token || undefined,
        }),
      });
      router.replace(from);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа';
      if (msg === 'TOTP_REQUIRED') {
        setNeedsTotp(true);
        setError('Введите код из приложения-аутентификатора');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="card-surface w-full max-w-sm rounded-2xl p-8 shadow-card"
      >
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-6 text-center font-display text-xl text-sand">
          Вход в админ-панель
        </h1>

        <label className="mb-1 block text-xs text-sand-muted">Email</label>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gold/20 bg-ink-800 px-3 py-2.5 text-sm text-sand outline-none focus:border-gold/60"
        />

        <label className="mb-1 block text-xs text-sand-muted">Пароль</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gold/20 bg-ink-800 px-3 py-2.5 text-sm text-sand outline-none focus:border-gold/60"
        />

        {needsTotp && (
          <>
            <label className="mb-1 block text-xs text-sand-muted">
              Код 2FA
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="mb-4 w-full rounded-lg border border-gold/20 bg-ink-800 px-3 py-2.5 text-center text-lg tracking-[0.4em] text-sand outline-none focus:border-gold/60"
            />
          </>
        )}

        {error && (
          <p className="mb-4 text-center text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full rounded-lg py-3 text-sm disabled:opacity-60"
        >
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
