'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/admin-client';

export function Security2FA({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [qr, setQr] = useState<string | null>(null);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function startSetup() {
    setBusy(true);
    setError('');
    try {
      const data = await api<{ qrDataUrl: string; otpauth: string }>(
        '/api/admin/2fa',
        { method: 'POST' },
      );
      setQr(data.qrDataUrl);
      setOtpauth(data.otpauth);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/2fa', {
        method: 'PUT',
        body: JSON.stringify({ token }),
      });
      setQr(null);
      setOtpauth(null);
      setToken('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неверный код');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!window.confirm('Отключить двухфакторную аутентификацию?')) return;
    setBusy(true);
    try {
      await api('/api/admin/2fa', { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 font-display text-2xl text-sand">Безопасность</h1>
      <p className="mb-6 text-sm text-sand-muted">
        Двухфакторная аутентификация (TOTP) через приложение — Google
        Authenticator, 1Password, Authy и др.
      </p>

      <div className="card-surface rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-medium text-sand">
            Статус:{' '}
            {enabled ? (
              <span className="text-emerald-400">включена</span>
            ) : (
              <span className="text-sand-muted">выключена</span>
            )}
          </span>
        </div>

        {enabled ? (
          <button
            onClick={disable}
            disabled={busy}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            Отключить 2FA
          </button>
        ) : qr ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-sand-muted">
              Отсканируйте QR-код в приложении и введите 6-значный код.
            </p>
            <div className="overflow-hidden rounded-xl border border-gold/20 bg-sand p-2">
              <Image src={qr} alt="TOTP QR" width={200} height={200} unoptimized />
            </div>
            {otpauth && (
              <code className="break-all rounded bg-ink-900 px-2 py-1 text-[10px] text-sand-muted">
                {otpauth}
              </code>
            )}
            <input
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              inputMode="numeric"
              placeholder="000000"
              className="input w-40 text-center text-lg tracking-[0.4em]"
            />
            <button
              onClick={confirm}
              disabled={busy || token.length < 6}
              className="btn-gold rounded-lg px-6 py-2.5 text-sm disabled:opacity-60"
            >
              Подтвердить и включить
            </button>
          </div>
        ) : (
          <button
            onClick={startSetup}
            disabled={busy}
            className="btn-gold rounded-lg px-4 py-2.5 text-sm disabled:opacity-60"
          >
            {busy ? 'Подождите…' : 'Настроить 2FA'}
          </button>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
