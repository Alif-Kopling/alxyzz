import { profile } from "../data/wanted";

// Pembatas hero dan berkas identitas: lakban garis berkas & status buronan.
// Full-bleed selebar viewport, dekoratif murni (aria-hidden).
export function SectionTape() {
  return (
    <div
      aria-hidden="true"
      className="relative left-1/2 w-screen -translate-x-1/2 border-y border-ink/25 bg-paper-deep select-none"
    >
      <div className="tape-stripes h-2 w-full opacity-70" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.22em] text-ink-soft uppercase md:px-6">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-stamp" />
          Garis batas berkas · ALX-017
        </span>
        <span className="hidden sm:inline">
          {profile.publicRepos} Repositori Terverifikasi · {profile.location}
        </span>
        <span className="text-stamp">Status: At Large</span>
      </div>
      <div className="tape-stripes h-2 w-full opacity-70" />
    </div>
  );
}
