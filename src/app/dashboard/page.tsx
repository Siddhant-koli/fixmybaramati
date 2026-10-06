import { redirect } from 'next/navigation';

import Navbar from '@/components/Navbar';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

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
            Unable to verify your session right now. Please try again later.
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
            Unable to load your dashboard right now. Please try again later.
          </p>
        </main>
      </>
    );
  }

  const [reportsSubmitted, reportsResolved, reportsInProgress, upvotes, recentReports] =
    dashboardData;

  const stats = [
    {
      title: 'Reports Submitted',
      value: reportsSubmitted,
      icon: '📋',
      color: 'text-blue-600',
    },
    {
      title: 'Reports Resolved',
      value: reportsResolved,
      icon: '✅',
      color: 'text-green-600',
    },
    {
      title: 'In Progress',
      value: reportsInProgress,
      icon: '⏳',
      color: 'text-orange-600',
    },
    {
      title: 'Community Upvotes',
      value: upvotes._sum.upvotes ?? 0,
      icon: '👍',
      color: 'text-purple-600',
    },
  ];

  const actions = [
    {
      title: 'Report an Issue',
      description: 'Submit a new civic issue in your area',
      href: '/report',
      icon: '🔴',
      primary: true,
    },
    {
      title: 'My Reports',
      description: 'View and track your submitted reports',
      href: '/my-reports',
      icon: '📑',
      primary: false,
    },
    {
      title: 'Browse Reports',
      description: 'See all civic issues in Baramati',
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
              Citizen Dashboard
            </h1>
            <p className="text-blue-100 text-lg">
              Track your civic reports and help make Baramati better.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Welcome Section */}
          <div className="mb-8">
            <p className="text-gray-700 text-lg">
              Welcome, {user.fullName}! Here's an overview of your civic contributions.
            </p>
          </div>

          {/* Quick Actions Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Actions
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
                  <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                  <p
                    className={`text-sm ${
                      action.primary ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    {action.description}
                  </p>
                </a>
              ))}
            </div>
          </section>

          {/* Statistics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Statistics
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
                    {stat.title}
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
              Recent Reports
            </h2>
            {recentReports.length ? (
              <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <a
                    key={report.id}
                    href={`/report/${report.id}`}
                    className="flex flex-col gap-2 p-5 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-semibold text-gray-900">{report.title}</span>
                    <span className="text-sm text-gray-600">
                      {report.status.replace('_', ' ')} · {report.createdAt.toLocaleDateString('en-IN')}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No reports yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by reporting a civic issue in your area to see your submissions here.
                </p>
                <a
                  href="/report"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Report an Issue
                </a>
              </div>
            )}
          </section>

          {/* Help & Resources Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Help & Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="#"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  📖 How to Report
                </h3>
                <p className="text-sm text-gray-600">
                  Learn how to submit a civic issue effectively
                </p>
              </a>
              <a
                href="#"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  ❓ FAQ
                </h3>
                <p className="text-sm text-gray-600">
                  Find answers to common questions
                </p>
              </a>
              <a
                href="#"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  📞 Contact Support
                </h3>
                <p className="text-sm text-gray-600">
                  Get help from our support team
                </p>
              </a>
              <a
                href="/"
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition hover:border-blue-600 border border-transparent"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  🏠 Back to Home
                </h3>
                <p className="text-sm text-gray-600">
                  Return to the homepage
                </p>
              </a>
            </div>
          </section>

          {/* Information Banner */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 md:p-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ℹ️ About Your Dashboard
            </h3>
            <p className="text-blue-800">
              This dashboard shows your submitted reports and community impact.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
