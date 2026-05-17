import type { Id } from '../../../convex/_generated/dataModel';
import { compressImageForUpload } from './compressImage';

const INLINE_MAX_BYTES = 450_000;

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to encode image'));
    reader.readAsDataURL(blob);
  });
}

export type ScreenshotUploadResult = {
  storageId?: Id<'_storage'>;
  inlineDataUrl?: string;
};

/** Prefer inline data URL when small enough; otherwise Convex storage upload. */
export async function prepareScreenshotForAnalysis(
  file: File,
  generateUploadUrl: () => Promise<string>,
): Promise<ScreenshotUploadResult> {
  const blob = await compressImageForUpload(file);

  if (blob.size <= INLINE_MAX_BYTES) {
    return { inlineDataUrl: await blobToDataUrl(blob) };
  }

  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'image/jpeg' },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  const headerId = response.headers.get('Convex-Storage-Id');
  let storageId = headerId ?? undefined;

  if (!storageId) {
    try {
      const json = (await response.json()) as { storageId?: string };
      storageId = json.storageId;
    } catch {
      // body may be empty when id is only in header
    }
  }

  if (!storageId) {
    throw new Error('Upload did not return a storage id');
  }

  return { storageId: storageId as Id<'_storage'> };
}
