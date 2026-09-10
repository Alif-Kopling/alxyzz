import { useSyncExternalStore } from "react";
import { PORTAL_SFX_URL } from "./sfx";

// Koordinator transisi portal dimensi -> Skills.
// - markDimensionEntry(): dipanggil pas user masuk terowongan portal.
//   Menandai eager (CharBackdrop mount lebih awal, offscreen) + mulai
//   load chunk 3D + glb di background. Idempotent.
// - ensureDimensionLoaded(): promise selesai kalau 3D siap ATAU timeout,
//   jadi checkpoint portal tidak pernah ngunci selamanya.
// -Version store biar komponen ikut re-render (pola sama kayak charPose).

const GLBS = ["/char.glb", "/chair.glb"];
const MIN_DWELL_MS = 1500;
const TIMEOUT_MS = 10000;

export const dimensionStore = {
  eager: false,
};

let _v = 0;
const _subs = new Set<() => void>();

function bump() {
  _v += 1;
  _subs.forEach((f) => {
    try {
      f();
    } catch {
      /* abaikan */
    }
  });
}

function subscribeDimension(cb: () => void) {
  _subs.add(cb);
  return () => {
    _subs.delete(cb);
  };
}

function getDimensionVersion() {
  return _v;
}

export function useDimensionVersion() {
  return useSyncExternalStore(subscribeDimension, getDimensionVersion, getDimensionVersion);
}

let _promise: Promise<void> | null = null;
let _ready = false;

export function isDimensionReady() {
  return _ready;
}

async function loadDimensionAssets(): Promise<void> {
  // 1. Chunk JS three/drei + komponen (download + parse).
  await import("../components/CharBackdrop");
  // 2. Daftarkan glb ke cache drei.
  const drei = await import("@react-three/drei");
  const preload = (
    drei as unknown as { useGLTF: { preload: (u: string) => void } }
  ).useGLTF.preload;
  for (const u of GLBS) {
    try {
      preload(u);
    } catch {
      /* abaikan */
    }
  }
  // 3. Hangatkan HTTP cache biar parse GLTFLoader tinggal jalan.
  //    SFX portal ikut dihangatkan (kecil, 150KB) biar bunyi tanpa jeda.
  await Promise.all(
    [...GLBS, PORTAL_SFX_URL].map((u) =>
      fetch(u, { credentials: "same-origin" })
        .then((r) => r.arrayBuffer())
        .catch(() => undefined),
    ),
  );
}

export function ensureDimensionLoaded(timeoutMs = TIMEOUT_MS): Promise<void> {
  if (_promise) return _promise;
  const dwell = new Promise<void>((r) => {
    window.setTimeout(r, MIN_DWELL_MS);
  });
  const timeout = new Promise<void>((r) => {
    window.setTimeout(r, timeoutMs);
  });
  _promise = (async () => {
    await Promise.race([
      (async () => {
        try {
          await loadDimensionAssets();
        } catch {
          /* gagal = timeout yang bicara */
        }
        await dwell;
      })(),
      timeout,
    ]);
    _ready = true;
    bump();
  })();
  return _promise;
}

export function markDimensionEntry() {
  if (!dimensionStore.eager) {
    dimensionStore.eager = true;
    bump();
  }
  void ensureDimensionLoaded();
}
