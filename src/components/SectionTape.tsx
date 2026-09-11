// Pembatas hero dan berkas identitas: lakban garis berkas.
// Full-bleed selebar viewport, dekoratif murni (aria-hidden).
export function SectionTape() {
  return (
    <div
      aria-hidden="true"
      className="relative left-1/2 w-screen -translate-x-1/2 border-y border-ink/25 bg-paper-deep"
    >
      <div className="tape-stripes h-2 w-full opacity-70" />
      <p className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <span className="h-px flex-1 bg-ink/25" />
        <span className="font-mono text-[10px] font-bold tracking-[0.24em] text-ink-soft uppercase">
          Garis batas berkas · ALX-017
        </span>
        <span className="h-px flex-1 bg-ink/25" />
      </p>
      <div className="tape-stripes h-2 w-full opacity-70" />
    </div>
  );
}
