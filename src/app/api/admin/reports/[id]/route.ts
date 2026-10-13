import { ReportStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin-auth';
import { getReportPhotoUrl } from '@/lib/report-photo';
import prisma from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

const getReportId = async (context: RouteContext) => {
  const { id } = await context.params;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id) ? id : null;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminApi();
    if (!authorization.authorized) return authorization.response;

    const id = await getReportId(context);
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Invalid report ID.' },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        status: true,
        latitude: true,
        longitude: true,
        location: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
        reporter: { select: { id: true, fullName: true, mobile: true } },
        _count: { select: { votes: true } },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Report not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        report: {
          ...report,
          photoUrl: report.photoUrl ? getReportPhotoUrl(report.id) : null,
          upvotes: report._count.votes,
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt.toISOString(),
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Unable to load admin report:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load this report right now.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminApi();
    if (!authorization.authorized) return authorization.response;

    const id = await getReportId(context);
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Invalid report ID.' },
        { status: 400 }
      );
    }

    const body: unknown = await request.json().catch(() => null);
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      !('status' in body) ||
      typeof body.status !== 'string' ||
      !Object.values(ReportStatus).includes(body.status as ReportStatus)
    ) {
      return NextResponse.json(
        { success: false, message: 'A valid report status is required.' },
        { status: 400 }
      );
    }

    const status = body.status as ReportStatus;
    const update = await prisma.report.updateMany({
      where: { id },
      data: { status },
    });
    if (update.count === 0) {
      return NextResponse.json(
        { success: false, message: 'Report not found.' },
        { status: 404 }
      );
    }

    const report = await prisma.report.findUniqueOrThrow({
      where: { id },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json(
      {
        success: true,
        report: { ...report, updatedAt: report.updatedAt.toISOString() },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Unable to update admin report status:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to update this report right now.' },
      { status: 500 }
    );
  }
}