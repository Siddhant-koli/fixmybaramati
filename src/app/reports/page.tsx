'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import {
  formatLocaleDate,
  translateCategory,
  translateStatus,
  useTranslation,
} from '@/lib/i18n';

type ReportRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  location: string | null;
  photoUrl: string | null;
  upvotes: number;
  createdAt: string;
};

const statusFilters = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const;

const getCategoryIcon = (category: string): string => {
  const map: Record<string, string> = {
    Potholes: '🕳️',
    Garbage: '🗑️',
    'Street Lights': '💡',
    Water: '💧',
    Drainage: '🌊',
    Roads: '🛣️',
    Other: '📌',
  };
  return map[category] ?? '📍';
};

const getStatusBadgeColor = (status: string): string => {
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
  const [reportsList, setReportsList] = useState<ReportRow[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<(typeof statusFilters)[number]>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/reports');
        const data = (await response.json()) as {
          success?: boolean;
          message?: string;
          reports?: ReportRow[];
        };

        if (!response.ok || !data.success) {
          throw new Error(data.message || t('reports.loadError'));
        }

        setReportsList(data.reports ?? []);
      } catch {
        setError(t('reports.loadListError'));
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, [t]);

  const filteredReports = useMemo(() => {
    if (selectedFilter === 'ALL') return reportsList;
    return reportsList.filter((report) => report.status === selectedFilter);
  }, [reportsList, selectedFilter]);

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
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.filterStatus')}</h2>
            <div className="flex flex-wrap gap-3">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedFilter === filter
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter === 'ALL' ? t('reports.all') : translateStatus(filter, t)}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6">
            {!loading && !error && (
              <p className="text-gray-600 font-medium">
                {t('reports.showing', { shown: filteredReports.length, total: reportsList.length })}
              </p>
            )}
          </section>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600">{t('reports.loading')}</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
              <h3 className="text-lg font-semibold mb-2">{t('reports.loadErrorTitle')}</h3>
              <p>{error}</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {filteredReports.map((report) => (
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

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition font-medium flex items-center gap-1"
                          >
                            👍 {report.upvotes}
                          </button>
                        </div>
                        <a
                          href={`/report/${report.id}`}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
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
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('reports.noReports')}</h3>
              <p className="text-gray-600 mb-6">
                {t('reports.noMatches')}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
