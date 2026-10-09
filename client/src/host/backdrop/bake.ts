// WebKit re-runs every SVG filter that a repainted rect touches, and at Retina size the cel filter on a
// full-width hill costs tens of milliseconds a frame (a scene fell to 9–18 fps in the desktop app).
// Shapes that never change are drawn once into bitmaps and swapped in, so a frame only blits them.

const SVG_NS = 'http://www.w3.org/2000/svg';
const MARK = 'data-baked';
// properties a shape picks up from ancestors that the bitmap leaves behind
const INHERITED = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray'];

const animated = (el: Element) => getComputedStyle(el).animationName !== 'none';
const hasAnimation = (el: Element) => animated(el) || Array.from(el.querySelectorAll('*')).some(animated);
const hasFilter = (el: Element) => el.hasAttribute('filter') || el.querySelector('[filter]') !== null;
// text needs the page's web fonts and <image> its URLs, neither of which a blob-backed SVG can load
const portable = (el: Element) => el.tagName !== 'text' && el.querySelector('text, image, foreignObject') === null;

// a big shape riding a panning group is re-rasterized every frame even without a filter
const BIG_MOVER = 0.1;

function bakeable(root: SVGSVGElement): SVGGraphicsElement[] {
  const found: SVGGraphicsElement[] = [];
  const screen = root.getBoundingClientRect();
  const big = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height > screen.width * screen.height * BIG_MOVER;
  };
  const walk = (parent: Element, moving: boolean) => {
    for (const el of Array.from(parent.children)) {
      if (el.tagName === 'defs' || el.hasAttribute(MARK)) continue;
      if (!hasAnimation(el)) {
        if (!(hasFilter(el) || (moving && big(el))) || !(el instanceof SVGGraphicsElement)) continue;
        // a group holding text or an image cannot bake whole, but its filtered shapes can one by one
        if (portable(el)) found.push(el);
        else walk(el, moving);
      } else {
        // a still part inside a swaying group bakes too: its bitmap stays a child and sways along
        walk(el, moving || animated(el));
      }
    }
  };
  walk(root, false);
  return found;
}

