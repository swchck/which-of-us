import { ref } from 'vue';

export const inTauri = '__TAURI_INTERNALS__' in window;

export const isFullscreen = ref(!!document.fullscreenElement);
document.addEventListener('fullscreenchange', () => (isFullscreen.value = !!document.fullscreenElement));

export async function toggleFullscreen(): Promise<void> {
  // WKWebView in the desktop app has no page Fullscreen API, so ask the native window instead
  if (inTauri) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    const next = !(await win.isFullscreen());
    await win.setFullscreen(next);
    isFullscreen.value = next;
    return;
  }
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen().catch(() => undefined);
}

if (inTauri) {
  void import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => (isFullscreen.value = await getCurrentWindow().isFullscreen()));
}
