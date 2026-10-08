import { NextResponse } from 'next/server';
import type { Report } from '@prisma/client';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
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

export async function GET() {
  try {
    const reports: Report[] = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
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
        photoUrl: report.photoUrl,
        status: report.status,
        upvotes: report.upvotes,
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
            photoUrl: report.photoUrl,
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
