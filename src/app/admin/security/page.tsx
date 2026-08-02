import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AdminShell } from '@/components/admin/AdminShell';
import { Security2FA } from '@/components/admin/Security2FA';
import { ChangePassword } from '@/components/admin/ChangePassword';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const user = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { totpEnabled: true },
  });

  return (
    <AdminShell email={session.email} active="security">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <ChangePassword />
        <Security2FA enabled={user?.totpEnabled ?? false} />
      </div>
    </AdminShell>
  );
}
