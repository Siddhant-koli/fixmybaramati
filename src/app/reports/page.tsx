import { Suspense } from 'react';

import Navbar from '@/components/Navbar';
import ReportsClient from '@/app/reports/ReportsClient';
import { TranslatedText } from '@/lib/i18n';

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="min-h-screen bg-gray-50 px-4 py-12">
            <p className="mx-auto max-w-6xl text-center text-gray-600">
              <TranslatedText k="reports.loadingReports" />
            </p>
          </main>
        </>
      }
    >
      <ReportsClient />
    </Suspense>
  );
}
