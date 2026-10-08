import prisma from '@/lib/prisma';
import { getStoredImage } from '@/lib/storage';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.report.findUnique({
      where: { id },
      select: { photoUrl: true },
    });

    if (!report?.photoUrl) {
      return new Response('Image not found.', { status: 404 });
    }

    const image = await getStoredImage(report.photoUrl);
    if (!image || image.statusCode !== 200) {
      return new Response('Image not found.', { status: 404 });
    }

    if (!allowedImageTypes.has(image.blob.contentType)) {
      return new Response('Unsupported image type.', { status: 415 });
    }

    return new Response(image.stream, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Length': String(image.blob.size),
        'Content-Type': image.blob.contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Unable to serve report image:', error);
    return new Response('Unable to load image.', { status: 500 });
  }
}
