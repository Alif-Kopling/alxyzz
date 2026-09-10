// Perhatian Furina: kartu skill mana yang lagi di-hover.
// Ditulis CapabilitiesPan (DOM events), dibaca CharModel tiap frame.
// dx = posisi kartu relatif tengah layar (-1 kiri .. 1 kanan).
export const attentionRef: {
  current: { active: boolean; dx: number };
} = {
  current: { active: false, dx: 0 },
};

export function setAttention(active: boolean, dx = 0) {
  attentionRef.current.active = active;
  attentionRef.current.dx = dx;
}
