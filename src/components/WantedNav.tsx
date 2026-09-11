import { useState } from "react";
import { List, X } from "@phosphor-icons/react";

const links = [
  { label: "Berkas", href: "#berkas" },
  { label: "Senjata", href: "#senjata" },
  { label: "Jejak", href: "#jejak" },
];

// Satu-satunya navigasi di page: bar 68px satu baris di desktop.
export function WantedNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-4 md:px-6"
      >
        <a href="#atas" className="flex shrink-0 items-center gap-2.5" aria-label="Ke atas">
          <img src="/mark-alxyzz.svg" alt="" aria-hidden="true" className="h-8 w-8 text-ink" />
          <span className="font-display text-sm font-extrabold tracking-tight text-ink">
            Alxyzz Archive
          </span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="#lapor"
            className="btn-wanted btn-3d hidden bg-stamp px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white sm:inline-flex"
          >
            Lapor / Rekrut
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="rounded p-2 text-ink hover:bg-ink/5 md:hidden"
          >
            {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink/15 bg-paper px-4 py-3 md:hidden">
          <ul className="grid gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-2 py-3 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-ink hover:bg-ink/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#lapor"
                onClick={() => setOpen(false)}
                className="btn-wanted btn-3d block bg-stamp px-4 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.18em] text-white"
              >
                Lapor / Rekrut
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
