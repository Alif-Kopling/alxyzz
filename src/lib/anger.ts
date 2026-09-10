import type * as THREE from "three";
import { playAngrySfx, sfxSettings } from "./sfx";

// Status ngambek Furina. `start` = performance.now()/1000 saat kepala diklik.
// CharModel baca tiap frame buat animasi geleng + manyun (~1.4 detik).
export const angerRef: { start: number } = { start: -10 };

// Posisi kepala di world + kamera, ditulis CharModel tiap frame.
// Dibaca deteksi klik buat proyeksi ke layar. `valid` false kalau
// tulang kepala tidak ketemu / belum ada frame yang jalan.
export const headTrack: {
  x: number;
  y: number;
  z: number;
  cam: THREE.Camera | null;
  valid: boolean;
} = { x: 0, y: 0, z: 0, cam: null, valid: false };

export function triggerAnger() {
  angerRef.start = performance.now() / 1000;
  playAngrySfx(sfxSettings.muted, sfxSettings.volume);
}
