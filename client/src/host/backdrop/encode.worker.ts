// WebKit encodes canvas.toBlob on the main thread, about 100 ms per full-width shape at Retina size,
// which froze the TV for a second or more whenever a new place came up. Here it runs aside.

interface Job {
  id: number;
  bitmap: ImageBitmap;
}

const scope = self as unknown as { onmessage: ((e: MessageEvent<Job>) => void) | null; postMessage: (message: { id: number; png: Blob | null }) => void };

// every job gets an answer, even a null one, or the bake waiting on it never finishes
scope.onmessage = async (e) => {
  const { id, bitmap } = e.data;
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
    scope.postMessage({ id, png: await canvas.convertToBlob({ type: 'image/png' }) });
  } catch {
    scope.postMessage({ id, png: null });
  } finally {
    bitmap.close();
  }
};
