import type { ReactNode } from 'react';

import AdminShell from '@/app/admin/AdminShell';
import { requireAdminPage } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminPage();
  return (
    <AdminShell fullName={user.fullName} mobile={user.mobile}>
      {children}
    </AdminShell>
  );
}