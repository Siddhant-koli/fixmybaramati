'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Navbar from '@/components/Navbar';
import ReportVoteButton from '@/components/ReportVoteButton';
import {
  formatLocaleDate,
  translateCategory,
  translateStatus,
  useTranslation,
} from '@/lib/i18n';
import { REPORT_CATEGORIES } from '@/lib/report-categories';

type ReportRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  location: string | null;
  photoUrl: string | null;
  upvotes: number;
  hasVoted: boolean;
  createdAt: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ReportsResponse = {
  success?: boolean;
  reports?: ReportRow[];
  pagination?: Pagination;
  isAuthenticated?: boolean;
};

const statusFilters = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const;

const getCategoryIcon = (category: string): string =>
  REPORT_CATEGORIES.find((item) => item.value === category)?.icon ?? '📍';

const getStatusBadgeColor = (status: ReportRow['status']): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'RESOLVED':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};

export default function ReportsPage() {
  const { language, t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const searchFromUrl = searchParams.get('search') ?? '';
  const searchParamsRef = useRef(queryString);

  const [reportsList, setReportsList] = useState<ReportRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    searchParamsRef.current = queryString;
  }, [queryString]);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current);
      const normalizedSearch = searchInput.trim();
      if ((params.get('search') ?? '') === normalizedSearch) return;

      if (normalizedSearch) params.set('search', normalizedSearch);
      else params.delete('search');
      params.delete('page');

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          queryString ? `/api/reports?${queryString}` : '/api/reports',
          { signal: controller.signal }
        );
        const data = (await response.json()) as ReportsResponse;

        if (!response.ok || !data.success || !data.pagination || !data.reports) {
          throw new Error();
        }

        const params = new URLSearchParams(queryString);
        const requestedPage = Number(params.get('page') ?? '1');
        if (data.pagination.page !== requestedPage) {
          if (data.pagination.page > 1) {
            params.set('page', String(data.pagination.page));
          } else {
            params.delete('page');
          }
          const query = params.toString();
          router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
          return;
        }

        setReportsList(data.reports);
        setPagination(data.pagination);
        setIsAuthenticated(Boolean(data.isAuthenticated));
      } catch {
        if (!controller.signal.aborted) setError('load');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadReports();
    return () => controller.abort();
  }, [pathname, queryString, retryKey, router]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(queryString);
    if (value && !(key === 'sort' && value === 'newest')) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push(pathname, { scroll: false });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(queryString);
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const currentPage = pagination?.page ?? Number(searchParams.get('page') ?? '1');
  const hasActiveFilters = Boolean(queryString || searchInput);

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('reports.title')}</h1>
            <p className="text-blue-100 text-lg">
              {t('reports.description')}
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <section
            aria-label={t('reports.filters')}
            className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t('reports.filters')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-4">
                <label
                  htmlFor="report-search"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('reports.searchReports')}
                </label>
                <input
                  id="report-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t('reports.searchPlaceholder')}
                  maxLength={200}
                  className="min-h-11 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="report-category"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('reports.category')}
                </label>
                <select
                  id="report-category"
                  value={searchParams.get('category') ?? ''}
                  onChange={(event) => updateQuery('category', event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('reports.allCategories')}</option>
                  {REPORT_CATEGORIES.map(({ value }) => (
                    <option key={value} value={value}>
                      {translateCategory(value, t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="report-status"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('reports.status')}
                </label>
                <select
                  id="report-status"
                  value={searchParams.get('status') ?? ''}
                  onChange={(event) => updateQuery('status', event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('reports.allStatuses')}</option>
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {translateStatus(status, t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="report-sort"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('reports.sort')}
                </label>
                <select
                  id="report-sort"
                  value={searchParams.get('sort') ?? 'newest'}
                  onChange={(event) => updateQuery('sort', event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">{t('reports.newest')}</option>
                  <option value="oldest">{t('reports.oldest')}</option>
                  <option value="most_upvoted">{t('reports.mostUpvoted')}</option>
                  <option value="recently_updated">{t('reports.recentlyUpdated')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters && !searchInput}
                  className="min-h-11 w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('reports.clearFilters')}
                </button>
              </div>
            </div>
          </section>

          <section className="mb-6">
            {!loading && !error && pagination && (
              <p className="font-medium text-gray-600">
                {t('reports.showing', {
                  shown: reportsList.length,
                  total: pagination.total,
                })}
              </p>
            )}
          </section>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600">{t('reports.loadingReports')}</p>
            </div>
          ) : error ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
              <h3 className="mb-2 text-lg font-semibold">{t('reports.loadErrorTitle')}</h3>
              <p>{t('reports.unableToLoad')}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRetryKey((current) => current + 1)}
                  className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  {t('reports.retry')}
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {t('reports.clearFilters')}
                  </button>
                )}
              </div>
            </div>
          ) : reportsList.length > 0 ? (
            <section>
              <div className="grid grid-cols-1 gap-6">
                {reportsList.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition border border-gray-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-4xl">{getCategoryIcon(report.category)}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {report.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                                {translateCategory(report.category, t)}
                              </span>
                              <span
                                className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadgeColor(
                                  report.status
                                )}`}
                              >
                                {translateStatus(report.status, t)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!!report.photoUrl && (
                        <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                          <img
                            src={report.photoUrl}
                            alt={t('reports.photoAlt', { title: report.title })}
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                            className="h-48 w-full object-cover"
                          />
                        </div>
                      )}

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{report.location || t('common.locationUnknown')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{formatLocaleDate(report.createdAt, language)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <ReportVoteButton
                          reportId={report.id}
                          initialUpvotes={report.upvotes}
                          initialHasVoted={report.hasVoted}
                          isAuthenticated={isAuthenticated}
                          compact
                        />
                        <a
                          href={`/report/${report.id}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
                        >
                          {t('reports.viewDetails')}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="rounded-lg bg-white p-12 text-center shadow-md">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {t('reports.noReportsFound')}
              </h3>
              {hasActiveFilters && (
                <>
                  <p className="mb-6 text-gray-600">{t('reports.noFilterMatches')}</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-11 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    {t('reports.clearFilters')}
                  </button>
                </>
              )}
            </div>
          )}

          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <nav
              aria-label={t('reports.pagination')}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('reports.previous')}
              </button>
              <span className="text-sm text-gray-700">
                {t('reports.page')} {pagination.page} {t('reports.of')} {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('reports.next')}
              </button>
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
