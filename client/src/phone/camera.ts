import { IMAGE_SIZE } from '../../../shared/protocol';

/** Width the shot is decoded at: twice the upload size, so the crop still has detail to spare. */
const DECODE_WIDTH = IMAGE_SIZE * 2;

interface Decoded {
  image: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

/**
 * Decodes the shot already scaled down. A 48 MP photo decoded at full size is ~190 MB of pixels,
 * enough for iOS to kill the tab; createImageBitmap with a resize never holds that much.
 */
async function decode(file: File): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(file, { resizeWidth: DECODE_WIDTH, resizeQuality: 'high' });
    return { image: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    // older Safari rejects the resize options, so fall back to a plain full-size decode
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } finally {
      URL.revokeObjectURL(url);
    }
    return { image: img, width: img.naturalWidth, height: img.naturalHeight, release: () => img.removeAttribute('src') };
  }
}

/** Center-crops a camera shot to an IMAGE_SIZE square JPEG. */
export async function squareJpeg(file: File): Promise<Blob> {
  const src = await decode(file);
  const canvas = document.createElement('canvas');
  try {
    const side = Math.min(src.width, src.height);
    canvas.width = IMAGE_SIZE;
    canvas.height = IMAGE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.drawImage(src.image, (src.width - side) / 2, (src.height - side) / 2, side, side, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85),
    );
  } finally {
    src.release();
    // Safari keeps a canvas's pixel memory until its size drops to zero
    canvas.width = 0;
    canvas.height = 0;
  }
}
