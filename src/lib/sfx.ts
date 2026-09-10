// SFX sekali-putar (di luar playlist musik) — dipakai suara portal dimensi.

export const PORTAL_SFX_URL = "/audio/portal-sound.mp3";

let _el: HTMLAudioElement | null = null;

function el(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!_el) {
    _el = new Audio();
    _el.src = encodeURI(PORTAL_SFX_URL);
    _el.preload = "auto";
  }
  return _el;
}

/** Putar suara portal sekali. Hormati mute; gagal (misal autoplay-block) = diam. */
export function playPortalSfx(muted: boolean, volume: number) {
  if (muted) return;
  const a = el();
  if (!a) return;
  try {
    a.volume = Math.max(0, Math.min(1, volume));
    a.currentTime = 0;
    const p = a.play();
    if (p) p.catch(() => undefined);
  } catch {
    /* abaikan */
  }
}
