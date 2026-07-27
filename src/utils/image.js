const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const SKIP_IF_SMALLER_THAN = 700 * 1024;

export async function compressImage(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }
  if (file.size < SKIP_IF_SMALLER_THAN) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / bitmap.width, MAX_DIMENSION / bitmap.height);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
