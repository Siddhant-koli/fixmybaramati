'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminStatusBadge from '@/app/admin/AdminStatusBadge';
import { formatLocaleDate, translateCategory, useTranslation } from '@/lib/i18n';

type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
type DashboardData = {
  stats: {
    total: number;
    byStatus: Record<ReportStatus, number>;
    byCategory: { category: string; count: number }[];
  };
  recentReports: {
    id: string;
    title: string;
    category: string;
    status: ReportStatus;
    location: string | null;
    createdAt: string;
    reporter: { fullName: string } | null;
  }[];
};

export default function AdminDashboard() {
  const { language, t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch('/api/admin/dashboard', { signal: controller.signal });
        const payload = (await response.json()) as {
          success?: boolean;
          stats?: DashboardData['stats'];
          recentReports?: DashboardData['recentReports'];
        };
        if (!response.ok || !payload.success || !payload.stats || !payload.recentReports) {
          throw new Error();
        }
        setData({ stats: payload.stats, recentReports: payload.recentReports });
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [retryKey]);

  const metrics = data
    ? [
        { label: t('admin.totalReports'), value: data.stats.total, color: 'border-gray-300' },
        { label: t('admin.pendingReports'), value: data.stats.byStatus.PENDING, color: 'border-yellow-400' },
        { label: t('admin.inProgressReports'), value: data.stats.byStatus.IN_PROGRESS, color: 'border-blue-500' },
        { label: t('admin.resolvedReports'), value: data.stats.byStatus.RESOLVED, color: 'border-green-500' },
        { label: t('admin.rejectedReports'), value: data.stats.byStatus.REJECTED, color: 'border-red-500' },
      ]
    : [];
  const maxCategoryCount = Math.max(1, ...(data?.stats.byCategory.map((item) => item.count) ?? []));

  return (
    <>
      <header className="mb-8 border-b border-gray-200 pb-6">
        <p className="mb-2 text-xs font-bold uppercase text-blue-800">FixMyBaramati</p>
        <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">{t('admin.overviewTitle')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">{t('admin.overviewDescription')}</p>
      </header>

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-gray-600">{t('reports.loadingReports')}</p>
      ) : error ? (
        <div role="alert" className="border-l-4 border-red-600 bg-white p-5">
          <p className="font-semibold text-red-800">{t('admin.dashboardError')}</p>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="mt-3 min-h-10 rounded-md border border-gray-300 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {t('reports.retry')}
          </button>
        </div>
      ) : data ? (
        <>
          <section aria-label={t('dashboard.statistics')} className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {metrics.map((metric) => (
              <div key={metric.label} className={`border-l-4 ${metric.color} bg-white px-4 py-4 shadow-sm`}>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950">{metric.value}</p>
              </div>
            ))}
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <section aria-labelledby="recent-submissions-heading" className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <h2 id="recent-submissions-heading" className="text-lg font-bold text-gray-900">
                  {t('admin.recentSubmissions')}
                </h2>
                <Link href="/admin/reports" className="text-sm font-semibold text-blue-800 hover:underline">
                  {t('admin.viewAllReports')}
                </Link>
              </div>
              {data.recentReports.length ? (
                <div className="divide-y divide-gray-200 bg-white">
                  {data.recentReports.map((report) => (
                    <Link
                      key={report.id}
                      href={`/admin/reports/${report.id}`}
                      className="flex flex-col gap-3 px-4 py-4 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{report.title}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {translateCategory(report.category, t)} · {formatLocaleDate(report.createdAt, language)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {report.reporter?.fullName ?? t('admin.unknownReporter')}
                          {report.location ? ` · ${report.location}` : ''}
                        </p>
                      </div>
                      <AdminStatusBadge status={report.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="bg-white px-4 py-8 text-sm text-gray-600">{t('admin.noCategoryReports')}</p>
              )}
            </section>

            <section aria-labelledby="category-counts-heading">
              <h2 id="category-counts-heading" className="mb-3 border-b border-gray-200 pb-3 text-lg font-bold text-gray-900">
                {t('admin.reportsByCategory')}
              </h2>
              {data.stats.byCategory.length ? (
                <ul className="divide-y divide-gray-200 bg-white px-4">
                  {data.stats.byCategory.map(({ category, count }) => (
                    <li key={category} className="py-4">
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-gray-800">{translateCategory(category, t)}</span>
                        <span className="tabular-nums text-gray-600">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-700"
                          style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="bg-white px-4 py-8 text-sm text-gray-600">{t('admin.noCategoryReports')}</p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}