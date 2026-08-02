import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAdminCategories, getAdminProducts } from '@/lib/menu';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const [categories, products] = await Promise.all([
    getAdminCategories(),
    getAdminProducts(),
  ]);

  return (
    <AdminShell email={session.email} active="menu">
      <AdminDashboard
        initialCategories={categories}
        initialProducts={products}
      />
    </AdminShell>
  );
}
