import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { TranslatedText } from '@/lib/i18n';
import ReportForm from './ReportForm';

export const dynamic = 'force-dynamic';

export default async function ReportPage() {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Unable to verify report-form session:', error);
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <p role="alert" className="mx-auto max-w-2xl text-red-700">
          <TranslatedText k="dashboard.sessionError" />
        </p>
      </main>
    );
  }
  if (!user) redirect('/login');

  return <ReportForm />;
}
