// Z index scale, single source of truth. No arbitrary z values elsewhere.
// 20: dropdown and mobile menu
// 30: horizontal pan pinned track helpers
// 50: desktop menu bar
// 60: grain overlay fixed pointer-events-none
export const Z = {
  menu: 20,
  pan: 30,
  menubar: 50,
  grain: 60,
} as const;
