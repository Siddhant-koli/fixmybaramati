import { redirect } from 'next/navigation';

import Navbar from '@/components/Navbar';
import {
  LocalizedDate,
  TranslatedStatus,
  TranslatedText,
  type TranslationKey,
} from '@/lib/i18n';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type RecentReport = Pick<
  Awaited<ReturnType<typeof prisma.report.findMany>>[number],
  'id' | 'title' | 'status' | 'createdAt'
>;

export default async function DashboardPage() {
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Unable to verify the dashboard session:', error);
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

  const dashboardData = await Promise.all([
      prisma.report.count({ where: { reporterId: user.id } }),
      prisma.report.count({ where: { reporterId: user.id, status: 'RESOLVED' } }),
      prisma.report.count({ where: { reporterId: user.id, status: 'IN_PROGRESS' } }),
      prisma.report.aggregate({
        where: { reporterId: user.id },
        _sum: { upvotes: true },
      }),
      prisma.report.findMany({
        where: { reporterId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, status: true, createdAt: true },
      }),
    ]).catch((error: unknown) => {
      console.error('Unable to load dashboard reports:', error);
      return null;
    });

  if (!dashboardData) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 px-4 py-12">
          <p role="alert" className="mx-auto max-w-6xl text-red-700">
            <TranslatedText k="dashboard.loadError" />
          </p>
        </main>
      </>
    );
  }

  const [reportsSubmitted, reportsResolved, reportsInProgress, upvotes, recentReports] =
    dashboardData;

  const stats: { title: TranslationKey; value: number; icon: string; color: string }[] = [
    {
      title: 'dashboard.reportsSubmitted',
      value: reportsSubmitted,
      icon: '📋',
      color: 'text-blue-600',
    },
    {
      title: 'dashboard.reportsResolved',
      value: reportsResolved,
      icon: '✅',
      color: 'text-green-600',
    },
    {
      title: 'dashboard.inProgress',
      value: reportsInProgress,
      icon: '⏳',
      color: 'text-orange-600',
    },
    {
      title: 'dashboard.communityUpvotes',
      value: upvotes._sum.upvotes ?? 0,
      icon: '👍',
      color: 'text-purple-600',
    },
  ];

  const actions: {
    title: TranslationKey;
    description: TranslationKey;
    href: string;
    icon: string;
    primary: boolean;
  }[] = [
    {
      title: 'dashboard.newReport',
      description: 'dashboard.newReportDescription',
      href: '/report',
      icon: '🔴',
      primary: true,
    },
    {
      title: 'dashboard.myReports',
      description: 'dashboard.myReportsDescription',
      href: '/my-reports',
      icon: '📑',
      primary: false,
    },
    {
      title: 'dashboard.browseReports',
      description: 'dashboard.browseReportsDescription',
      href: '/reports',
      icon: '🔍',
      primary: false,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <TranslatedText k="dashboard.title" />
            </h1>
            <p className="text-blue-100 text-lg">
              <TranslatedText k="dashboard.description" />
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Welcome Section */}
          <div className="mb-8">
            <p className="text-gray-700 text-lg">
              <TranslatedText k="dashboard.welcome" values={{ name: user.fullName }} />
            </p>
          </div>

          {/* Quick Actions Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <TranslatedText k="dashboard.quickActions" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className={`rounded-lg p-6 shadow-md hover:shadow-lg transition ${
                    action.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">
                    <TranslatedText k={action.title} />
                  </h3>
                  <p
                    className={`text-sm ${
                      action.primary ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    <TranslatedText k={action.description} />
                  </p>
                </a>
              ))}
            </div>
          </section>

          {/* Statistics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <TranslatedText k="dashboard.statistics" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition"
                >
                  <div className={`text-4xl mb-3 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">
                    <TranslatedText k={stat.title} />
                  </h3>
                  <p className="text-4xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Reports Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <TranslatedText k="dashboard.recentReports" />
            </h2>
            {recentReports.length ? (
              <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                {recentReports.map((report: RecentReport) => (
                  <a
                    key={report.id}
                    href={`/report/${report.id}`}
                    className="flex flex-col gap-2 p-5 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-semibold text-gray-900">{report.title}</span>
                    <span className="text-sm text-gray-600">
                      <TranslatedStatus status={report.status} /> · <LocalizedDate date={report.createdAt} />
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <TranslatedText k="dashboard.noReports" />
                </h3>
                <p className="text-gray-600 mb-6">
                  <TranslatedText k="dashboard.noReportsDescription" />
                </p>
                <a
                  href="/report"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  <TranslatedText k="dashboard.newReport" />
                </a>
              </div>
            )}
          </section>

          {/* Help & Resources Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <TranslatedText k="dashboard.helpResources" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="#"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  📖 <TranslatedText k="dashboard.howToReport" />
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatedText k="dashboard.howToReportDescription" />
                </p>
              </a>
              <a
                href="#"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  ❓ <TranslatedText k="home.faq" />
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatedText k="dashboard.faqDescription" />
                </p>
              </a>
              <a
                href="#"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  📞 <TranslatedText k="dashboard.contactSupport" />
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatedText k="dashboard.contactSupportDescription" />
                </p>
              </a>
              <a
                href="/"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  🏠 <TranslatedText k="common.backHome" />
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatedText k="dashboard.backHomeDescription" />
                </p>
              </a>
            </div>
          </section>

          {/* Information Banner */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 md:p-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ℹ️ <TranslatedText k="dashboard.aboutTitle" />
            </h3>
            <p className="text-blue-800">
              <TranslatedText k="dashboard.aboutDescription" />
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
