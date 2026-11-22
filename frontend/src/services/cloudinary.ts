import imageCompression from 'browser-image-compression';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/* Per-document compression settings */
const COMPRESS_OPTIONS: Record<string, { maxSizeMB: number; maxWidthOrHeight: number; initialQuality: number }> = {
  PROFILE_PHOTO:          { maxSizeMB: 0.5,  maxWidthOrHeight: 1200, initialQuality: 0.75 },
  AADHAAR_CARD:           { maxSizeMB: 1,    maxWidthOrHeight: 1600, initialQuality: 0.80 },
  DRIVING_LICENCE_FRONT:  { maxSizeMB: 1,    maxWidthOrHeight: 1600, initialQuality: 0.80 },
  DRIVING_LICENCE_BACK:   { maxSizeMB: 1,    maxWidthOrHeight: 1600, initialQuality: 0.80 },
  ADDRESS_PROOF:          { maxSizeMB: 1,    maxWidthOrHeight: 1600, initialQuality: 0.80 },
  PAN_CARD:               { maxSizeMB: 1,    maxWidthOrHeight: 1600, initialQuality: 0.80 },
};

/* PDF hard limit — cannot compress in browser */
const PDF_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export interface CloudinaryResult {
  url: string;
  publicId: string;
  bytes: number;         // final size after compression
  originalBytes: number; // original size before compression
}

export async function uploadDocument(
  file: File,
  documentType: string,
  folder = 'driver-registration'
): Promise<CloudinaryResult> {
  const isPDF = file.type === 'application/pdf';

  if (isPDF && file.size > PDF_MAX_BYTES) {
    throw new Error(`PDF too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 2 MB. Try scanning at lower quality or use a JPG photo.`);
  }

  const originalBytes = file.size;
  let fileToUpload: File = file;

  /* Compress images — skip PDFs */
  if (!isPDF) {
    const opts = COMPRESS_OPTIONS[documentType] ?? { maxSizeMB: 1, maxWidthOrHeight: 1600, initialQuality: 0.80 };
    fileToUpload = await imageCompression(file, {
      ...opts,
      useWebWorker: true,
      fileType: 'image/jpeg',
    });
  }

  /* Upload to Cloudinary */
  const fd = new FormData();
  fd.append('file', fileToUpload);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', folder);
  fd.append('resource_type', isPDF ? 'raw' : 'image');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isPDF ? 'raw' : 'image'}/upload`,
    { method: 'POST', body: fd }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Cloudinary upload failed');
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
    originalBytes,
  };
}
