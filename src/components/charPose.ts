import { useSyncExternalStore } from "react";

// Live pose state buat tuning Furina — panel geser ngubah objek ini,
// CharModel baca tiap frame + smoothing biar gerakan halus.
// Nilai default = pose duduk hasil tuning terakhir.

export type Axis3 = { x: number; y: number; z: number };

export type FaceState = {
  /** lirik atas-bawah */
  eyeX: number;
  /** lirik kiri-kanan */
  eyeY: number;
  /** merem manual 0..1 (ditambah ke kedip otomatis) */
  blink: number;
  /** lebar senyum (1 = default, 0 = datar) */
  smile: number;
  /** kedip otomatis nyala */
  auto: boolean;
};

export type ChairState = { x: number; y: number; z: number; yaw: number; scale: number };

export type PoseState = {
  group: { x: number; y: number; yaw: number; scale: number };
  chest: Axis3;
  hips: Axis3;
  head: Axis3;
  upperArmL: Axis3;
  elbowL: Axis3;
  wristL: Axis3;
  upperArmR: Axis3;
  elbowR: Axis3;
  wristR: Axis3;
  thighL: Axis3;
  kneeL: Axis3;
  ankleL: Axis3;
  thighR: Axis3;
  kneeR: Axis3;
  ankleR: Axis3;
  face: FaceState;
  chair: ChairState;
  /** boost ukuran bareng char+kursi (1.3 = +30%) */
  boost: number;
  /** kecepatan smoothing (1 = lambat, 20 = responsif) */
  smooth: number;
  /** skala micro-sway bawaan (0 = mati, 1 = normal) */
  micro: number;
};

export const defaultPose: PoseState = {
  group: { x: 0.1, y: -1.51, yaw: -0.53, scale: 1.32 },
  chest: { x: 0, y: 0.19, z: 0 },
  hips: { x: 0.13, y: 0, z: 0 },
  head: { x: 0.05, y: 0.05, z: 0.03 },
  upperArmL: { x: 1.5, y: 0.66, z: -0.74 },
  elbowL: { x: -0.53, y: -0.62, z: -1.5 },
  wristL: { x: -1, y: 0.35, z: 1 },
  upperArmR: { x: -0.38, y: 0.4, z: 0.1 },
  elbowR: { x: -0.93, y: -1.3, z: -0.05 },
  wristR: { x: -1, y: -1, z: -0.73 },
  thighL: { x: -0.14, y: 0, z: 0.3 },
  kneeL: { x: 0.02, y: -0.22, z: -0.03 },
  ankleL: { x: -0.02, y: -0.34, z: 0.11 },
  thighR: { x: -0.05, y: 0.64, z: -0.13 },
  kneeR: { x: 0, y: 0, z: 0 },
  ankleR: { x: -0.6, y: -0.24, z: -1 },
  face: { eyeX: 0.02, eyeY: -0.01, blink: 0, smile: 2, auto: true },
  chair: { x: -0.03, y: -1.06, z: -0.1, yaw: 0.3, scale: 1.24 },
  boost: 1.15,
  smooth: 8.5,
  micro: 1,
};

const KEY = "furina-pose-v3";

function clone(p: PoseState): PoseState {
  return JSON.parse(JSON.stringify(p)) as PoseState;
}

function load(): PoseState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(defaultPose);
    const parsed = JSON.parse(raw) as Partial<PoseState>;
    // merge dangkal per-field biar field baru tetap ada defaultnya
    return { ...clone(defaultPose), ...parsed };
  } catch {
    return clone(defaultPose);
  }
}

export function savePose(p: PoseState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* abaikan */
  }
}

export function resetPose(): PoseState {
  const fresh = clone(defaultPose);
  livePose.current = fresh;
  savePose(fresh);
  return fresh;
}

/** Singleton mutable — panel nulis, CharModel baca tiap frame. */
export const livePose: { current: PoseState } = {
  current: typeof window !== "undefined" ? load() : clone(defaultPose),
};

// Version store biar komponen React (kursi, boost) ikut re-render pas panel digeser.
let _v = 0;
const _subs = new Set<() => void>();

export function touchPose() {
  _v += 1;
  _subs.forEach((f) => {
    try {
      f();
    } catch {
      /* abaikan */
    }
  });
}

function subscribePose(cb: () => void) {
  _subs.add(cb);
  return () => {
    _subs.delete(cb);
  };
}

function getPoseVersion() {
  return _v;
}

export function usePoseVersion() {
  return useSyncExternalStore(subscribePose, getPoseVersion, getPoseVersion);
}
