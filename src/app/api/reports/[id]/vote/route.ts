import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

type RouteContext = { params: Promise<{ id: string }> };

const getReportId = async (context: RouteContext) => {
  const { id } = await context.params;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id) ? id : null;
};

const getVoteState = async (reportId: string, userId: string) => {
  const [vote, upvotes] = await Promise.all([
    prisma.reportVote.findUnique({
      where: { reportId_userId: { reportId, userId } },
      select: { id: true },
    }),
    prisma.reportVote.count({ where: { reportId } }),
  ]);

  return { hasVoted: Boolean(vote), upvotes };
};

const validateReport = async (reportId: string) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true },
  });
  return Boolean(report);
};

const unauthorized = () =>
  NextResponse.json(
    { success: false, message: 'Please log in to vote on reports.' },
    { status: 401 }
  );

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const reportId = await getReportId(context);
    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'Invalid report ID.' },
        { status: 400 }
      );
    }
    if (!(await validateReport(reportId))) {
      return NextResponse.json(
        { success: false, message: 'Report not found.' },
        { status: 404 }
      );
    }

    await prisma.reportVote.createMany({
      data: [{ reportId, userId: user.id }],
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      ...(await getVoteState(reportId, user.id)),
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Unable to add report vote:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to vote on this report right now.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const reportId = await getReportId(context);
    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'Invalid report ID.' },
        { status: 400 }
      );
    }
    if (!(await validateReport(reportId))) {
      return NextResponse.json(
        { success: false, message: 'Report not found.' },
        { status: 404 }
      );
    }

    await prisma.reportVote.deleteMany({
      where: { reportId, userId: user.id },
    });

    return NextResponse.json({
      success: true,
      ...(await getVoteState(reportId, user.id)),
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Unable to remove report vote:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to remove your vote right now.' },
      { status: 500 }
    );
  }
}
