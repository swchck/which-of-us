import { watch } from 'vue';
import type { BandInstrument } from '../../../shared/protocol';
import { IOS } from './haptics';
import { prefs } from './prefs';

/** The TV is the main speaker, so the phone stays well under it. */
const LEVEL = 0.35;

let ctx: AudioContext | null = null;
let out: GainNode;
let noise: AudioBuffer;
let keepAlive: HTMLAudioElement | null = null;

function hz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** An endless silent clip: playing real media is what moves iOS off the ring switch's mute. */
function silentClip(): HTMLAudioElement {
  const rate = 8000;
  const bytes = new Uint8Array(44 + rate / 10).fill(128);
  const view = new DataView(bytes.buffer);
  const text = (at: number, s: string): void => [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, bytes.length - 8, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, rate / 10, true);
  const el = new Audio(URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
  el.loop = true;
  return el;
}

function holdPlaybackSession(on: boolean): void {
  // Safari 17+; not in lib.dom yet
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) session.type = on ? 'playback' : 'auto';
  else if (IOS) {
    keepAlive ??= silentClip();
    if (on) keepAlive.play().catch(() => undefined);
    else keepAlive.pause();
  }
}

/** Makes or wakes the audio context; call it from a tap, because browsers keep audio locked until one. */
export function unlockSound(): void {
  if (!prefs.sound) return;
  if (!ctx) {
    ctx = new AudioContext();
    out = ctx.createGain();
    out.gain.value = LEVEL;
    out.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate / 4, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  holdPlaybackSession(true);
  if (ctx.state !== 'running') void ctx.resume();
}

/** Any tap re-wakes a context the browser suspended, e.g. after a call or a locked screen. */
export function installSound(): void {
  for (const type of ['click', 'touchend', 'keydown']) {
    document.addEventListener(type, unlockSound, { capture: true, passive: true });
  }
  watch(
    () => prefs.sound,
    (on) => {
      if (!on) holdPlaybackSession(false);
    },
  );
}

/** Flips the pref; turning it on plays a chime inside the tap, which also proves the sound works. */
export function toggleSound(): void {
  prefs.sound = !prefs.sound;
  if (!prefs.sound) return;
  unlockSound();
  chime();
}

function tone(freq: number, delay: number, dur: number, type: OscillatorType, level: number): void {
  const c = ctx!;
  const t = c.currentTime + 0.01 + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(level, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function hat(level: number, dur: number, freq: number): void {
  const c = ctx!;
  const t = c.currentTime + 0.01;
  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = freq;
  const gain = c.createGain();
  gain.gain.setValueAtTime(level, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(out);
  src.start(t, Math.random() * 0.1);
  src.stop(t + dur + 0.02);
}

function ready(): boolean {
  return prefs.sound && ctx?.state === 'running';
}

/** «Твой ход»: two quick rising notes. */
export function chime(): void {
  if (!ready()) return;
  tone(hz(88), 0, 0.2, 'sine', 0.25);
  tone(hz(95), 0.09, 0.3, 'sine', 0.2);
}

/** Heard by every player at the same moment, so a role or a night starting never singles anyone out. */
export function secret(): void {
  if (!ready()) return;
  tone(hz(64), 0, 0.35, 'triangle', 0.22);
  tone(hz(71), 0.12, 0.45, 'triangle', 0.16);
}

/** «Оркестр»: one hit of an instrument from this phone, the same voices as the TV's score. */
export function bandNote(instrument: BandInstrument, pitch: number): void {
  if (!ready()) return;
  switch (instrument) {
    case 'drum': {
      const c = ctx!;
      const t = c.currentTime + 0.01;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 0.25);
      break;
    }
    case 'clap':
      hat(0.35, 0.12, 1500);
      break;
    case 'bell':
      tone(hz(84 + pitch), 0, 0.45, 'sine', 0.22);
      tone(hz(96 + pitch), 0, 0.25, 'sine', 0.08);
      break;
    case 'bass':
      tone(hz(40 + pitch), 0, 0.28, 'sawtooth', 0.16);
      break;
  }
}
