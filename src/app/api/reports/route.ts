import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { getReportPhotoUrl } from '@/lib/report-photo';
import { isReportCategory } from '@/lib/report-categories';
import {
  deleteStoredImage,
  PHOTO_STORAGE_NOT_CONFIGURED_MESSAGE,
  uploadReportImage,
  validateUploadedImage,
} from '@/lib/storage';

const validateTitle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 'Issue title is required';
  if (trimmed.length < 5) return 'Title must be at least 5 characters';
  return '';
};

const validateCategory = (value: string) => {
  if (!isReportCategory(value)) return 'Please select a category';
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

const parseReportRequest = async (request: Request) => {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const photo = formData.get('photo');

    return {
      title: String(formData.get('title') ?? '').trim(),
      category: String(formData.get('category') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      latitude: String(formData.get('latitude') ?? '').trim(),
      longitude: String(formData.get('longitude') ?? '').trim(),
      location: String(formData.get('location') ?? '').trim(),
      photo: photo instanceof File ? photo : null,
    };
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  return {
    title: String(body.title ?? '').trim(),
    category: String(body.category ?? '').trim(),
    description: String(body.description ?? '').trim(),
    latitude: String(body.latitude ?? '').trim(),
    longitude: String(body.longitude ?? '').trim(),
    location: String(body.location ?? '').trim(),
    photo: null,
  };
};

const reportStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const;
const reportSorts = ['newest', 'oldest', 'most_upvoted', 'recently_updated'] as const;
const PAGE_SIZE = 12;
const MAX_PAGE = 10000;
const allowedQueryParameters = new Set(['search', 'category', 'status', 'sort', 'page']);

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const invalidQueryKeys = [...searchParams.keys()].some(
      (key) => !allowedQueryParameters.has(key) || searchParams.getAll(key).length !== 1
    );
    const search = (searchParams.get('search') ?? '').trim();
    const category = (searchParams.get('category') ?? '').trim();
    const status = (searchParams.get('status') ?? '').trim();
    const sort = (searchParams.get('sort') ?? '').trim() || 'newest';
    const rawPage = (searchParams.get('page') ?? '').trim() || '1';
    const page = Number(rawPage);
    const selectedStatus = reportStatuses.find((candidate) => candidate === status);
    const selectedSort = reportSorts.find((candidate) => candidate === sort);
    const invalidParameters =
      invalidQueryKeys ||
      search.length > 200 ||
      (category !== '' && !isReportCategory(category)) ||
      (status !== '' && !selectedStatus) ||
      !selectedSort ||
      !/^[1-9]\d*$/.test(rawPage) ||
      !Number.isSafeInteger(page) ||
      page > MAX_PAGE;

    if (invalidParameters) {
      return NextResponse.json(
        { success: false, message: 'Invalid report search parameters.' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const where = {
      ...(category ? { category } : {}),
      ...(selectedStatus ? { status: selectedStatus } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const orderBy =
      selectedSort === 'oldest'
        ? [{ createdAt: 'asc' as const }, { id: 'asc' as const }]
        : selectedSort === 'most_upvoted'
          ? [
              { votes: { _count: 'desc' as const } },
              { createdAt: 'desc' as const },
              { id: 'desc' as const },
            ]
          : selectedSort === 'recently_updated'
            ? [
                { updatedAt: 'desc' as const },
                { createdAt: 'desc' as const },
                { id: 'desc' as const },
              ]
            : [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

    const total = await prisma.report.count({ where });
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const currentPage = totalPages ? Math.min(page, totalPages) : 1;
    const reports = await prisma.report.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        latitude: true,
        longitude: true,
        location: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { votes: true } },
        votes: { where: { userId: user?.id ?? '' }, select: { id: true } },
      },
    });

    return NextResponse.json({
      success: true,
      reports: reports.map((report) => ({
        id: report.id,
        title: report.title,
        category: report.category,
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        location: report.location,
        photoUrl: report.photoUrl ? getReportPhotoUrl(report.id) : null,
        status: report.status,
        upvotes: report._count.votes,
        hasVoted: user ? report.votes.length > 0 : false,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      })),
      pagination: {
        page: currentPage,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
      },
      isAuthenticated: Boolean(user),
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
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
        { success: false, message: 'Please sign in to submit a report.' },
        { status: 401 }
      );
    }

    const { title, category, description, latitude, longitude, location, photo } =
      await parseReportRequest(request);

    const errors: Record<string, string> = {
      title: validateTitle(title),
      category: validateCategory(category),
      description: validateDescription(description),
      ...(validateCoordinates(latitude, longitude) as Record<string, string>),
    };

    if (photo) {
      const photoValidation = await validateUploadedImage(photo);
      if (!photoValidation.valid) {
        errors.photo = photoValidation.message;
      }
    }

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

    let uploadedPhotoUrl: string | null = null;

    try {
      if (photo) {
        const uploadResult = await uploadReportImage(photo, user.id);
        uploadedPhotoUrl = uploadResult.url;
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
          photoUrl: uploadedPhotoUrl,
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
        },
        { status: 201 }
      );
    } catch (error) {
      if (uploadedPhotoUrl) {
        await deleteStoredImage(uploadedPhotoUrl);
      }

      console.error('Report creation failed:', error);
      if (
        photo &&
        error instanceof Error &&
        error.message === PHOTO_STORAGE_NOT_CONFIGURED_MESSAGE
      ) {
        return NextResponse.json(
          { success: false, message: PHOTO_STORAGE_NOT_CONFIGURED_MESSAGE },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Unable to create the report. Please try again.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Report creation failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to create the report. Please try again.',
      },
      { status: 500 }
    );
  }
}
