import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админ-панель',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-ink text-sand">{children}</div>;
}
