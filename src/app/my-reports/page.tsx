import { redirect } from 'next/navigation';

import Navbar from '@/components/Navbar';
import {
  LocalizedDate,
  TranslatedCategory,
  TranslatedStatus,
  TranslatedText,
} from '@/lib/i18n';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type UserReport = Pick<
  Awaited<ReturnType<typeof prisma.report.findMany>>[number],
  'id' | 'title' | 'category' | 'status' | 'createdAt' | 'location' | 'photoUrl' | 'upvotes'
>;

const statusClass = (status: string) => {
  switch (status) {
    case 'RESOLVED':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
  }
};

export default async function MyReportsPage() {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Unable to verify the My Reports session:', error);
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 px-4 py-12">
          <p role="alert" className="mx-auto max-w-6xl text-red-700">
            <TranslatedText k="dashboard.sessionError" />
          </p>
        </main>
      </>
    );
  }
  if (!user) redirect('/login');

  let reports: UserReport[] = [];
  let loadError = false;
  try {
    reports = await prisma.report.findMany({
      where: { reporterId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
        location: true,
        photoUrl: true,
        upvotes: true,
      },
    });
  } catch (error) {
    console.error('Unable to load the user reports:', error);
    reports = [];
    loadError = true;
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-8 text-white md:py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl"><TranslatedText k="myReports.title" /></h1>
            <p className="text-lg text-blue-100">
              <TranslatedText k="myReports.submittedBy" values={{ name: user.fullName }} />
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          {loadError ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
              <TranslatedText k="myReports.loadError" />
            </div>
          ) : reports.length ? (
            <div className="space-y-6">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-lg border border-gray-200 bg-white shadow-md transition hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">
                          {report.title}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800">
                            <TranslatedCategory category={report.category} />
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(report.status)}`}>
                            <TranslatedStatus status={report.status} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {report.photoUrl && (
                      <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <img
                          src={report.photoUrl}
                          alt={report.title}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="mb-4 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:gap-6">
                      <span>📍 {report.location || <TranslatedText k="common.locationUnknown" />}</span>
                      <span>📅 <LocalizedDate date={report.createdAt} /></span>
                      <span>👍 <TranslatedText k="myReports.upvotesCount" values={{ count: report.upvotes }} /></span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 text-right">
                      <a
                        href={`/report/${report.id}`}
                        className="font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        <TranslatedText k="myReports.viewReport" /> →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-12 text-center shadow-md">
              <div className="mb-4 text-5xl">📭</div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900"><TranslatedText k="myReports.noReports" /></h2>
              <p className="mb-6 text-gray-600"><TranslatedText k="myReports.emptyDescription" /></p>
              <a
                href="/report"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                <TranslatedText k="dashboard.newReport" />
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
