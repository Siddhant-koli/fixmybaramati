import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getReportPhotoUrl } from '@/lib/report-photo';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: 'The report you are looking for does not exist.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        category: report.category,
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        location: report.location,
        photoUrl: report.photoUrl ? getReportPhotoUrl(report.id) : null,
        status: report.status,
        upvotes: report.upvotes,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to load this report right now.',
      },
      { status: 500 }
    );
  }
}
