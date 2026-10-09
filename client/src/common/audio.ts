import { ref, shallowRef } from 'vue';
import { DEFAULT_VOICE, speechPieces, speechSentences, speechText, TTS_INFO, VOICE_SAMPLE } from '../../../shared/catalog';
import type { BandInstrument, LocationId, TtsEngine } from '../../../shared/protocol';

const VOICE_KEY = 'kto.voice';
const VOLUME_KEY = 'kto.volume';
// a sentence the engine has not rendered by now is read by the system voice instead: a cold Vosk
// takes up to a minute to load, and a line that late would talk over the next phase
const NEURAL_WAIT_MS = 3500;

function readSaved(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export type VolumeKey = 'master' | 'music' | 'sfx' | 'voice';
type Volumes = Record<VolumeKey, number>;

/** Saved levels, each a 0..1 multiplier; anything missing or out of range stays at full. */
function readVolumes(): Volumes {
  const volumes: Volumes = { master: 1, music: 1, sfx: 1, voice: 1 };
  try {
    const saved = JSON.parse(readSaved(VOLUME_KEY) ?? '{}') as Partial<Record<VolumeKey, unknown>>;
    for (const key of Object.keys(volumes) as VolumeKey[]) {
      const v = saved[key];
      if (typeof v === 'number' && v >= 0 && v <= 1) volumes[key] = v;
    }
  } catch {
    // unreadable value: start from full volume
  }
  return volumes;
}

export type Theme = 'lobby' | 'final' | LocationId;

interface Song {
  bpm: number;
  /** Chord roots as MIDI notes; each chord lasts one bar. */
  roots: number[];
  /** Seventh-chord shapes as semitone offsets, one per bar. */
  shapes: number[][];
  lead: OscillatorType;
  swing: number;
}

const MAJ = [0, 4, 7, 11];
const MIN = [0, 3, 7, 10];
const SUS = [0, 5, 7, 10];

const SONGS: Record<Theme, Song> = {
  lobby: { bpm: 104, roots: [53, 50, 46, 48], shapes: [MAJ, MIN, MAJ, SUS], lead: 'triangle', swing: 0.12 },
  party: { bpm: 118, roots: [45, 41, 48, 43], shapes: [MIN, MAJ, MAJ, MAJ], lead: 'square', swing: 0 },
  camp: { bpm: 92, roots: [48, 45, 41, 43], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'triangle', swing: 0.18 },
  ocean: { bpm: 96, roots: [41, 45, 43, 48], shapes: [MAJ, MIN, SUS, MAJ], lead: 'sine', swing: 0.1 },
  city: { bpm: 110, roots: [45, 50, 43, 48], shapes: [MIN, MIN, MAJ, SUS], lead: 'triangle', swing: 0.16 },
  space: { bpm: 84, roots: [50, 46, 43, 45], shapes: [MIN, MAJ, MIN, SUS], lead: 'sine', swing: 0 },
  jungle: { bpm: 112, roots: [43, 48, 45, 41], shapes: [MAJ, SUS, MIN, MAJ], lead: 'triangle', swing: 0.22 },
  snow: { bpm: 88, roots: [52, 48, 50, 45], shapes: [MAJ, MAJ, MIN, SUS], lead: 'sine', swing: 0.08 },
  desert: { bpm: 100, roots: [45, 43, 41, 40], shapes: [MIN, MAJ, MAJ, MAJ], lead: 'triangle', swing: 0.2 },
  castle: { bpm: 78, roots: [45, 46, 43, 44], shapes: [MIN, MAJ, MIN, MAJ], lead: 'sawtooth', swing: 0 },
  arcade: { bpm: 132, roots: [48, 45, 41, 43], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'square', swing: 0 },
  beach: { bpm: 104, roots: [41, 48, 43, 45], shapes: [MAJ, MAJ, SUS, MIN], lead: 'triangle', swing: 0.14 },
  circus: { bpm: 138, roots: [48, 43, 45, 43], shapes: [MAJ, MAJ, MIN, MAJ], lead: 'square', swing: 0.06 },
  farm: { bpm: 96, roots: [43, 48, 50, 43], shapes: [MAJ, MAJ, SUS, MAJ], lead: 'triangle', swing: 0.2 },
  museum: { bpm: 72, roots: [50, 47, 52, 45], shapes: [MIN, MAJ, MIN, SUS], lead: 'sine', swing: 0 },
  plane: { bpm: 94, roots: [55, 52, 48, 50], shapes: [MAJ, MIN, MAJ, SUS], lead: 'sine', swing: 0.08 },
  restaurant: { bpm: 82, roots: [46, 51, 43, 48], shapes: [MAJ, MAJ, MIN, SUS], lead: 'triangle', swing: 0.28 },
  dino: { bpm: 120, roots: [45, 41, 43, 38], shapes: [MIN, MAJ, MAJ, MIN], lead: 'sawtooth', swing: 0.1 },
  pirate: { bpm: 108, roots: [45, 43, 41, 40], shapes: [MIN, MAJ, MAJ, MAJ], lead: 'triangle', swing: 0.24 },
  cinema: { bpm: 90, roots: [48, 44, 46, 43], shapes: [MAJ, MAJ, MAJ, SUS], lead: 'sine', swing: 0.06 },
  stadium: { bpm: 128, roots: [50, 48, 43, 45], shapes: [MAJ, MAJ, MAJ, SUS], lead: 'square', swing: 0 },
  train: { bpm: 116, roots: [43, 47, 48, 50], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'triangle', swing: 0.3 },
  school: { bpm: 100, roots: [48, 45, 50, 43], shapes: [MAJ, MIN, MIN, MAJ], lead: 'square', swing: 0.1 },
  ski: { bpm: 106, roots: [52, 47, 49, 45], shapes: [MAJ, MAJ, MIN, MAJ], lead: 'sine', swing: 0.12 },
  candy: { bpm: 122, roots: [52, 49, 45, 47], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'square', swing: 0.18 },
  lab: { bpm: 112, roots: [45, 46, 41, 40], shapes: [MIN, MAJ, MIN, MAJ], lead: 'sawtooth', swing: 0.08 },
  market: { bpm: 118, roots: [48, 53, 50, 55], shapes: [MAJ, MAJ, MIN, MAJ], lead: 'square', swing: 0.1 },
  zoo: { bpm: 108, roots: [43, 48, 45, 50], shapes: [MAJ, MAJ, MIN, SUS], lead: 'triangle', swing: 0.22 },
  japan: { bpm: 76, roots: [50, 45, 47, 52], shapes: [SUS, MIN, SUS, MIN], lead: 'sine', swing: 0 },
  fair: { bpm: 132, roots: [48, 52, 53, 55], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'square', swing: 0.16 },
  egypt: { bpm: 98, roots: [45, 46, 45, 43], shapes: [MIN, MAJ, MIN, MAJ], lead: 'sawtooth', swing: 0.12 },
  bowling: { bpm: 114, roots: [41, 45, 48, 46], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'triangle', swing: 0.26 },
  forest: { bpm: 104, roots: [50, 55, 52, 57], shapes: [MAJ, MAJ, MIN, MAJ], lead: 'sine', swing: 0.2 },
  future: { bpm: 128, roots: [45, 41, 48, 43], shapes: [MIN, MAJ, MAJ, MAJ], lead: 'sawtooth', swing: 0 },
  race: { bpm: 150, roots: [45, 48, 50, 43], shapes: [MIN, MAJ, MAJ, MAJ], lead: 'square', swing: 0 },
  pumpkin: { bpm: 100, roots: [40, 41, 43, 39], shapes: [MIN, MAJ, MIN, MAJ], lead: 'triangle', swing: 0.3 },
  sky: { bpm: 92, roots: [53, 57, 55, 60], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'sine', swing: 0.14 },
  dacha: { bpm: 108, roots: [48, 53, 55, 48], shapes: [MAJ, MAJ, MAJ, MIN], lead: 'triangle', swing: 0.22 },
  wedding: { bpm: 120, roots: [53, 58, 60, 53], shapes: [MAJ, MAJ, MAJ, MAJ], lead: 'sine', swing: 0.1 },
  karaoke: { bpm: 126, roots: [45, 41, 48, 43], shapes: [MIN, MAJ, MAJ, MAJ], lead: 'sawtooth', swing: 0.08 },
  gym: { bpm: 140, roots: [40, 40, 43, 38], shapes: [MIN, MIN, MAJ, MAJ], lead: 'square', swing: 0 },
  office: { bpm: 96, roots: [50, 47, 52, 45], shapes: [MAJ, MIN, MIN, MAJ], lead: 'triangle', swing: 0.15 },
  newyear: { bpm: 112, roots: [55, 52, 48, 50], shapes: [MAJ, MIN, MAJ, MAJ], lead: 'sine', swing: 0.2 },
  repair: { bpm: 116, roots: [43, 48, 50, 45], shapes: [MAJ, MAJ, SUS, MIN], lead: 'square', swing: 0.18 },
  clinic: { bpm: 98, roots: [53, 50, 46, 48], shapes: [MAJ, MIN, MAJ, SUS], lead: 'sine', swing: 0.12 },
  commute: { bpm: 118, roots: [50, 55, 52, 57], shapes: [MAJ, MAJ, MIN, MAJ], lead: 'square', swing: 0.14 },
  moving: { bpm: 112, roots: [50, 55, 52, 57], shapes: [MAJ, MAJ, MIN, SUS], lead: 'triangle', swing: 0.18 },
  feast: { bpm: 102, roots: [46, 51, 53, 43], shapes: [MAJ, MAJ, MAJ, MIN], lead: 'triangle', swing: 0.24 },
  roadtrip: { bpm: 116, roots: [45, 50, 52, 48], shapes: [MAJ, MAJ, SUS, MAJ], lead: 'triangle', swing: 0.14 },
  // a sly minor walk, more detective than horror
  mystery: { bpm: 92, roots: [38, 41, 36, 40], shapes: [MIN, MIN, MAJ, SUS], lead: 'triangle', swing: 0.22 },
  mine: { bpm: 110, roots: [40, 43, 45, 38], shapes: [MIN, MAJ, MIN, MAJ], lead: 'square', swing: 0.18 },
  volcano: { bpm: 96, roots: [40, 43, 38, 41], shapes: [MIN, MAJ, MIN, MAJ], lead: 'sawtooth', swing: 0.14 },
  final: { bpm: 126, roots: [48, 43, 45, 41], shapes: [MAJ, MAJ, MIN, MAJ], lead: 'sawtooth', swing: 0 },
};

function hz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

const SAMPLES = import.meta.glob<string>('../assets/sfx/*.m4a', { eager: true, query: '?url', import: 'default' });

export type Sfx = 'pop' | 'tick' | 'whoosh' | 'ding' | 'drumroll' | 'fanfare' | 'buzz' | 'swoosh';

/** Procedural soundtrack; sound effects play recorded samples and fall back to synthesis until those load. */
class AudioEngine {
  readonly speaking = ref(false);
  /** The host's own levels on top of the built-in mix; the narrator is not on the master bus, so it applies master itself. */
  readonly volumes = ref(readVolumes());
  musicOn = true;
  voiceOn = true;

  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noise!: AudioBuffer;
  private samples = new Map<string, AudioBuffer>();
  private song: Song = SONGS.lobby;
  private step = 0;
  private nextTime = 0;
  private voice: SpeechSynthesisVoice | null = null;
  /** Russian voices this browser offers, for the host's voice picker. */
  readonly voices = shallowRef<string[]>([]);
  /** Neural engines the server has installed; empty when it runs without them. */
  readonly engines = shallowRef<TtsEngine[]>([]);
  /** The picked narrator: `system:<voice name>` or `<engine>:<voice id>`. */
  readonly voiceChoice = ref('');
  private paused = false;
  /** «Замри!» turns the soundtrack up to dance to, and cuts it dead for the pause. */
  private dance: 'music' | 'freeze' | null = null;
  /** Also keeps the utterance alive: Chrome can collect it mid-sentence and never fire onend. */
  private utterance: SpeechSynthesisUtterance | null = null;
  /** Bumped on every new line, so a stale sentence that finishes loading never plays. */
  private line = 0;
  /** Told when the current line has been read out, or will never be. */
  private onDone: (() => void) | null = null;
  private playing: HTMLAudioElement | null = null;
  /** Where the narrator reports why a neural voice fell silent; the TV sends it to the server's log. */
  log: (text: string) => void = () => undefined;
  private queued: HTMLAudioElement[] = [];
  /** Players' names, which the voice says apart from the cached text around them. */
  names: string[] = [];

  /** Must run inside a user gesture: browsers keep audio locked until then. */
  unlock(): void {
    if (!this.ctx) {
      const ctx = new AudioContext();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.9 * this.volumes.value.master;
      this.master.connect(ctx.destination);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0.16;
      this.musicBus.connect(this.master);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.5 * this.volumes.value.sfx;
      this.sfxBus.connect(this.master);
      this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.nextTime = ctx.currentTime + 0.1;
      setInterval(() => this.schedule(), 50);
      this.loadSamples(ctx);
    }
    void this.ctx.resume();
    this.pickVoice();
    if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => this.pickVoice();
  }

  get unlocked(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  setTheme(theme: Theme): void {
    if (this.song === SONGS[theme]) return;
    this.song = SONGS[theme];
    this.step = 0;
  }

  setMusic(on: boolean): void {
    this.musicOn = on;
    this.applyMusicGain();
  }

  setVoice(on: boolean): void {
    this.voiceOn = on;
    if (!on) this.hush();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.applyMusicGain();
    if (paused) this.playing?.pause();
    else void this.playing?.play().catch(() => {});
    if (!('speechSynthesis' in window)) return;
    if (paused) speechSynthesis.pause();
    else speechSynthesis.resume();
  }

  setDance(stage: 'music' | 'freeze' | null): void {
    this.dance = stage;
    this.applyMusicGain();
  }

  /** Sets one level (0..1), remembers it on this machine and applies it to what is playing. */
  setVolume(key: VolumeKey, value: number): void {
    this.volumes.value = { ...this.volumes.value, [key]: value };
    try {
      localStorage.setItem(VOLUME_KEY, JSON.stringify(this.volumes.value));
    } catch {
      // private mode: the levels just last until the page reloads
    }
    if (this.ctx) {
      this.master.gain.value = 0.9 * this.volumes.value.master;
      this.sfxBus.gain.value = 0.5 * this.volumes.value.sfx;
    }
    this.applyMusicGain();
    if (this.playing) this.playing.volume = this.narratorVolume();
    if (this.utterance) this.utterance.volume = this.narratorVolume();
  }

  private narratorVolume(): number {
    return this.volumes.value.voice * this.volumes.value.master;
  }

  private applyMusicGain(): void {
    if (!this.ctx) return;
    // the dance song plays even with music switched off: the game cannot be played without it
    const level = this.paused ? 0 : this.dance === 'freeze' ? 0 : this.dance === 'music' ? 0.45 : !this.musicOn ? 0 : this.speaking.value ? 0.06 : 0.16;
    // the stop is the whole game, so it has to be sudden; everything else fades
    this.musicBus.gain.setTargetAtTime(level * this.volumes.value.music, this.ctx.currentTime, this.dance === 'freeze' ? 0.01 : 0.3);
  }

  private setSpeaking(on: boolean): void {
    this.speaking.value = on;
    this.applyMusicGain();
  }

  private pickVoice(): void {
    if (!('speechSynthesis' in window)) return;
    const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ru'));
    // WebKit lists some voices twice (standard and enhanced) under one name
    this.voices.value = [...new Set(voices.map((v) => v.name))];
    const saved = readSaved(VOICE_KEY) ?? '';
    // choices saved before neural voices existed are bare system voice names
    const system = saved.startsWith('system:') ? saved.slice(7) : saved.includes(':') ? '' : saved;
    const preferred = [...(system ? [system] : []), 'Milena', 'Yuri', 'Google русский', 'Katya', 'Irina', 'Pavel'];
    this.voice =
      preferred.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean) ?? voices[0] ?? null;
    // voices load late and again on voiceschanged; a neural voice picked meanwhile, saved or default, stays
    const neural = (v: string) => v.includes(':') && !v.startsWith('system:');
    if (neural(saved)) this.voiceChoice.value = saved;
    else if (!neural(this.voiceChoice.value)) this.voiceChoice.value = `system:${this.voice?.name ?? ''}`;
  }

  /** Asks the server which neural engines it can run; the picker offers only those. */
  async loadEngines(): Promise<void> {
    try {
      const res = await fetch('/api/tts');
      const body = (await res.json()) as { engines: { id: TtsEngine; installed: boolean; bundled: boolean }[] };
      this.engines.value = body.engines.filter((e) => e.installed || e.bundled).map((e) => e.id);
      this.log(`tts engines: ${JSON.stringify(body.engines)}; opus in webm: «${new Audio().canPlayType('audio/webm; codecs=opus')}»`);
      // the app ships the default voice with every line prebuilt; a TV that saved a voice since removed
      // from the catalog gets it back too, rather than the browser's own voice
      const saved = readSaved(VOICE_KEY);
      const gone = !!saved && !saved.startsWith('system:') && saved.includes(':') && this.neuralVoice() === null;
      if ((!saved || gone) && this.engines.value.includes(DEFAULT_VOICE.engine)) {
        this.voiceChoice.value = `${DEFAULT_VOICE.engine}:${DEFAULT_VOICE.voice}`;
      }
    } catch (err) {
      this.engines.value = [];
      this.log(`tts engines unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
    this.log(`narrator: ${this.voiceChoice.value || 'none'}`);
  }

  /** The neural voice in use, or null when the browser's own voice narrates. */
  neuralVoice(): { engine: TtsEngine; voice: string } | null {
    const [engine, voice] = this.voiceChoice.value.split(':') as [TtsEngine, string];
    if (!this.engines.value.includes(engine) || !voice || !Object.hasOwn(TTS_INFO[engine].voices, voice)) return null;
    return { engine, voice };
  }

  /** Switches the narrator to this voice, remembers it on this machine and says a line in it. */
  chooseVoice(choice: string): void {
    try {
      localStorage.setItem(VOICE_KEY, choice);
    } catch {
      // private mode: the choice just lasts until the page reloads
    }
    // pickVoice keeps a neural voice that is already on, so a switch to the system voice has to land first
    this.voiceChoice.value = choice;
    this.pickVoice();
    this.previewVoice();
  }

  /** Says the sample line in the current voice, so the host can hear it without picking again. */
  previewVoice(): void {
    this.speak(VOICE_SAMPLE);
  }

  private hush(): void {
    this.onDone = null;
    this.line++;
    this.utterance = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.playing?.pause();
    this.playing = null;
    this.dropQueued();
    this.setSpeaking(false);
  }

  /** Reads `text` out, cutting off whatever was playing; `done` fires once it is over or skipped. */
  speak(text: string | undefined, done?: () => void): void {
    this.hush();
    if (!text || !this.voiceOn) {
      done?.();
      return;
    }
    this.onDone = done ?? null;
    const neural = this.neuralVoice();
    if (neural) this.speakNeural(text, neural.engine, neural.voice);
    else this.speakSystem(text);
  }

  private finished(): void {
    const done = this.onDone;
    this.onDone = null;
    done?.();
  }

  private speakSystem(text: string): void {
    if (!('speechSynthesis' in window)) return this.finished();
    const u = new SpeechSynthesisUtterance(speechText(text));
    this.utterance = u;
    u.lang = 'ru-RU';
    if (this.voice) u.voice = this.voice;
    u.volume = this.narratorVolume();
    u.rate = 1.08;
    u.pitch = 1.1;
    // a cancelled utterance reports its end late, possibly after the next one has started
    u.onstart = () => {
      if (this.utterance === u) this.setSpeaking(true);
    };
    const end = () => {
      if (this.utterance !== u) return;
      this.setSpeaking(false);
      this.finished();
    };
    u.onend = end;
    u.onerror = end;
    speechSynthesis.speak(u);
  }

  /** Stops the sentences still downloading; left alone they would hold the engine's queue for the next line. */
  private dropQueued(): void {
    for (const clip of this.queued) {
      clip.removeAttribute('src');
      clip.load();
    }
    this.queued = [];
  }

  private speakNeural(text: string, engine: TtsEngine, voice: string): void {
    const line = this.line;
    const url = (s: string, cached = false) => `/tts/${engine}/${encodeURIComponent(voice)}?t=${encodeURIComponent(s)}${cached ? '&cached=1' : ''}`;
    const sentences = speechSentences(text);
    const pieces = sentences.map((s) => speechPieces(s, this.names));
    // the text around a name is prebuilt, so unless the whole sentence is cached the voice renders only
    // the name and says it between cached pieces, a little like a station announcement
    void Promise.all(
      sentences.map((s, i) =>
        pieces[i]!.length < 2
          ? Promise.resolve([url(s)])
          : fetch(url(s, true), { method: 'HEAD' }).then(
              (res) => {
                if (res.ok) return [url(s, true)];
                this.log(`said in pieces, not rendered whole yet: ${s}`);
                return pieces[i]!.map((p) => url(p));
              },
              () => pieces[i]!.map((p) => url(p)),
            ),
      ),
    ).then((urls) => {
      if (line !== this.line) return;
      // every clip is requested at once: the server renders them in order while the first plays
      const clips = urls.flatMap((list, i) =>
        list.map((src) => {
          const clip = new Audio(src);
          clip.preload = 'auto';
          clip.volume = this.narratorVolume();
          return { clip, rest: sentences.slice(i).join(' ') };
        }),
      );
      this.queued = clips.map((c) => c.clip);
      this.playClips(line, clips);
    });
  }

  private playClips(line: number, clips: { clip: HTMLAudioElement; rest: string }[]): void {
    const next = (i: number) => {
      if (line !== this.line) return;
      const item = clips[i];
      if (!item) {
        this.playing = null;
        this.setSpeaking(false);
        this.finished();
        return;
      }
      const { clip } = item;
      this.playing = clip;
      clip.onended = () => next(i + 1);
      // an engine that is down or too slow hands the rest of the line to the system voice
      let wait: ReturnType<typeof setTimeout> | undefined;
      const giveUp = (why: string) => {
        if (line !== this.line || this.playing !== clip) return;
        // a pause aborts the pending play() and resume starts it again, so this is no failing engine
        if (this.paused) {
          if (clip.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) wait = setTimeout(() => giveUp('not ready in time'), NEURAL_WAIT_MS);
          return;
        }
        this.log(`neural line handed to the system voice (${why}): ${decodeURIComponent(clip.src.split('?t=')[1] ?? clip.src)}`);
        clip.pause();
        this.playing = null;
        this.dropQueued();
        this.speakSystem(item.rest);
      };
      clip.onerror = () => giveUp(`media error ${clip.error?.code ?? '?'} ${clip.error?.message ?? ''}`.trim());
      this.setSpeaking(true);
      if (clip.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
        wait = setTimeout(() => giveUp('not ready in time'), NEURAL_WAIT_MS);
        clip.addEventListener('canplaythrough', () => clearTimeout(wait), { once: true });
      }
      if (!this.paused) void clip.play().catch((err: unknown) => giveUp(err instanceof Error ? `${err.name}: ${err.message}` : String(err)));
    };
    next(0);
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const sixteenth = 60 / this.song.bpm / 4;
    // a throttled background tab wakes us late; skip the missed notes instead of firing them all at once
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.2) {
      const swing = this.step % 2 === 1 ? this.song.swing * sixteenth : 0;
      if (this.musicOn && !this.paused) this.playStep(this.step, this.nextTime + swing, sixteenth);
      this.nextTime += sixteenth;
      this.step = (this.step + 1) % (16 * this.song.roots.length);
    }
  }

  private playStep(step: number, t: number, len: number): void {
    const bar = Math.floor(step / 16);
    const beat = step % 16;
    const root = this.song.roots[bar]!;
    const shape = this.song.shapes[bar]!;

    if (beat === 0) for (const off of shape) this.tone(hz(root + 12 + off), t, len * 15, 'sine', 0.05, 0.4, this.musicBus);
    if (beat % 4 === 0) this.tone(hz(root - 12), t, len * 3, 'triangle', 0.32, 0.01, this.musicBus);
    if (beat === 6 || beat === 14) this.tone(hz(root - 12 + 7), t, len * 1.5, 'triangle', 0.22, 0.01, this.musicBus);
    if (beat % 2 === 0) {
      const arp = shape[(beat / 2) % shape.length]!;
      const octave = beat % 8 === 6 ? 24 : 12;
      this.tone(hz(root + octave + arp), t, len * 1.6, this.song.lead, 0.05, 0.005, this.musicBus);
    }
    if (beat % 4 === 0) this.kick(t);
    if (beat % 8 === 4) this.hat(t, 0.18, 0.12);
    if (beat % 2 === 1) this.hat(t, 0.05, 0.03);
  }

  private tone(
    freq: number,
    t: number,
    dur: number,
    type: OscillatorType,
    level: number,
    attack: number,
    bus: AudioNode,
  ): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(level, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private kick(t: number, bus: AudioNode = this.musicBus): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain).connect(bus);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  private hat(t: number, level: number, dur: number, bus: AudioNode = this.musicBus, freq = 7000): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(bus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  private loadSamples(ctx: AudioContext): void {
    for (const [path, url] of Object.entries(SAMPLES)) {
      const name = path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then((data) => ctx.decodeAudioData(data))
        .then((buffer) => this.samples.set(name, buffer))
        .catch(() => undefined);
    }
  }

  /**
   * «Оркестр»: one hit of an instrument, `delay` seconds from now. The TV schedules the whole score
   * ahead this way, so the beat stays exact however busy the page's main thread gets.
   */
  /** A gain to route scheduled notes through, so a skip or a pause can silence them all at once. */
  group(): { node: AudioNode | undefined; stop: () => void } {
    const ctx = this.ctx;
    if (!ctx) return { node: undefined, stop: () => {} };
    const gain = ctx.createGain();
    gain.connect(this.sfxBus);
    return { node: gain, stop: () => gain.disconnect() };
  }

  note(instrument: BandInstrument, delay = 0, pitch = 0, out?: AudioNode): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.01 + Math.max(0, delay);
    const bus = out ?? this.sfxBus;
    switch (instrument) {
      case 'drum':
        this.kick(t, bus);
        break;
      case 'clap':
        this.hat(t, 0.35, 0.12, bus, 1500);
        break;
      case 'bell':
        this.tone(hz(84 + pitch), t, 0.45, 'sine', 0.22, 0.003, bus);
        this.tone(hz(96 + pitch), t, 0.25, 'sine', 0.08, 0.003, bus);
        break;
      case 'bass':
        this.tone(hz(40 + pitch), t, 0.28, 'sawtooth', 0.16, 0.01, bus);
        break;
    }
  }

  /** `semitones` shifts a sample's pitch, e.g. a ding that climbs with each answer. */
  sfx(name: Sfx, semitones = 0): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.01;
    const bus = this.sfxBus;
    const sample = this.samples.get(name);
    if (sample) {
      const src = ctx.createBufferSource();
      src.buffer = sample;
      src.playbackRate.value = 2 ** (semitones / 12);
      src.connect(bus);
      src.start(t);
      return;
    }
    switch (name) {
      case 'pop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(1100, t + 0.08);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        osc.connect(gain).connect(bus);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
      case 'tick':
        this.tone(1500, t, 0.06, 'square', 0.12, 0.002, bus);
        break;
      case 'ding':
        this.tone(hz(84), t, 0.5, 'sine', 0.3, 0.005, bus);
        this.tone(hz(91), t + 0.07, 0.6, 'sine', 0.22, 0.005, bus);
        break;
      case 'buzz':
        this.tone(110, t, 0.35, 'sawtooth', 0.15, 0.01, bus);
        this.tone(104, t, 0.35, 'sawtooth', 0.15, 0.01, bus);
        break;
      case 'whoosh':
      case 'swoosh': {
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2;
        const up = name === 'whoosh';
        filter.frequency.setValueAtTime(up ? 400 : 3000, t);
        filter.frequency.exponentialRampToValueAtTime(up ? 3000 : 400, t + 0.35);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.5, t + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        src.connect(filter).connect(gain).connect(bus);
        src.start(t);
        src.stop(t + 0.45);
        break;
      }
      case 'drumroll':
        for (let i = 0; i < 24; i++) this.hat(t + i * 0.05, 0.08 + i * 0.012, 0.06, bus, 1800);
        break;
      case 'fanfare':
        [72, 76, 79, 84].forEach((n, i) => this.tone(hz(n), t + i * 0.11, 0.5, 'square', 0.1, 0.01, bus));
        this.tone(hz(84), t + 0.5, 1.0, 'sawtooth', 0.08, 0.02, bus);
        this.tone(hz(88), t + 0.5, 1.0, 'square', 0.06, 0.02, bus);
        break;
    }
  }
}

export const audio = new AudioEngine();