function localRef(value: string): string {
  return value.replace(/url\((["']?)[^)#]*#([^)"']+)\1\)/g, 'url(#$2)');
}

// gradients and filters live in the page's <defs>; the standalone copy needs every one it points at
function collectDefs(markup: string, seen = new Set<string>()): string {
  let out = '';
  for (const [, id] of markup.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const def = document.getElementById(id);
    if (!def) continue;
    out += def.outerHTML + collectDefs(def.outerHTML, seen);
  }
  return out;
}

// the cel filter draws inside the silhouette, so only the outline pokes past the bbox; a sharp miter
// reaches out up to ~2 stroke widths
function padFor(el: Element): number {
  const widths = [el, ...Array.from(el.querySelectorAll('*'))].map((e) => parseFloat(getComputedStyle(e).strokeWidth) || 0);
  return Math.max(...widths) * 2 + 2;
}

function boxInParent(el: SVGGraphicsElement): DOMRect {
  const b = el.getBBox();
  const m = el.transform.baseVal.consolidate()?.matrix;
  if (!m) return b;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]] as const) {
    xs.push(m.a * x + m.c * y + m.e);
    ys.push(m.b * x + m.d * y + m.f);
  }
  return new DOMRect(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

let encoder: Worker | null | undefined;
let jobs = 0;
const pending = new Map<number, (png: Blob | null) => void>();

/** PNG of the canvas, encoded in a worker where OffscreenCanvas allows it. */
async function encode(canvas: HTMLCanvasElement): Promise<Blob | null> {
  if (encoder === undefined) {
    try {
      encoder = typeof OffscreenCanvas === 'function' ? new Worker(new URL('./encode.worker.ts', import.meta.url), { type: 'module' }) : null;
      encoder?.addEventListener('message', (e: MessageEvent<{ id: number; png: Blob | null }>) => {
        pending.get(e.data.id)?.(e.data.png);
        pending.delete(e.data.id);
      });
    } catch {
      encoder = null;
    }
  }
  if (!encoder) return new Promise((done) => canvas.toBlob(done));
  const bitmap = await createImageBitmap(canvas);
  const id = ++jobs;
  const worker = encoder;
  return new Promise((done) => {
    pending.set(id, done);
    worker.postMessage({ id, bitmap }, [bitmap]);
  });
}

// bitmaps outlive the session, so a place this TV has shown before comes up without redrawing a filter;
// the key is the shape's own markup at its pixel size, so edited art or a new window size misses cleanly
const CACHE = 'baked-v1';
const INDEX_KEY = 'baked-index';
/** Bitmaps kept on disk; past this the least recently used go, so window resizes cannot pile them up. */
const CACHE_KEEP = 400;

async function cacheKey(svg: string): Promise<string | null> {
  if (typeof caches === 'undefined' || !crypto.subtle) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(svg));
  return `/baked/${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')}.png`;
}

function touch(key: string): string[] {
  // the index is only bookkeeping for eviction; losing it just makes the cache forget what is old
  let index: Record<string, number> = {};
  try {
    index = JSON.parse(localStorage.getItem(INDEX_KEY) ?? '{}') as Record<string, number>;
  } catch {
    index = {};
  }
  index[key] = Date.now();
  const keys = Object.keys(index).sort((a, b) => index[a]! - index[b]!);
  const stale = keys.slice(0, Math.max(0, keys.length - CACHE_KEEP));
  for (const k of stale) delete index[k];
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch {
    // storage refused: entries stay unindexed and are never evicted, which only costs disk
  }
  return stale;
}

async function cached(key: string | null): Promise<Blob | null> {
  if (!key) return null;
  try {
    const hit = await (await caches.open(CACHE)).match(key);
    if (!hit) return null;
    touch(key);
    return await hit.blob();
  } catch {
    return null;
  }
}

function keep(key: string | null, png: Blob): void {
  if (!key) return;
  void caches
    .open(CACHE)
    .then(async (cache) => {
      await cache.put(key, new Response(png, { headers: { 'content-type': 'image/png' } }));
      for (const old of touch(key)) await cache.delete(old);
    })
    .catch(() => undefined);
}

async function render(svg: string, w: number, h: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image(w, h);
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    // willReadFrequently keeps the canvas in CPU memory, so WebKit runs the cel filter in software: on the
    // GPU, bakes at fullscreen Retina size hung it until WindowServer died and macOS rebooted
    canvas.getContext('2d', { willReadFrequently: true })!.drawImage(img, 0, 0, w, h);
    const png = (await encode(canvas)) ?? (await new Promise<Blob | null>((done) => canvas.toBlob(done)));
    if (!png) throw new Error('canvas gave no bitmap');
    return png;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function rasterize(el: SVGGraphicsElement, box: DOMRect, scale: number): Promise<string> {
  const context = getComputedStyle(el.parentElement!);
  const inherited = INHERITED.map((p) => `${p}:${localRef(context.getPropertyValue(p))}`).join(';');
  const body = new XMLSerializer().serializeToString(el);
  const w = Math.ceil(box.width * scale - 0.01);
  const h = Math.ceil(box.height * scale - 0.01);
  const svg =
    `<svg xmlns="${SVG_NS}" width="${w}" height="${h}" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" preserveAspectRatio="none">` +
    `<defs>${collectDefs(body)}</defs><g style="${inherited}">${body}</g></svg>`;
  const key = await cacheKey(svg).catch(() => null);
  let png = await cached(key);
  if (!png) {
    png = await render(svg, w, h);
    keep(key, png);
  }
  const out = URL.createObjectURL(png);
  // decoded now, off the frame that swaps it in; WebKit otherwise decodes every bitmap inside that one frame
  const warm = new Image();
  warm.src = out;
  await warm.decode().catch(() => undefined);
  return out;
}

/**
 * Replaces the costly still shapes of a mounted scene with bitmaps rendered at the current screen
 * density. Returns a function that puts the live shapes back, and a promise that settles once the
 * bitmaps are in.
 */
export function bakeScene(svg: SVGSVGElement, isCurrent: () => boolean): { restore: () => void; done: Promise<void> } {
  const swapped: { el: SVGGraphicsElement; image: SVGImageElement; url: string }[] = [];
  const restore = () => {
    for (const s of swapped.splice(0)) {
      s.image.remove();
      s.el.style.removeProperty('display');
      URL.revokeObjectURL(s.url);
    }
  };

  const done = (async () => {
    const jobs = bakeable(svg).flatMap((el) => {
      const ctm = el.parentElement instanceof SVGGraphicsElement ? el.parentElement.getScreenCTM() : null;
      const b = boxInParent(el);
      if (!ctm || b.width * b.height === 0) return [];
      const pad = padFor(el);
      const scale = Math.hypot(ctm.a, ctm.b) * devicePixelRatio;
      let box = new DOMRect(b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2);
      // snapped to the device pixel grid: an off-grid bitmap gets resampled and its ink lines go soft.
      // a tilted or moving parent resamples it every frame anyway, so that one is left as is
      if (ctm.b === 0 && ctm.c === 0) {
        const toDevice = (v: number, offset: number) => (v * ctm.a + offset) * devicePixelRatio;
        const fromDevice = (d: number, offset: number) => (d / devicePixelRatio - offset) / ctm.a;
        const x0 = Math.floor(toDevice(box.x, ctm.e));
        const y0 = Math.floor(toDevice(box.y, ctm.f));
        const x1 = Math.ceil(toDevice(box.right, ctm.e));
        const y1 = Math.ceil(toDevice(box.bottom, ctm.f));
        box = new DOMRect(fromDevice(x0, ctm.e), fromDevice(y0, ctm.f), (x1 - x0) / scale, (y1 - y0) / scale);
      }
      return [{ el, box, scale }];
    });
    // one shape per frame: drawing a filtered shape into a bitmap is the expensive part, and a whole
    // scene at once held the main thread for over a second, so the next screen could not even mount
    const urls: (string | null)[] = [];
    for (const { el, box, scale } of jobs) {
      if (!isCurrent()) break;
      // a shape that will not rasterize stays live, flat: scenes.css never lets the page run its filter
      urls.push(await rasterize(el, box, scale).catch(() => null));
      await new Promise((next) => requestAnimationFrame(next));
    }
    // swapped in one go, so the scene never shows half its shapes baked
    jobs.forEach(({ el, box }, i) => {
      const url = urls[i];
      if (!url) return;
      if (!isCurrent() || !el.isConnected) {
        URL.revokeObjectURL(url);
        return;
      }
      const image = document.createElementNS(SVG_NS, 'image');
      image.setAttribute(MARK, '');
      image.setAttribute('href', url);
      image.setAttribute('x', String(box.x));
      image.setAttribute('y', String(box.y));
      image.setAttribute('width', String(box.width));
      image.setAttribute('height', String(box.height));
      image.setAttribute('preserveAspectRatio', 'none');
      el.before(image);
      el.style.display = 'none';
      swapped.push({ el, image, url });
    });
  })();

  return { restore, done };
}
