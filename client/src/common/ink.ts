import { getStroke } from 'perfect-freehand';
import { shallowRef } from 'vue';
import { ERASER, type InkOp, type Stroke } from '../../../shared/protocol';

// keyed by point count too: the stroke in progress grows in place and must be re-outlined
const outlines = new WeakMap<Stroke, { scale: number; points: number; path: Path2D }>();

function cachedOutline(stroke: Stroke, scale: number): Path2D {
  const hit = outlines.get(stroke);
  if (hit && hit.scale === scale && hit.points === stroke.p.length) return hit.path;
  const path = outline(stroke, scale);
  outlines.set(stroke, { scale, points: stroke.p.length, path });
  return path;
}

function outline(stroke: Stroke, scale: number): Path2D {
  const pts: [number, number][] = [];
  for (let i = 0; i < stroke.p.length; i += 2) pts.push([stroke.p[i]! * scale, stroke.p[i + 1]! * scale]);
  const size = stroke.w * scale;
  const path = new Path2D();
  if (pts.length === 1) {
    path.arc(pts[0]![0], pts[0]![1], size / 2, 0, Math.PI * 2);
    return path;
  }
  const poly = getStroke(pts, {
    size,
    thinning: 0.35,
    smoothing: 0.6,
    streamline: 0.45,
    simulatePressure: true,
    last: true,
  });
  if (poly.length === 0) return path;
  path.moveTo(poly[0]![0], poly[0]![1]);
  for (let i = 1; i < poly.length; i++) {
    const [x0, y0] = poly[i - 1]!;
    const [x1, y1] = poly[i]!;
    path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  path.closePath();
  return path;
}

export function pointCount(strokes: Stroke[]): number {
  return strokes.reduce((n, s) => n + s.p.length / 2, 0);
}

/** Truncates a drawing to its first `points` points, which is how replays animate. */
export function partial(strokes: Stroke[], points: number): Stroke[] {
  const out: Stroke[] = [];
  let left = points;
  for (const s of strokes) {
    if (left <= 0) break;
    const n = s.p.length / 2;
    if (n <= left) out.push(s);
    else out.push({ ...s, p: s.p.slice(0, Math.max(2, Math.floor(left) * 2)) });
    left -= n;
  }
  return out;
}

/** Strokes streamed from one artist, rebuilt from the ops it sends; `version` ticks on every change. */
export class LiveInk {
  readonly version = shallowRef(0);
  private done: Stroke[] = [];
  private current: Stroke | null = null;

  apply(op: InkOp): void {
    if (op.k === 'move') {
      if (this.current) this.current.p.push(...op.s.p);
      else this.current = { c: op.s.c, w: op.s.w, p: op.s.p.slice() };
    } else if (op.k === 'end') {
      this.done.push(op.s);
      this.current = null;
    } else if (op.k === 'undo') this.done.pop();
    else this.done.length = 0;
    this.version.value++;
  }

  /** Swaps in a full drawing, e.g. the catch-up a screen gets after reconnecting mid-round. */
  replace(strokes: Stroke[]): void {
    this.done = strokes.slice();
    this.current = null;
    this.version.value++;
  }

  reset(): void {
    this.done = [];
    this.current = null;
    this.version.value++;
  }

  strokes(): Stroke[] {
    return this.current ? [...this.done, this.current] : this.done;
  }
}

/**
 * Paints strokes onto ctx, where the canvas maps `board` at `scale` pixels per unit and
 * is offset vertically by `dy` units. The eraser punches holes, so draw ink on its own layer.
 */
export function paint(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale: number, dy = 0): void {
  ctx.save();
  ctx.translate(0, -dy * scale);
  for (const s of strokes) {
    ctx.globalCompositeOperation = s.c === ERASER ? 'destination-out' : 'source-over';
    ctx.fillStyle = s.c === ERASER ? '#000' : s.c;
    ctx.fill(cachedOutline(s, scale));
  }
  ctx.restore();
}

const inkCache = new Map<string, Promise<Stroke[]>>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();
/** A TV left on all evening would otherwise hold every decoded selfie and photo, a few MB each. */
const CACHE_MAX = 60;

/** Map insertion order doubles as recency: a hit moves to the end, the oldest entry goes first. */
function remember<T>(cache: Map<string, T>, key: string, value: T): void {
  cache.delete(key);
  cache.set(key, value);
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!);
}

/** A room asset by id, or a picture shipped with the client when the id is already a path. */
export function assetUrl(code: string, id: string): string {
  return id.startsWith('/') ? id : `/a/${code}/${id}`;
}

export function loadInk(code: string, id: string): Promise<Stroke[]> {
  const key = `${code}/${id}`;
  let p = inkCache.get(key);
  if (!p) {
    p = fetch(assetUrl(code, id)).then((r) => (r.ok ? (r.json() as Promise<Stroke[]>) : []));
    p.catch(() => inkCache.delete(key));
  }
  remember(inkCache, key, p);
  return p;
}

export function loadImage(code: string, id: string): Promise<HTMLImageElement> {
  const key = `${code}/${id}`;
  let p = imageCache.get(key);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = assetUrl(code, id);
    });
    p.catch(() => imageCache.delete(key));
  }
  remember(imageCache, key, p);
  return p;
}

/** Draws an image so it covers the whole canvas, cropping the overflow. */
export function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}
