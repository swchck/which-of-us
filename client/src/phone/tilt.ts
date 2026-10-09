/** Degrees of tilt that count as full speed. */
const FULL_TILT = 22;

type PermissionApi = { requestPermission?: () => Promise<'granted' | 'denied'> };

/** Orientation sensors exist only in secure contexts, so plain-HTTP LAN pages fall back to the joystick. */
export function sensorsPossible(): boolean {
  return window.isSecureContext && typeof DeviceOrientationEvent !== 'undefined';
}

// iOS remembers the answer for the page's lifetime, but the API offers no way to ask whether it was given
let granted = false;

/** iOS hides the sensors behind a permission prompt that must come from a tap, once per page load. */
export function needsPermission(): boolean {
  return !granted && sensorsPossible() && typeof (DeviceOrientationEvent as unknown as PermissionApi).requestPermission === 'function';
}

export async function requestSensors(): Promise<boolean> {
  const api = DeviceOrientationEvent as unknown as PermissionApi;
  if (!api.requestPermission) return true;
  try {
    granted = (await api.requestPermission()) === 'granted';
  } catch {
    granted = false;
  }
  return granted;
}

function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

export interface TiltWatcher {
  stop(): void;
  /** Takes the current pose as "level", so players can hold the phone however is comfortable. */
  recalibrate(): void;
}

/**
 * Reports tilt as a vector in screen space, relative to the pose at the first reading.
 * `onVector` receives x to the right and y toward the bottom of the screen, both in [-1, 1].
 */
export function watchTilt(onVector: (x: number, y: number) => void): TiltWatcher {
  let neutral: { beta: number; gamma: number } | null = null;
  let last: { beta: number; gamma: number } | null = null;

  const handler = (ev: DeviceOrientationEvent) => {
    if (ev.beta === null || ev.gamma === null) return;
    last = { beta: ev.beta, gamma: ev.gamma };
    if (!neutral) neutral = last;
    const db = ev.beta - neutral.beta;
    const dg = ev.gamma - neutral.gamma;
    const angle = screen.orientation?.angle ?? 0;
    let x = dg;
    let y = db;
    if (angle === 90) {
      x = db;
      y = -dg;
    } else if (angle === 270 || angle === -90) {
      x = -db;
      y = dg;
    } else if (angle === 180) {
      x = -dg;
      y = -db;
    }
    onVector(clamp(x / FULL_TILT), clamp(y / FULL_TILT));
  };

  // the old baseline was measured along the other axes, so a turned phone would peg the stick
  const reset = () => (neutral = null);
  window.addEventListener('deviceorientation', handler);
  screen.orientation?.addEventListener('change', reset);
  return {
    stop: () => {
      window.removeEventListener('deviceorientation', handler);
      screen.orientation?.removeEventListener('change', reset);
    },
    recalibrate: () => {
      neutral = last;
    },
  };
}

/** A jolt this big between two motion readings, in m/s², counts as one shake. */
const SHAKE_JOLT = 12;
/** One hand shakes at most about eight times a second; faster readings are the same shake ringing on. */
const SHAKE_GAP_MS = 120;

/** Calls `onShake` once per shake of the phone; returns the function that stops listening. */
export function watchShake(onShake: () => void): () => void {
  let seen = false;
  let lx = 0;
  let ly = 0;
  let lz = 0;
  let at = 0;
  const listener = (ev: DeviceMotionEvent) => {
    const a = ev.accelerationIncludingGravity;
    if (a?.x == null || a.y == null || a.z == null) return;
    const now = performance.now();
    if (seen && Math.hypot(a.x - lx, a.y - ly, a.z - lz) > SHAKE_JOLT && now - at > SHAKE_GAP_MS) {
      at = now;
      onShake();
    }
    seen = true;
    lx = a.x;
    ly = a.y;
    lz = a.z;
  };
  window.addEventListener('devicemotion', listener);
  return () => window.removeEventListener('devicemotion', listener);
}
