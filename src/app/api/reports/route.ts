import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

const validateTitle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 'Issue title is required';
  if (trimmed.length < 5) return 'Title must be at least 5 characters';
  return '';
};

const validateCategory = (value: string) => {
  if (!value.trim()) return 'Please select a category';
  return '';
};

const validateDescription = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 'Description is required';
  if (trimmed.length < 20) return 'Description must be at least 20 characters';
  return '';
};

const validateCoordinates = (latitude: string, longitude: string) => {
  if (!latitude && !longitude) return {};
  if ((latitude && !longitude) || (!latitude && longitude)) {
    return {
      coordinates: 'Please enter both latitude and longitude, or leave both empty',
    };
  }

  const latitudeValue = Number(latitude);
  const longitudeValue = Number(longitude);

  if (Number.isNaN(latitudeValue) || Number.isNaN(longitudeValue)) {
    return {
      coordinates: 'Please enter valid numbers for coordinates',
    };
  }

  if (latitudeValue < -90 || latitudeValue > 90) {
    return {
      latitude: 'Latitude must be between -90 and 90',
    };
  }

  if (longitudeValue < -180 || longitudeValue > 180) {
    return {
      longitude: 'Longitude must be between -180 and 180',
    };
  }

  return {};
};

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });

    type ReportWithRelations = Awaited<ReturnType<typeof prisma.report.findMany>>[number];

    return NextResponse.json({
      success: true,
      reports: reports.map((report: ReportWithRelations) => ({
        ...report,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to load reports right now. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please log in to submit a report.' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const title = String(body.title ?? '').trim();
    const category = String(body.category ?? '').trim();
    const description = String(body.description ?? '').trim();
    const latitude = String(body.latitude ?? '').trim();
    const longitude = String(body.longitude ?? '').trim();
    const location = String(body.location ?? '').trim();

    const coordinateErrors = validateCoordinates(latitude, longitude);
    const errors: Record<string, string> = {
      title: validateTitle(title),
      category: validateCategory(category),
      description: validateDescription(description),
      ...(coordinateErrors as Record<string, string>),
    };

    const hasErrors = Object.values(errors).some((message) => message !== '');
    if (hasErrors) {
      return NextResponse.json(
        {
          success: false,
          errors,
          message: 'Please correct the form details and try again.',
        },
        { status: 400 }
      );
    }

    const latitudeValue = latitude ? Number(latitude) : null;
    const longitudeValue = longitude ? Number(longitude) : null;
    const normalizedLocation =
      location ||
      (latitudeValue !== null && longitudeValue !== null
        ? `Latitude: ${latitudeValue}, Longitude: ${longitudeValue}`
        : null);

    const report = await prisma.report.create({
      data: {
        title,
        category,
        description,
        latitude: latitudeValue,
        longitude: longitudeValue,
        location: normalizedLocation,
        photoUrl: null,
        status: 'PENDING',
        upvotes: 0,
        reporterId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your civic issue has been reported successfully.',
        report: {
          ...report,
          status: report.status,
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Report creation failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Your report could not be submitted. Please try again later.',
      },
      { status: 500 }
    );
  }
}
