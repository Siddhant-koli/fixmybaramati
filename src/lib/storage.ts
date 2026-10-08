import { del, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const PHOTO_STORAGE_NOT_CONFIGURED_MESSAGE =
  'Photo storage is not configured for this environment.';
const MAX_IMAGE_PIXELS = 25_000_000;
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const getMaxUploadBytes = (): number => {
  const configuredValue = Number(process.env.UPLOAD_MAX_BYTES ?? DEFAULT_MAX_UPLOAD_BYTES);

  if (!Number.isFinite(configuredValue) || configuredValue <= 0) {
    return DEFAULT_MAX_UPLOAD_BYTES;
  }

  return Math.min(configuredValue, DEFAULT_MAX_UPLOAD_BYTES);
};

const toSafeMimeType = (mimeType: string | undefined): string => {
  const candidate = mimeType?.trim().toLowerCase();
  if (candidate && ALLOWED_IMAGE_MIME_TYPES.has(candidate)) {
    return candidate;
  }

  return '';
};

const getExtensionFromMimeType = (mimeType: string): string => {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
};

const detectImageSignature = (bytes: Uint8Array): string => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return '';
};

export async function validateUploadedImage(file: File | null): Promise<{ valid: true } | { valid: false; message: string }> {
  if (!file) {
    return { valid: false, message: 'Please choose an image to upload.' };
  }

  const maxBytes = getMaxUploadBytes();

  if (file.size <= 0) {
    return { valid: false, message: 'The selected image is empty.' };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      message: `Image must be smaller than ${(maxBytes / (1024 * 1024)).toFixed(0)} MB.`,
    };
  }

  const declaredMimeType = toSafeMimeType(file.type);
  if (!declaredMimeType) {
    return {
      valid: false,
      message: 'Please select a valid image type: JPEG, PNG, or WEBP.',
    };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const detectedMimeType = detectImageSignature(buffer);

  if (!detectedMimeType || detectedMimeType !== declaredMimeType) {
    return {
      valid: false,
      message: 'The selected file does not look like a valid JPEG, PNG, or WEBP image.',
    };
  }

  try {
    await sharp(buffer, {
      failOn: 'warning',
      limitInputPixels: MAX_IMAGE_PIXELS,
    }).stats();
  } catch {
    return {
      valid: false,
      message: 'The selected file does not look like a valid JPEG, PNG, or WEBP image.',
    };
  }

  const fileName = file.name?.toLowerCase() ?? '';
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(fileName);
  if (!hasAllowedExtension) {
    return {
      valid: false,
      message: 'Please select a file with a .jpg, .jpeg, .png, or .webp extension.',
    };
  }

  return { valid: true };
}

export async function uploadReportImage(file: File, userId: string): Promise<{ url: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(PHOTO_STORAGE_NOT_CONFIGURED_MESSAGE);
  }

  const validation = await validateUploadedImage(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const mimeType = toSafeMimeType(file.type) || 'image/jpeg';
  const extension = getExtensionFromMimeType(mimeType);
  const path = `reports/${userId}/${Date.now()}-${randomUUID()}.${extension}`;

  const uploaded = await put(path, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: mimeType,
  });

  return { url: uploaded.url };
}

export async function deleteStoredImage(imageUrl: string | null): Promise<void> {
  if (!imageUrl || !process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  try {
    await del(imageUrl);
  } catch (error) {
    console.error('Unable to delete uploaded image from storage:', error);
  }
}
