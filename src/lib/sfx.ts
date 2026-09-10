// SFX sekali-putar (di luar playlist musik) — dipakai suara portal dimensi.

export const PORTAL_SFX_URL = "/audio/portal-sound.mp3";
export const ANGRY_SFX_URL = "/audio/angry.mp3";

/** Setting audio global (mute/volume musik) — disinkron AudioProvider. */
export const sfxSettings = { muted: false, volume: 0.9 };

export function syncSfxSettings(muted: boolean, volume: number) {
  sfxSettings.muted = muted;
  sfxSettings.volume = volume;
}

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

let _angry: HTMLAudioElement | null = null;

/**
 * Putar suara ngambek sekali. File: public/audio/angry.mp3.
 * Kalau file belum ada / diblokir browser = diam, animasi tetap jalan.
 */
export function playAngrySfx(muted: boolean, volume: number) {
  if (muted) return;
  if (typeof window === "undefined") return;
  try {
    if (!_angry) {
      _angry = new Audio();
      _angry.src = encodeURI(ANGRY_SFX_URL);
      _angry.preload = "auto";
    }
    _angry.volume = Math.max(0, Math.min(1, volume));
    _angry.currentTime = 0;
    const p = _angry.play();
    if (p) p.catch(() => undefined);
  } catch {
    /* abaikan */
  }
}
