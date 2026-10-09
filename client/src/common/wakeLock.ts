import { onBeforeUnmount, watch, type Ref } from 'vue';
import mp4 from './nosleep/nosleep.mp4?inline';
import webm from './nosleep/nosleep.webm?inline';

/** A muted, looping, never-attached video: playing media is what keeps the screen on where the Wake Lock API is missing. */
function createVideo(): HTMLVideoElement {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.disablePictureInPicture = true;
  video.src = video.canPlayType('video/mp4') ? mp4 : webm;
  return video;
}

/**
 * Keeps the screen on while `active` is true and the component is mounted. Browsers drop the lock
 * whenever the tab is hidden, so it is taken again when the tab comes back. The Wake Lock API needs a
 * secure context; with `video` on, a muted looping video stands in for it over plain http. Browsers only
 * let that video start from a tap, so it starts when `active` flips inside one and is retried on later taps.
 */
export function useWakeLock(active: Ref<boolean>, opts: { video?: boolean } = {}): void {
  let lock: WakeLockSentinel | null = null;
  let video: HTMLVideoElement | null = null;
  let pending = false;
  let disposed = false;

  function playVideo(): void {
    if (!opts.video || !active.value || disposed || document.visibilityState !== 'visible') return;
    video ??= createVideo();
    if (video.paused) video.play().catch(() => undefined);
  }

  async function take(): Promise<void> {
    if (!active.value || disposed || pending || document.visibilityState !== 'visible' || (lock && !lock.released)) return;
    if (!('wakeLock' in navigator)) return playVideo();
    pending = true;
    try {
      const taken = await navigator.wakeLock.request('screen');
      if (disposed || !active.value) void taken.release();
      else lock = taken;
    } catch {
      // refused on low battery or by policy; the video may still hold the screen
      playVideo();
    } finally {
      pending = false;
    }
  }

  function drop(): void {
    void lock?.release().catch(() => undefined);
    lock = null;
    video?.pause();
  }

  const onVisible = (): void => void take();
  const onTap = (): void => {
    if (!lock || lock.released) playVideo();
  };
  document.addEventListener('visibilitychange', onVisible);
  if (opts.video) for (const type of ['click', 'touchend']) document.addEventListener(type, onTap, { capture: true, passive: true });
  // sync, so a flip made by a tap handler (joining a room) still starts the video inside that tap
  watch(active, (on) => (on ? void take() : drop()), { immediate: true, flush: 'sync' });
  onBeforeUnmount(() => {
    disposed = true;
    document.removeEventListener('visibilitychange', onVisible);
    for (const type of ['click', 'touchend']) document.removeEventListener(type, onTap, { capture: true });
    drop();
  });
}
