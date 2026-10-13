import { ReportStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const authorization = await requireAdminApi();
    if (!authorization.authorized) return authorization.response;

    const [total, byStatus, byCategory, recentReports] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.report.groupBy({ by: ['category'], _count: { _all: true } }),
      prisma.report.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 8,
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          location: true,
          createdAt: true,
          reporter: { select: { fullName: true } },
        },
      }),
    ]);

    const statusCounts = Object.fromEntries(
      Object.values(ReportStatus).map((status) => [status, 0])
    ) as Record<ReportStatus, number>;
    for (const entry of byStatus) statusCounts[entry.status] = entry._count._all;

    return NextResponse.json(
      {
        success: true,
        stats: {
          total,
          byStatus: statusCounts,
          byCategory: byCategory
            .map(({ category, _count }) => ({ category, count: _count._all }))
            .sort((first, second) => second.count - first.count),
        },
        recentReports: recentReports.map((report) => ({
          ...report,
          createdAt: report.createdAt.toISOString(),
        })),
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Unable to load admin dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load dashboard data right now.' },
      { status: 500 }
    );
  }
}