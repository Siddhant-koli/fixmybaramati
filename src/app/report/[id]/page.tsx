'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  formatLocaleDate,
  translateCategory,
  translateStatus,
  useTranslation,
} from '@/lib/i18n';

type ReportDetails = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  upvotes: number;
  createdAt: string;
  photoUrl: string | null;
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

const getStatusProgress = (status: string): number => {
  switch (status) {
    case 'PENDING':
      return 25;
    case 'IN_PROGRESS':
      return 50;
    case 'RESOLVED':
      return 100;
    case 'REJECTED':
      return 0;
    default:
      return 0;
  }
};

export default function ReportDetailsPage() {
  const { language, t } = useTranslation();
  const params = useParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId || '';

  const [report, setReport] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/reports/${id}`);
        const data = (await response.json()) as {
          success?: boolean;
          message?: string;
          report?: ReportDetails;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.message || t('detail.loadError'));
        }

        const nextReport = data.report ?? null;
        setReport(nextReport);
        setImageError(false);
        setUpvoteCount(nextReport?.upvotes ?? 0);
      } catch {
        setError(t('detail.loadError'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadReport();
    }
  }, [id, t]);

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvoteCount((current) => current + 1);
      setHasUpvoted(true);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600">{t('detail.loading')}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !report) {
    return (
      <>
        <Navbar />
        <main className="bg-gray-50 min-h-screen">
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('detail.notFound')}</h1>
              <p className="text-blue-100 text-lg">{t('detail.notFoundDescription')}</p>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('detail.notFound')}</h2>
              <p className="text-gray-600 mb-8">
                {error ? t('detail.loadError') : t('detail.notFoundHelp')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/reports"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {t('detail.backReports')}
                </a>
                <a
                  href="/report"
                  className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  {t('detail.similarReport')}
                </a>
                <a
                  href="/dashboard"
                  className="border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  {t('detail.backDashboard')}
                </a>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const reportStatus = report.status;
  const displayedStatus = translateStatus(reportStatus, t);
  const reportNumber = report.id.slice(0, 8).toUpperCase();

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('detail.title')}</h1>
                <p className="text-blue-100 text-lg">{t('common.reportId')}: {reportNumber}</p>
              </div>
              <span
                className={`text-sm font-semibold px-4 py-2 rounded-lg w-fit h-fit ${getStatusBadgeColor(reportStatus)}`}
              >
                {displayedStatus}
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{report.title}</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">{t('common.category')}</h3>
                    <p className="text-lg text-gray-900">{translateCategory(report.category, t)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">{t('common.description')}</h3>
                    <p className="text-gray-700 leading-relaxed">{report.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">{t('common.dateReported')}</h3>
                      <p className="text-gray-900">📅 {formatLocaleDate(report.createdAt, language)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">{t('common.currentStatus')}</h3>
                      <div className="inline-block">
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusBadgeColor(reportStatus)}`}
                        >
                          {displayedStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📍 {t('detail.locationInformation')}</h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">{t('detail.address')}</h4>
                    <p className="text-gray-900">{report.location || t('common.locationUnknown')}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">{t('report.latitude')}</h4>
                      <p className="text-gray-900 font-mono text-sm">
                        {report.latitude ?? t('common.notAvailable')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">{t('report.longitude')}</h4>
                      <p className="text-gray-900 font-mono text-sm">
                        {report.longitude ?? t('common.notAvailable')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <div className="text-4xl mb-2">🗺️</div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('detail.mapPreview')}</h4>
                      <p className="text-sm text-gray-600">{t('detail.coordinatesShown')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📷 {t('detail.reportPhoto')}</h3>
                {report.photoUrl && !imageError ? (
                  <img
                    src={report.photoUrl}
                    alt={t('detail.photoAlt', { title: report.title })}
                    onError={() => setImageError(true)}
                    className="w-full rounded-lg object-cover max-h-80 border border-gray-200"
                  />
                ) : (
                  <div className="bg-gray-100 rounded-lg p-12 text-center">
                    <div className="text-5xl mb-4">📸</div>
                    <p className="text-gray-700 font-medium mb-1">
                      {report.photoUrl ? t('detail.imageUnavailable') : t('detail.noPhoto')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {report.photoUrl
                        ? t('detail.imageLoadFailed')
                        : t('detail.noPhotoIncluded')}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">📈 {t('detail.resolutionProgress')}</h3>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                  {[
                    t('detail.reported'),
                    t('detail.underReview'),
                    t('status.inProgress'),
                    t('status.resolved'),
                  ].map((stage, index) => {
                    const stepIndex =
                      reportStatus === 'PENDING'
                        ? 0
                        : reportStatus === 'IN_PROGRESS'
                          ? 2
                          : reportStatus === 'RESOLVED'
                            ? 3
                            : 0;

                    return (
                      <div key={index} className="flex flex-col items-center w-full">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 transition ${
                            index <= stepIndex ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-gray-900 text-center">{stage}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${getStatusProgress(reportStatus)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">👥 {t('detail.communitySupport')}</h3>

                <div className="bg-blue-50 rounded-lg p-6 text-center mb-4 border border-blue-200">
                  <p className="text-4xl font-bold text-blue-600 mb-1">{upvoteCount}</p>
                  <p className="text-sm text-gray-600">{t('detail.citizensSupport')}</p>
                </div>

                <button
                  onClick={handleUpvote}
                  disabled={hasUpvoted}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    hasUpvoted
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {hasUpvoted ? t('detail.alreadyUpvoted') : t('detail.upvote')}
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('detail.summary')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{t('common.reportId')}</span>
                    <span className="font-mono text-gray-900">{report.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{t('common.status')}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(reportStatus)}`}
                    >
                      {displayedStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{t('common.upvotes')}</span>
                    <span className="font-semibold text-gray-900">{upvoteCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{t('common.submitted')}</span>
                    <span className="text-gray-900 text-sm">
                      {formatLocaleDate(report.createdAt, language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
