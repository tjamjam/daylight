export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.width, height: img.height };
}

export async function stripMetadata(
  file: File,
  _options?: { keepOrientation?: boolean }
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
}

export async function compressImage(
  file: File,
  quality: number,
  format: 'jpeg' | 'webp' | 'png'
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const qualityValue = format === 'png' ? 1 : quality / 100;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, width: img.width, height: img.height });
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      mimeType,
      qualityValue
    );
  });
}

export interface DownsizeSettings {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0–1
  format: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface DownsizeResult {
  blob: Blob;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  originalSize: number;
  newSize: number;
  fileName: string;
}

export async function downsizeImage(file: File, settings: DownsizeSettings): Promise<DownsizeResult> {
  const img = await loadImage(file);

  const originalWidth = img.width;
  const originalHeight = img.height;

  let newWidth = originalWidth;
  let newHeight = originalHeight;

  if (newWidth > settings.maxWidth) {
    newHeight = Math.round(newHeight * (settings.maxWidth / newWidth));
    newWidth = settings.maxWidth;
  }
  if (newHeight > settings.maxHeight) {
    newWidth = Math.round(newWidth * (settings.maxHeight / newHeight));
    newHeight = settings.maxHeight;
  }

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode image'));
          return;
        }

        const ext = settings.format === 'image/png' ? '.png' : settings.format === 'image/webp' ? '.webp' : '.jpg';
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const fileName = `${baseName}-resized${ext}`;

        resolve({
          blob,
          originalWidth,
          originalHeight,
          newWidth,
          newHeight,
          originalSize: file.size,
          newSize: blob.size,
          fileName,
        });
      },
      settings.format,
      settings.format !== 'image/png' ? settings.quality : undefined
    );
  });
}

export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  maintainAspect: boolean
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  let { width, height } = img;

  if (maintainAspect) {
    const aspectRatio = width / height;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    width = maxWidth;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.92
    );
  });
}
