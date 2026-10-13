'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminStatusBadge from '@/app/admin/AdminStatusBadge';
import {
  formatLocaleDate,
  translateCategory,
  translateStatus,
  useTranslation,
} from '@/lib/i18n';
import { REPORT_CATEGORIES } from '@/lib/report-categories';

type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
type AdminReport = {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  location: string | null;
  createdAt: string;
  reporter: { id: string; fullName: string; mobile: string } | null;
};
type Pagination = { page: number; total: number; totalPages: number };

const statuses: ReportStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function AdminReports() {
  const { language, t } = useTranslation();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      if (sort !== 'newest') params.set('sort', sort);
      if (page > 1) params.set('page', String(page));

      const load = async () => {
        setLoading(true);
        setError(false);
        try {
          const query = params.toString();
          const response = await fetch(
            query ? `/api/admin/reports?${query}` : '/api/admin/reports',
            { signal: controller.signal }
          );
          const payload = (await response.json()) as {
            success?: boolean;
            reports?: AdminReport[];
            pagination?: Pagination;
          };
          if (!response.ok || !payload.success || !payload.reports || !payload.pagination) {
            throw new Error();
          }
          setReports(payload.reports);
          setPagination(payload.pagination);
          if (payload.pagination.page !== page) setPage(payload.pagination.page);
        } catch {
          if (!controller.signal.aborted) setError(true);
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      };
      void load();
    }, 200);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [category, page, retryKey, search, sort, status, t]);

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setSort('newest');
    setPage(1);
  };

  return (
    <>
      <header className="mb-6 border-b border-gray-200 pb-6">
        <p className="mb-2 text-xs font-bold uppercase text-blue-800">{t('admin.portal')}</p>
        <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">{t('admin.reports')}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('reports.description')}</p>
      </header>

      <section aria-label={t('reports.filters')} className="mb-5 border-y border-gray-200 bg-white px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="admin-search" className="mb-1 block text-sm font-medium text-gray-700">
              {t('reports.searchReports')}
            </label>
            <input
              id="admin-search"
              type="search"
              value={search}
              maxLength={200}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t('reports.searchPlaceholder')}
              className="min-h-11 w-full rounded-md border border-gray-300 px-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="admin-category" className="mb-1 block text-sm font-medium text-gray-700">
              {t('reports.category')}
            </label>
            <select
              id="admin-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">{t('reports.allCategories')}</option>
              {REPORT_CATEGORIES.map(({ value }) => (
                <option key={value} value={value}>{translateCategory(value, t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-status" className="mb-1 block text-sm font-medium text-gray-700">
              {t('reports.status')}
            </label>
            <select
              id="admin-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">{t('reports.allStatuses')}</option>
              {statuses.map((value) => (
                <option key={value} value={value}>{translateStatus(value, t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-sort" className="mb-1 block text-sm font-medium text-gray-700">
              {t('reports.sort')}
            </label>
            <select
              id="admin-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as 'newest' | 'oldest');
                setPage(1);
              }}
              className="min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="newest">{t('reports.newest')}</option>
              <option value="oldest">{t('reports.oldest')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-11 rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t('reports.clearFilters')}
            </button>
          </div>
        </div>
      </section>

      {pagination && !loading && !error && (
        <p className="mb-3 text-sm text-gray-600" aria-live="polite">
          {t('reports.showing', { shown: reports.length, total: pagination.total })}
        </p>
      )}

      {loading ? (
        <p role="status" className="bg-white px-4 py-12 text-center text-sm text-gray-600">
          {t('reports.loadingReports')}
        </p>
      ) : error ? (
        <div role="alert" className="border-l-4 border-red-600 bg-white p-5">
          <p className="font-semibold text-red-800">{t('reports.loadErrorTitle')}</p>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="mt-3 min-h-10 rounded-md border border-gray-300 px-3 text-sm font-semibold hover:bg-gray-50"
          >
            {t('reports.retry')}
          </button>
        </div>
      ) : reports.length ? (
        <>
          <div className="overflow-x-auto border-y border-gray-200 bg-white">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3">{t('common.description')}</th>
                  <th scope="col" className="px-4 py-3">{t('reports.category')}</th>
                  <th scope="col" className="px-4 py-3">{t('reports.status')}</th>
                  <th scope="col" className="px-4 py-3">{t('common.dateReported')}</th>
                  <th scope="col" className="px-4 py-3">{t('common.locationUnknown')}</th>
                  <th scope="col" className="px-4 py-3">{t('admin.reporter')}</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">{t('reports.viewDetails')}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="align-top hover:bg-blue-50/30">
                    <td className="max-w-sm px-4 py-4">
                      <Link href={`/admin/reports/${report.id}`} className="font-semibold text-blue-900 hover:underline">
                        {report.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{translateCategory(report.category, t)}</td>
                    <td className="px-4 py-4"><AdminStatusBadge status={report.status} /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-700">{formatLocaleDate(report.createdAt, language)}</td>
                    <td className="max-w-[180px] px-4 py-4 text-gray-700">{report.location || t('common.locationUnknown')}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {report.reporter ? (
                        <span className="block">
                          <span className="block font-medium">{report.reporter.fullName}</span>
                          <span className="mt-1 block text-xs text-gray-500">{report.reporter.mobile}</span>
                        </span>
                      ) : t('admin.unknownReporter')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Link href={`/admin/reports/${report.id}`} className="font-semibold text-blue-800 hover:underline">
                        {t('reports.viewDetails')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <nav aria-label={t('reports.pagination')} className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="min-h-10 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold disabled:opacity-50"
              >
                {t('reports.previous')}
              </button>
              <span className="text-sm text-gray-700">
                {t('reports.page')} {pagination.page} {t('reports.of')} {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={page >= pagination.totalPages}
                className="min-h-10 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold disabled:opacity-50"
              >
                {t('reports.next')}
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="bg-white px-4 py-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">{t('reports.noReportsFound')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('reports.noFilterMatches')}</p>
          <button type="button" onClick={resetFilters} className="mt-4 font-semibold text-blue-800 hover:underline">
            {t('reports.clearFilters')}
          </button>
        </div>
      )}
    </>
  );
}