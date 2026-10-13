import { ReportStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin-auth';
import { getReportPhotoUrl } from '@/lib/report-photo';
import { isReportCategory } from '@/lib/report-categories';
import prisma from '@/lib/prisma';

const PAGE_SIZE = 12;
const MAX_PAGE = 10000;
const allowedParameters = new Set(['search', 'category', 'status', 'sort', 'page']);

export async function GET(request: Request) {
  try {
    const authorization = await requireAdminApi();
    if (!authorization.authorized) return authorization.response;

    const params = new URL(request.url).searchParams;
    const invalidKeys = [...params.keys()].some(
      (key) => !allowedParameters.has(key) || params.getAll(key).length !== 1
    );
    const search = (params.get('search') ?? '').trim();
    const category = (params.get('category') ?? '').trim();
    const rawStatus = (params.get('status') ?? '').trim();
    const rawSort = (params.get('sort') ?? 'newest').trim();
    const rawPage = (params.get('page') ?? '1').trim();
    const page = Number(rawPage);
    const status = Object.values(ReportStatus).find((value) => value === rawStatus);
    const invalidParameters =
      invalidKeys ||
      search.length > 200 ||
      (category !== '' && !isReportCategory(category)) ||
      (rawStatus !== '' && !status) ||
      !['newest', 'oldest'].includes(rawSort) ||
      !/^[1-9]\d*$/.test(rawPage) ||
      !Number.isSafeInteger(page) ||
      page > MAX_PAGE;

    if (invalidParameters) {
      return NextResponse.json(
        { success: false, message: 'Invalid report search parameters.' },
        { status: 400 }
      );
    }

    const where = {
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { location: { contains: search, mode: 'insensitive' as const } },
              { reporter: { is: { fullName: { contains: search, mode: 'insensitive' as const } } } },
            ],
          }
        : {}),
    };
    const total = await prisma.report.count({ where });
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const currentPage = totalPages ? Math.min(page, totalPages) : 1;
    const reports = await prisma.report.findMany({
      where,
      orderBy:
        rawSort === 'oldest'
          ? [{ createdAt: 'asc' }, { id: 'asc' }]
          : [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        location: true,
        photoUrl: true,
        createdAt: true,
        reporter: { select: { id: true, fullName: true, mobile: true } },
        _count: { select: { votes: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        reports: reports.map((report) => ({
          ...report,
          photoUrl: report.photoUrl ? getReportPhotoUrl(report.id) : null,
          upvotes: report._count.votes,
          createdAt: report.createdAt.toISOString(),
        })),
        pagination: { page: currentPage, pageSize: PAGE_SIZE, total, totalPages },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Unable to load admin reports:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load reports right now.' },
      { status: 500 }
    );
  }
}