'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/menu/Logo';
import { api } from '@/lib/admin-client';

export function AdminShell({
  email,
  active,
  children,
}: {
  email: string;
  active: 'menu' | 'security';
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-gold/10 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Logo subtitle={false} className="scale-90" />
            <nav className="hidden gap-1 sm:flex">
              <Link
                href="/admin"
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active === 'menu'
                    ? 'bg-gold/15 text-gold'
                    : 'text-sand-muted hover:text-sand'
                }`}
              >
                Меню
              </Link>
              <Link
                href="/admin/security"
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active === 'security'
                    ? 'bg-gold/15 text-gold'
                    : 'text-sand-muted hover:text-sand'
                }`}
              >
                Безопасность
              </Link>
              <Link
                href="/"
                target="_blank"
                className="rounded-full px-3.5 py-1.5 text-sm text-sand-muted hover:text-sand"
              >
                Открыть сайт ↗
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-sand-muted sm:inline">
              {email}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold/10"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
