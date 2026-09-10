import {
  BracketsCurly,
  EnvelopeSimple,
  FlowArrow,
  FolderSimple,
  GithubLogo,
  Trash,
} from "@phosphor-icons/react";
import { profile } from "../lib/github";

// Dock khusus hero pertama, gaya macOS: bilah gelap tembus pandang,
// ikon berupa tile warna, membesar saat hover. Statis di dalam hero.
// Setiap ikon punya fungsi nyata. Trash dipakai sebagai tombol kembali ke atas.
const items = [
  { label: "Projects", href: "#projects", icon: FolderSimple, tile: "bg-gradient-to-b from-[#3aa7ff] to-[#0a64ff]" },
  { label: "Skills", href: "#skills", icon: BracketsCurly, tile: "bg-gradient-to-b from-[#ffb340] to-[#ff7a00]" },
  { label: "Workflow", href: "#workflow", icon: FlowArrow, tile: "bg-gradient-to-b from-[#d07bff] to-[#8e24ff]" },
  { label: "Contact", href: "#contact", icon: EnvelopeSimple, tile: "bg-gradient-to-b from-[#3ddc74] to-[#0a9e4b]" },
];

function scrollTop() {
  document.getElementById("atas")?.scrollIntoView({ behavior: "smooth" });
}

export function Dock() {
  return (
    // Tanpa justify-center: ul pakai m-auto (safe-centering). justify-center + konten
    // overflow = kepotong kiri + area scroll melebar ke halaman. m-auto: muat = tengah,
    // sempit = rata kiri dan scroll internal saja.
    <nav
      aria-label="Dock navigasi"
      className="dock-safe mt-auto flex w-full max-w-full overflow-x-auto px-2 pt-3 [scrollbar-width:none] sm:pt-4 md:mt-6 [&::-webkit-scrollbar]:hidden"
    >
      <ul className="liquid-dock m-auto flex shrink-0 items-end gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
        {items.map((item) => (
          <li key={item.href} className="group relative">
            <a
              href={item.href}
              aria-label={item.label}
              className={`block rounded-[14px] p-2.5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_2px_8px_rgb(0_0_0/0.3)] transition-transform duration-150 hover:-translate-y-2 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 sm:rounded-[16px] sm:p-3.5 ${item.tile}`}
            >
              <item.icon size={26} weight="duotone" className="sm:hidden" />
              <item.icon size={32} weight="duotone" className="hidden sm:block" />
            </a>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-zinc-50 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {item.label}
            </span>
          </li>
        ))}

        <li className="group relative">
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`GitHub ${profile.username}`}
            className="block rounded-[14px] bg-gradient-to-b from-zinc-700 to-zinc-950 p-2.5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_8px_rgb(0_0_0/0.3)] transition-transform duration-150 hover:-translate-y-2 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 sm:rounded-[16px] sm:p-3.5"
          >
            <GithubLogo size={26} weight="duotone" className="sm:hidden" />
            <GithubLogo size={32} weight="duotone" className="hidden sm:block" />
          </a>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-zinc-50 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            GitHub
          </span>
        </li>

        <li aria-hidden="true" className="mx-1 h-8 w-px self-center bg-white/20 sm:h-10" />

        <li className="group relative">
          <button
            type="button"
            onClick={scrollTop}
            aria-label="Kembali ke atas"
            className="block rounded-[14px] bg-gradient-to-b from-zinc-500 to-zinc-800 p-2.5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_2px_8px_rgb(0_0_0/0.3)] transition-transform duration-150 hover:-translate-y-2 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 sm:rounded-[16px] sm:p-3.5"
          >
            <Trash size={26} weight="duotone" className="sm:hidden" />
            <Trash size={32} weight="duotone" className="hidden sm:block" />
          </button>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-zinc-50 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            Ke atas
          </span>
        </li>
      </ul>
    </nav>
  );
}
