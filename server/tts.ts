/**
 * Neural narrator voices. Each engine is a Python worker under `tts/<engine>/` with its own uv
 * environment (their dependencies do not get along in one), started on first use and kept alive.
 * Audio is cached per sentence on disk, so a line is synthesized once ever: the fixed narrator
 * lines are rendered ahead of time by `npm run tts:prebuild`, and only sentences with a player's
 * name or answer in them reach a worker during a party. The desktop app ships those prebuilt
 * sentences as a read-only bundle, so a machine without the engines still hears them.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, delimiter, join } from 'node:path';
import { createInterface } from 'node:readline';
import { stressed } from './stress.js';
import { TTS_INFO } from '../shared/catalog.js';
import { TTS_ENGINES, TTS_SENTENCE_MAX, type TtsEngine, type TtsTune } from '../shared/protocol.js';

export interface EngineStatus {
  id: TtsEngine;
  /** The engine's environment exists, so a request can start it. */
  installed: boolean;
  /** The bundle holds prebuilt sentences for it; anything else falls back to the system voice. */
  bundled: boolean;
  /** Voices the worker reported; empty until it has been started once. */
  voices: string[];
  ready: boolean;
}

interface Pending {
  resolve: () => void;
  reject: (err: Error) => void;
}

// a worker that has not loaded its model in this long is stuck; Vosk takes up to a minute cold
const START_TIMEOUT_MS = 5 * 60_000;
const SYNTH_TIMEOUT_MS = 90_000;

