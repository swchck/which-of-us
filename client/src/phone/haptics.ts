import { prefs } from './prefs';

/** Named moments of the game, each a vibration pattern in ms (on, off, on, ...). */
const PATTERNS = {
  tick: [12],
  hit: [40],
  turn: [60],
  win: [60, 40, 120],
  lose: [200],
  alert: [120, 60, 120],
} as const;

export type HapticEvent = keyof typeof PATTERNS;

export const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const TAP_GAP_MS = 50;
const IOS_MAX_TICKS = 3;

let lastTap = 0;
let label: HTMLLabelElement | null = null;

function iosTick(): void {
  if (!label) {
    // Safari 18+ taps the Taptic Engine when a `switch` checkbox is toggled by a user gesture; there is no Vibration API
    // (see github.com/tijnjh/ios-haptics). Rendered but clipped: a display:none input is not reliably toggled.
    label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    label.append(input);
    document.body.append(label);
  }
  label.click();
}

// the haptic only fires inside a real gesture; `isActive` covers the rest of the tap, this covers handlers on the event itself
let gestureNow = false;
if (IOS) {
  for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
    document.addEventListener(
      type,
      () => {
        gestureNow = true;
        setTimeout(() => (gestureNow = false), 0);
      },
      { capture: true, passive: true },
    );
  }
}

function inGesture(): boolean {
  return gestureNow || navigator.userActivation?.isActive === true;
}

/** A light tick for a UI tap; call it from the tap's own handler. */
export function tap(): void {
  if (!prefs.vibration) return;
  const now = performance.now();
  if (now - lastTap < TAP_GAP_MS) return;
  lastTap = now;
  if (IOS) iosTick();
  else navigator.vibrate?.(PATTERNS.tick);
}

/** A game moment; on iPhone it only lands when called within a tap, and long patterns shrink to a few ticks. */
export function event(kind: HapticEvent): void {
  if (!prefs.vibration) return;
  const pattern = PATTERNS[kind];
  if (!IOS) {
    navigator.vibrate?.(pattern);
    return;
  }
  if (!inGesture()) return;
  let at = 0;
  let ticks = 0;
  for (let i = 0; i < pattern.length && ticks < IOS_MAX_TICKS; i += 2) {
    if (at === 0) iosTick();
    else setTimeout(iosTick, at);
    ticks++;
    at += pattern[i]! + (pattern[i + 1] ?? 0);
  }
}

const TAPPABLE = 'button, a[href], label, summary, [role="button"]';

/** Ticks on every button press across the phone, so screens do not each wire their own. */
export function installTapHaptics(): void {
  // iOS needs the click itself to count as the gesture; elsewhere pointerdown is instant
  document.addEventListener(
    IOS ? 'click' : 'pointerdown',
    (ev) => {
      const el = (ev.target as Element | null)?.closest<HTMLElement>(TAPPABLE);
      if (el && !el.matches(':disabled, [aria-disabled="true"]')) tap();
    },
    { passive: true },
  );
}
