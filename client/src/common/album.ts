import { IMAGE_SIZE, type GalleryItem } from '../../../shared/protocol';
import { drawCover, loadImage, loadInk, paint } from './ink';

const EXPORT_WIDTH = 1200;
const PAPER = '#fffaf0';

async function renderItem(code: string, item: GalleryItem): Promise<Blob> {
  const canvas = await drawItem(code, item, EXPORT_WIDTH);
  try {
    return await toPng(canvas);
  } finally {
    release(canvas);
  }
}

const COLLAGE_COLUMNS = 2;
const COLLAGE_CELL = 600;
const COLLAGE_GAP = 30;
const COLLAGE_HEADER = 130;
const COLLAGE_BG = '#2a1458';

/** A tonight's moment ready to draw: the names are already resolved, since the album has no roster. */
export interface MomentCard {
  icon: string;
  label: string;
  text: string;
  by: string;
}

const MOMENT_PAD = 0.06;

/** Wraps `text` to `width` and returns the lines; long words are left to overflow rather than split. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function drawMoment(card: MomentCard, width: number): HTMLCanvasElement {
  const pad = Math.round(width * MOMENT_PAD);
  const inner = width - pad * 2;
  const unit = width / 600;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  const fonts = {
    label: `700 ${Math.round(24 * unit)}px "Rubik Variable", sans-serif`,
    text: `900 ${Math.round(40 * unit)}px "Rubik Variable", sans-serif`,
    by: `700 ${Math.round(26 * unit)}px "Rubik Variable", sans-serif`,
  };
  ctx.font = fonts.label;
  const label = wrap(ctx, `${card.icon} ${card.label}`, inner);
  ctx.font = fonts.text;
  const text = wrap(ctx, card.text, inner);
  const lh = { label: 32 * unit, text: 50 * unit, by: 34 * unit };
  canvas.width = width;
  canvas.height = Math.round(pad * 2 + label.length * lh.label + 16 * unit + text.length * lh.text + (card.by ? 16 * unit + lh.by : 0));
  // resizing wipes the context state, so the fonts are set again for drawing
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = 'top';
  let y = pad;
  ctx.fillStyle = '#6b5a99';
  ctx.font = fonts.label;
  for (const l of label) {
    ctx.fillText(l, pad, y);
    y += lh.label;
  }
  y += 16 * unit;
  ctx.fillStyle = '#1b1033';
  ctx.font = fonts.text;
  for (const l of text) {
    ctx.fillText(l, pad, y);
    y += lh.text;
  }
  if (card.by) {
    y += 16 * unit;
    ctx.fillStyle = '#ff4f8b';
    ctx.font = fonts.by;
    ctx.fillText(card.by, pad, y);
  }
  return canvas;
}

/** Lays every item and moment out on one sheet with a title and today's date, for a single picture to post. */
async function renderCollage(code: string, items: GalleryItem[], moments: MomentCard[]): Promise<Blob> {
  const cells = [...(await Promise.all(items.map((item) => drawItem(code, item, COLLAGE_CELL)))), ...moments.map((m) => drawMoment(m, COLLAGE_CELL))];
  const columns = Array.from({ length: COLLAGE_COLUMNS }, () => COLLAGE_HEADER + COLLAGE_GAP);
  const spots = cells.map((cell) => {
    const col = columns.indexOf(Math.min(...columns));
    const spot = { x: COLLAGE_GAP + col * (COLLAGE_CELL + COLLAGE_GAP), y: columns[col]! };
    columns[col]! += cell.height + COLLAGE_GAP;
    return spot;
  });
  const sheet = document.createElement('canvas');
  sheet.width = COLLAGE_COLUMNS * (COLLAGE_CELL + COLLAGE_GAP) + COLLAGE_GAP;
  sheet.height = Math.max(...columns);
  try {
    const ctx = sheet.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.fillStyle = COLLAGE_BG;
    ctx.fillRect(0, 0, sheet.width, sheet.height);
    ctx.fillStyle = '#ffd23f';
    ctx.font = '900 64px "Unbounded Variable", "Arial Black", sans-serif';
    ctx.fillText('Кто из нас?', COLLAGE_GAP, 86);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px "Nunito Variable", sans-serif';
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.textAlign = 'right';
    ctx.fillText(date, sheet.width - COLLAGE_GAP, 86);
    cells.forEach((cell, i) => ctx.drawImage(cell, spots[i]!.x, spots[i]!.y));
    return await toPng(sheet);
  } finally {
    cells.forEach(release);
    release(sheet);
  }
}

async function drawItem(code: string, item: GalleryItem, width: number): Promise<HTMLCanvasElement> {
  const board = item.board ?? { w: IMAGE_SIZE, h: IMAGE_SIZE };
  const height = Math.round((width * board.h) / board.w);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  // the eraser cuts through whatever is under it, so ink goes on its own layer like on screen
  const ink = document.createElement('canvas');
  ink.width = width;
  ink.height = height;
  try {
    const ctx = canvas.getContext('2d');
    const inkCtx = ink.getContext('2d');
    if (!ctx || !inkCtx) throw new Error('canvas unavailable');
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, width, height);
    const [strokes, img] = await Promise.all([
      item.ink ? loadInk(code, item.ink) : Promise.resolve([]),
      item.image ? loadImage(code, item.image) : Promise.resolve(null),
    ]);
    if (img) drawCover(ctx, img, width, height);
    paint(inkCtx, strokes, width / board.w);
    ctx.drawImage(ink, 0, 0);
    return canvas;
  } catch (err) {
    release(canvas);
    throw err;
  } finally {
    release(ink);
  }
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/png'),
  );
}

/** Safari keeps a canvas's pixel memory until its size drops to zero. */
function release(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/** Hands the picture to the share sheet where there is one (phones), or downloads it. */
export async function saveItem(code: string, item: GalleryItem, name: string): Promise<void> {
  await saveBlob(await renderItem(code, item), name);
}

export async function saveCollage(code: string, items: GalleryItem[], moments: MomentCard[] = []): Promise<void> {
  await saveBlob(await renderCollage(code, items, moments), 'kto-iz-nas-album');
}

export async function saveMoment(card: MomentCard, name: string): Promise<void> {
  const canvas = drawMoment(card, EXPORT_WIDTH);
  try {
    await saveBlob(await toPng(canvas), name);
  } finally {
    release(canvas);
  }
}

async function saveBlob(blob: Blob, name: string): Promise<void> {
  const file = new File([blob], `${name}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