function readdirSafe(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function findUv(): string | undefined {
  // the desktop app starts us without the shell's PATH, so look where installers put uv
  const dirs = [...(process.env.PATH ?? '').split(delimiter), '/opt/homebrew/bin', '/usr/local/bin', join(homedir(), '.local/bin'), join(homedir(), '.cargo/bin')];
  const exe = process.platform === 'win32' ? 'uv.exe' : 'uv';
  return [process.env.KTO_UV, ...dirs.map((d) => join(d, exe))].find((p): p is string => !!p && existsSync(p));
}

/** How soon a sentence is needed: being said, coming up in this game, or worth having some day. */
export type TtsPriority = 'now' | 'soon' | 'idle';
const RANK: Record<TtsPriority, number> = { now: 0, soon: 1, idle: 2 };

interface Job {
  engine: TtsEngine;
  voice: string;
  text: string;
  out: string;
  rank: number;
  /** Callers with a signal still waiting for it. */
  waiting: number;
  /** Someone asked without a signal, so the render goes ahead whoever else gives up. */
  keep: boolean;
  started: boolean;
  promise: Promise<string>;
  resolve: (path: string) => void;
  reject: (err: Error) => void;
}

/** The shaping `voice` is always rendered with; undefined for a voice the catalog does not tune. */
function voiceTune(engine: TtsEngine, voice: string): TtsTune | undefined {
  return Object.hasOwn(TTS_INFO[engine].voices, voice) ? TTS_INFO[engine].voices[voice]!.tune : undefined;
}

/** Path of a sentence's audio relative to a cache or bundle root; a retuned voice gets fresh paths. */
export function ttsFile(engine: TtsEngine, voice: string, sentence: string): string {
  const tune = voiceTune(engine, voice);
  // the stress marks are part of what the engine hears, so marking a sentence renders it afresh
  const said = stressed(engine, sentence);
  const hash = createHash('sha1')
    .update(tune ? `${said}\0${JSON.stringify(tune)}` : said)
    .digest('hex')
    .slice(0, 20);
  return join(engine, voice || 'default', `${hash}.mp3`);
}

/** Path of a sentence's audio inside the shipped bundle, which holds Opus at half the size of the MP3s. */
export function bundledFile(engine: TtsEngine, voice: string, sentence: string): string {
  return ttsFile(engine, voice, sentence).replace(/\.mp3$/, '.webm');
}

/**
 * Where a voice's prebuilt sentences sit in a packed bundle, relative to it: every Opus file of the
 * voice back to back in `data`, and in `index` the byte range of each, keyed by its file's name.
 */
export function packFiles(engine: TtsEngine, voice: string): { data: string; index: string } {
  return { data: join(engine, `${voice}.pack`), index: join(engine, `${voice}.index.json`) };
}

/** Byte offset and length of a sentence inside a voice's pack. */
export type PackIndex = Record<string, [number, number]>;

/** A sentence's audio: a whole file, or the bytes `start`..`end` (inclusive) of a pack. */
export interface TtsAudio {
  file: string;
  type: 'audio/webm' | 'audio/mpeg';
  start?: number;
  end?: number;
}

/** How to start an engine's worker process. */
export interface Launch {
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
}

/** The runtime's interpreter: python.exe at the root on Windows, bin/python3.x elsewhere. */
function runtimePython(rt: string): string | undefined {
  const exe = join(rt, 'python', 'python.exe');
  if (existsSync(exe)) return exe;
  const name = readdirSafe(join(rt, 'python', 'bin')).find((f) => /^python3\.\d+$/.test(f));
  return name && join(rt, 'python', 'bin', name);
}

/** How to start `engine` from the shipped runtime at `rt`; undefined when it lacks the interpreter or the engine. */
export function runtimeLaunch(rt: string, engine: TtsEngine): Launch | undefined {
  const python = runtimePython(rt);
  if (!python || !existsSync(join(rt, engine, 'worker.py'))) return undefined;
  const env: Record<string, string> = {
    KTO_TTS_MODELS: join(rt, 'models'),
    PYTHONPATH: [join(rt, engine, 'site-packages'), rt].join(delimiter),
    // -I would also drop PYTHONPATH, so user site-packages are turned off by name instead
    PYTHONNOUSERSITE: '1',
    PYTHONHOME: join(rt, 'python'),
  };
  return { command: python, args: ['worker.py'], cwd: join(rt, engine), env };
}

/** Where engines live: the checkout's uv environments, and a relocatable runtime the desktop app ships. */
export interface TtsPlaces {
  /** tts/ of a checkout: one uv environment per engine, models and the cache. */
  dir?: string;
  /** Read-only prebuilt sentences shipped with the app. */
  bundle?: string;
  /** A standalone Python with some engines and their models, shipped with the app. */
  runtime?: string;
  /** Where renders go when there is no checkout to keep them in. */
  cache?: string;
}

class Worker {
  private child: ChildProcess | null = null;
  private starting: Promise<void> | null = null;
  private seq = 0;
  private readonly pending = new Map<number, Pending>();
  voices: string[] = [];
  ready = false;

  constructor(
    readonly engine: TtsEngine,
    private readonly launch: Launch,
  ) {}

  private start(): Promise<void> {
    this.starting ??= new Promise<void>((resolve, reject) => {
      const { command, args, cwd, env } = this.launch;
      // Windows Python reads stdin and writes stdout in the ANSI code page, which mangles Cyrillic names
      const child = spawn(command, args, { cwd, env: { ...process.env, ...env, PYTHONUNBUFFERED: '1', PYTHONUTF8: '1' }, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
      this.child = child;
      // killing it lets the exit handler clear `starting`, so the next request tries afresh
      const timer = setTimeout(() => child.kill(), START_TIMEOUT_MS);
      child.stderr!.on('data', (chunk: Buffer) => process.stderr.write(`[tts:${this.engine}] ${chunk.toString()}`));
      createInterface({ input: child.stdout! }).on('line', (line) => {
        let msg: { ready?: boolean; voices?: string[]; id?: number; ok?: boolean; error?: string };
        try {
          msg = JSON.parse(line) as typeof msg;
        } catch {
          return;
        }
        if (msg.ready) {
          this.ready = true;
          this.voices = msg.voices ?? [];
          clearTimeout(timer);
          resolve();
          return;
        }
        const job = msg.id === undefined ? undefined : this.pending.get(msg.id);
        if (!job) return;
        this.pending.delete(msg.id!);
        if (msg.ok) job.resolve();
        else job.reject(new Error(msg.error ?? 'synthesis failed'));
      });
      child.on('exit', (code) => {
        clearTimeout(timer);
        this.child = null;
        this.starting = null;
        this.ready = false;
        const err = new Error(`${this.engine} worker exited (${code})`);
        for (const job of this.pending.values()) job.reject(err);
        this.pending.clear();
        reject(err);
      });
      child.on('error', (err) => {
        clearTimeout(timer);
        this.child = null;
        this.starting = null;
        reject(err);
      });
      // a worker dying mid-write is reported by the exit handler, which fails the pending jobs
      child.stdin!.on('error', () => {});
    });
    return this.starting;
  }

  /** Starts the engine and loads its model now, so the first live line does not wait for it. */
  warm(): Promise<void> {
    return this.start();
  }

  /** Renders `text` into `out`; the caller makes sure only one render runs at a time. */
  async render(text: string, voice: string, out: string, tune?: TtsTune): Promise<void> {
    await this.start();
    const id = ++this.seq;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${this.engine} took too long`));
      }, SYNTH_TIMEOUT_MS);
      this.pending.set(id, {
        resolve: () => (clearTimeout(timer), resolve()),
        reject: (err) => (clearTimeout(timer), reject(err)),
      });
      this.child!.stdin!.write(`${JSON.stringify({ id, text, voice, out, tune })}\n`);
    });
  }

  stop(): void {
    this.child?.kill();
  }
}

export class Tts {
  private readonly workers = new Map<TtsEngine, Worker>();
  private readonly jobs = new Map<string, Job>();
  private readonly queues = new Map<TtsEngine, Job[]>();
  private readonly busy = new Set<TtsEngine>();

  private readonly dir: string | undefined;
  private readonly uv: string | undefined;
  private readonly bundle: string | undefined;
  private readonly runtime: string | undefined;
  private readonly cacheDir: string | undefined;
  private readonly packs = new Map<string, PackIndex | null>();

  private constructor(places: TtsPlaces, uv: string | undefined) {
    this.uv = uv;
    this.dir = places.dir;
    this.bundle = places.bundle;
    this.runtime = places.runtime;
    this.cacheDir = places.dir ? join(places.dir, 'cache') : places.cache;
  }

  /** Returns the service when any of `places` holds engines or prebuilt sentences; otherwise undefined. */
  static open(places: TtsPlaces): Tts | undefined {
    const uv = findUv();
    const has = (p: string | undefined, file: string) => (p && existsSync(join(p, file)) ? p : undefined);
    const found: TtsPlaces = {
      dir: uv ? has(places.dir, 'protocol.py') : undefined,
      bundle: has(places.bundle, '.'),
      runtime: has(places.runtime, 'protocol.py'),
      cache: places.cache,
    };
    if (!found.dir && !found.bundle && !found.runtime) return undefined;
    return new Tts(found, uv);
  }

  /** How to start `engine`: the checkout's uv environment first, then the shipped runtime. */
  private launch(engine: TtsEngine): Launch | undefined {
    if (this.dir && this.uv && existsSync(join(this.dir, engine, '.venv'))) {
      return { command: this.uv, args: ['run', '--quiet', '--frozen', 'python', 'worker.py'], cwd: join(this.dir, engine), env: { KTO_TTS_MODELS: join(this.dir, 'models') } };
    }
    return this.runtime && this.cacheDir ? runtimeLaunch(this.runtime, engine) : undefined;
  }

  installed(engine: TtsEngine): boolean {
    return this.launch(engine) !== undefined;
  }

  private bundled(engine: TtsEngine): boolean {
    return !!this.bundle && existsSync(join(this.bundle, engine));
  }

  status(): EngineStatus[] {
    return TTS_ENGINES.map((id) => {
      const w = this.workers.get(id);
      return { id, installed: this.installed(id), bundled: this.bundled(id), voices: w?.voices ?? [], ready: w?.ready ?? false };
    });
  }

  /** Loads the engine's model ahead of the first line; Vosk takes from seconds to a minute. */
  warm(engine: TtsEngine): Promise<void> {
    if (!this.installed(engine)) return Promise.resolve();
    return this.worker(engine).warm();
  }

  /** What a log archive says about narration: where the voices come from and how many lines each brought. */
  diagnostics(): object {
    const count = (dir: string) => readdirSafe(dir).filter((f) => !f.endsWith('.part')).length;
    const voices = Object.fromEntries(
      TTS_ENGINES.flatMap((e) => Object.keys(TTS_INFO[e].voices).map((v) => [`${e}:${v}`, { bundled: this.bundle ? (this.pack(e, v) ? Object.keys(this.pack(e, v)!).length : count(join(this.bundle, e, v))) : 0, cached: this.cacheDir ? count(join(this.cacheDir, e, v)) : 0 }])),
    );
    return { dir: this.dir ?? null, bundle: this.bundle ?? null, runtime: this.runtime ?? null, uv: !!this.uv, engines: this.status(), voices };
  }

  private worker(engine: TtsEngine): Worker {
    let w = this.workers.get(engine);
    if (!w) {
      w = new Worker(engine, this.launch(engine)!);
      this.workers.set(engine, w);
    }
    return w;
  }

  /** Where the audio for this sentence lives (or will live) in the cache. */
  path(engine: TtsEngine, voice: string, sentence: string): string {
    return join(this.cacheDir ?? '', ttsFile(engine, voice, sentence));
  }

  /** The sentence's audio when the bundle or the cache already holds it. */
  cached(engine: TtsEngine, voice: string, sentence: string): TtsAudio | undefined {
    const prebuilt = this.prebuilt(engine, voice, sentence);
    if (prebuilt) return prebuilt;
    const out = this.path(engine, voice, sentence);
    return this.cacheDir && existsSync(out) ? { file: out, type: 'audio/mpeg' } : undefined;
  }

  private prebuilt(engine: TtsEngine, voice: string, sentence: string): TtsAudio | undefined {
    if (!this.bundle) return undefined;
    const name = bundledFile(engine, voice, sentence);
    const pack = this.pack(engine, voice);
    if (!pack) {
      const file = join(this.bundle, name);
      return existsSync(file) ? { file, type: 'audio/webm' } : undefined;
    }
    const range = pack[basename(name)];
    if (!range) return undefined;
    return { file: join(this.bundle, packFiles(engine, voice).data), type: 'audio/webm', start: range[0], end: range[0] + range[1] - 1 };
  }

  /** The voice's pack index, or null when the bundle keeps that voice as loose files. */
  private pack(engine: TtsEngine, voice: string): PackIndex | null {
    const key = `${engine}:${voice}`;
    let index = this.packs.get(key);
    if (index === undefined) {
      const file = join(this.bundle!, packFiles(engine, voice).index);
      index = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as PackIndex) : null;
      this.packs.set(key, index);
    }
    return index;
  }

  /**
   * Resolves to the audio of `sentence` (MP3, or Opus from the bundle), rendering it first when neither the bundle nor the cache has
   * it. Renders run one at a time per engine, most urgent first. A render asked for with a `signal`
   * is dropped before it starts once every such caller has aborted, unless someone asked without one.
   */
  file(engine: TtsEngine, voice: string, sentence: string, opts: { priority?: TtsPriority; signal?: AbortSignal } = {}): Promise<TtsAudio> {
    if (sentence.length > TTS_SENTENCE_MAX) return Promise.reject(new Error('sentence too long'));
    const hit = this.cached(engine, voice, sentence);
    if (hit) return Promise.resolve(hit);
    if (!this.installed(engine)) return Promise.reject(new Error(`${engine} is not installed`));
    const out = this.path(engine, voice, sentence);
    let job = this.jobs.get(out);
    if (!job) {
      let resolve!: (path: string) => void;
      let reject!: (err: Error) => void;
      const promise = new Promise<string>((res, rej) => ((resolve = res), (reject = rej)));
      job = { engine, voice, text: sentence, out, rank: 2, waiting: 0, keep: false, started: false, promise, resolve, reject };
      this.jobs.set(out, job);
      this.queue(engine).push(job);
    }
    job.rank = Math.min(job.rank, RANK[opts.priority ?? 'now']);
    const signal = opts.signal;
    if (signal) {
      job.waiting++;
      const j = job;
      signal.addEventListener('abort', () => {
        j.waiting--;
        if (j.waiting > 0 || j.keep || j.started) return;
        this.jobs.delete(j.out);
        const q = this.queue(j.engine);
        q.splice(q.indexOf(j), 1);
        j.reject(new Error('cancelled'));
      });
    } else job.keep = true;
    this.pump(engine);
    return job.promise.then((file) => ({ file, type: 'audio/mpeg' }));
  }

  private queue(engine: TtsEngine): Job[] {
    let q = this.queues.get(engine);
    if (!q) this.queues.set(engine, (q = []));
    return q;
  }

  private pump(engine: TtsEngine): void {
    if (this.busy.has(engine)) return;
    const q = this.queue(engine);
    if (q.length === 0) return;
    let best = 0;
    for (let i = 1; i < q.length; i++) if (q[i]!.rank < q[best]!.rank) best = i;
    const job = q.splice(best, 1)[0]!;
    job.started = true;
    this.busy.add(engine);
    mkdirSync(join(job.out, '..'), { recursive: true });
    this.worker(engine)
      .render(stressed(engine, job.text), job.voice, job.out, voiceTune(engine, job.voice))
      .then(
        () => job.resolve(job.out),
        (err: unknown) => job.reject(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => {
        this.jobs.delete(job.out);
        this.busy.delete(engine);
        this.pump(engine);
      });
  }

  close(): void {
    for (const w of this.workers.values()) w.stop();
  }
}
