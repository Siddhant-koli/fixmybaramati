'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';

type ReportRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  location: string | null;
  upvotes: number;
  createdAt: string;
};

const statusFilters = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'] as const;

const normaliseStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'RESOLVED':
      return 'Resolved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Pending';
  }
};

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
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'Rejected':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};

export default function ReportsPage() {
  const [reportsList, setReportsList] = useState<ReportRow[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<(typeof statusFilters)[number]>('All');
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
          throw new Error(data.message || 'Unable to load reports.');
        }

        setReportsList(data.reports ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load the reports list.');
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (selectedFilter === 'All') return reportsList;
    const selected = selectedFilter.toUpperCase().replace(/\s+/g, '_');
    return reportsList.filter((report) => report.status === selected);
  }, [reportsList, selectedFilter]);

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Civic Reports</h1>
            <p className="text-blue-100 text-lg">
              Browse and track civic issues being reported and addressed in Baramati.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h2>
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
                  {filter}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6">
            {!loading && !error && (
              <p className="text-gray-600 font-medium">
                Showing {filteredReports.length} of {reportsList.length} reports
              </p>
            )}
          </section>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600">Loading reports from the database...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
              <h3 className="text-lg font-semibold mb-2">Unable to load reports</h3>
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
                                {report.category}
                              </span>
                              <span
                                className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadgeColor(
                                  normaliseStatus(report.status)
                                )}`}
                              >
                                {normaliseStatus(report.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{report.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{new Date(report.createdAt).toLocaleDateString('en-IN')}</span>
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
                          View Details
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-6">
                No reports match the selected filter. Try selecting a different status or view all reports.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
