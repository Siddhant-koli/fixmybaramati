'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import AdminStatusBadge from '@/app/admin/AdminStatusBadge';
import {
  formatLocaleDate,
  translateCategory,
  translateStatus,
  useTranslation,
} from '@/lib/i18n';

type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
type ReportDetail = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: ReportStatus;
  latitude: number | null;
  longitude: number | null;
  location: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: { fullName: string; mobile: string } | null;
  upvotes: number;
};

const statuses: ReportStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function AdminReportDetail({ reportId }: { reportId: string }) {
  const { language, t } = useTranslation();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as { success?: boolean; report?: ReportDetail };
        if (!response.ok || !payload.success || !payload.report) throw new Error();
        setReport(payload.report);
        setSelectedStatus(payload.report.status);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [reportId]);

  const saveStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!report || saving || selectedStatus === report.status) return;
    setSaving(true);
    setSaveError(false);
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/reports/${encodeURIComponent(report.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        report?: { status: ReportStatus; updatedAt: string };
      };
      if (!response.ok || !payload.success || !payload.report) throw new Error();
      setReport((current) =>
        current ? { ...current, status: payload.report!.status, updatedAt: payload.report!.updatedAt } : current
      );
      setSelectedStatus(payload.report.status);
      setSaved(true);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p role="status" className="py-12 text-center text-sm text-gray-600">{t('detail.loading')}</p>;
  }

  if (error || !report) {
    return (
      <div role="alert" className="border-l-4 border-red-600 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">{t('detail.notFound')}</h1>
        <p className="mt-2 text-sm text-gray-600">{t('detail.loadError')}</p>
        <Link href="/admin/reports" className="mt-4 inline-block font-semibold text-blue-800 hover:underline">
          {t('admin.backToReports')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <Link href="/admin/reports" className="text-sm font-semibold text-blue-800 hover:underline">
            ← {t('admin.backToReports')}
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-950 md:text-3xl">{report.title}</h1>
          <p className="mt-1 font-mono text-xs text-gray-500">{report.id}</p>
        </div>
        <AdminStatusBadge status={report.status} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="report-description-heading" className="border-b border-gray-200 pb-6">
            <h2 id="report-description-heading" className="mb-4 text-lg font-bold">{t('common.description')}</h2>
            <p className="whitespace-pre-wrap leading-7 text-gray-700">{report.description}</p>
          </section>

          <section aria-labelledby="report-location-heading" className="border-b border-gray-200 pb-6">
            <h2 id="report-location-heading" className="mb-4 text-lg font-bold">{t('detail.locationInformation')}</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-gray-500">{t('detail.address')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{report.location || t('common.locationUnknown')}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-gray-500">{t('admin.coordinates')}</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {report.latitude !== null && report.longitude !== null
                    ? `${report.latitude}, ${report.longitude}`
                    : t('common.notAvailable')}
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="report-photo-heading" className="border-b border-gray-200 pb-6">
            <h2 id="report-photo-heading" className="mb-4 text-lg font-bold">{t('detail.reportPhoto')}</h2>
            {report.photoUrl ? (
              <img
                src={report.photoUrl}
                alt={t('detail.photoAlt', { title: report.title })}
                className="max-h-[480px] w-full rounded-md border border-gray-200 bg-white object-contain"
              />
            ) : (
              <p className="bg-white py-6 text-sm text-gray-600">{t('detail.noPhotoIncluded')}</p>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="status-management-heading" className="border-b border-gray-200 pb-6">
            <h2 id="status-management-heading" className="mb-4 text-lg font-bold">{t('admin.changeStatus')}</h2>
            <form onSubmit={saveStatus} className="space-y-3">
              <label htmlFor="report-status-update" className="block text-sm font-medium text-gray-700">
                {t('common.currentStatus')}
              </label>
              <select
                id="report-status-update"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value as ReportStatus);
                  setSaved(false);
                  setSaveError(false);
                }}
                disabled={saving}
                className="min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {statuses.map((value) => (
                  <option key={value} value={value}>{translateStatus(value, t)}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={saving || selectedStatus === report.status}
                className="min-h-11 w-full rounded-md bg-blue-800 px-4 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saving ? t('admin.saving') : t('admin.saveStatus')}
              </button>
              {saved && <p role="status" className="text-sm text-green-800">{t('admin.statusSaved')}</p>}
              {saveError && <p role="alert" className="text-sm text-red-700">{t('admin.statusError')}</p>}
            </form>
          </section>

          <section aria-labelledby="report-information-heading" className="border-b border-gray-200 pb-6">
            <h2 id="report-information-heading" className="mb-4 text-lg font-bold">{t('detail.summary')}</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-gray-500">{t('common.category')}</dt>
                <dd className="mt-1 text-gray-900">{translateCategory(report.category, t)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-gray-500">{t('common.dateReported')}</dt>
                <dd className="mt-1 text-gray-900">{formatLocaleDate(report.createdAt, language)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-gray-500">{t('admin.lastUpdated')}</dt>
                <dd className="mt-1 text-gray-900">{formatLocaleDate(report.updatedAt, language)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-gray-500">{t('admin.communityVotes')}</dt>
                <dd className="mt-1 tabular-nums text-gray-900">{report.upvotes}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="reporter-heading">
            <h2 id="reporter-heading" className="mb-3 text-lg font-bold">{t('admin.reporter')}</h2>
            {report.reporter ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">{t('auth.fullName')}</dt>
                  <dd className="mt-1 text-gray-900">{report.reporter.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">{t('auth.mobile')}</dt>
                  <dd className="mt-1 text-gray-900">{report.reporter.mobile}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-600">{t('admin.unknownReporter')}</p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}