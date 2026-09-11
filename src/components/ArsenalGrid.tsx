import { siReact } from "simple-icons";
import {
  BracketsCurly,
  Lightning,
  PaintBrush,
  PlugsConnected,
  Sparkle,
} from "@phosphor-icons/react";
import { moreRepos } from "../data/wanted";
import { Reveal } from "./Reveal";

const skills = [
  { icon: BracketsCurly, title: "TypeScript", desc: "Tipe aman untuk props, API, dan form sejak awal." },
  { icon: PaintBrush, title: "Tailwind", desc: "Styling cepat dengan sistem spacing yang konsisten." },
  { icon: Lightning, title: "Vite", desc: "Dev cepat dan build ringan untuk deploy ke Vercel." },
  { icon: Sparkle, title: "Motion", desc: "Animasi entry dan reveal yang halus dan aman." },
  { icon: PlugsConnected, title: "API", desc: "Fetch data GitHub dan REST API dengan loading dan error state." },
];

// Bento 7 sel = 9 unit di 3 kolom: tanpa sel kosong, tiap family layout beda dari section lain.
export function ArsenalGrid() {
  return (
    <section id="senjata" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <h2 className="font-display max-w-[16ch] text-3xl font-extrabold tracking-tighter text-ink uppercase md:text-4xl">
          Senjata &amp; Peralatan
        </h2>
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Dipakai di setiap kasus. Terbukti jalan, bukan sekadar daftar.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal className="sm:col-span-2 lg:row-span-2" delay={0}>
          <article className="card-dossier flex h-full flex-col bg-ink p-6 text-paper md:p-8">
            <svg
              viewBox="0 0 24 24"
              role="img"
              aria-label="React"
              fill="currentColor"
              className="h-14 w-14 md:h-20 md:w-20"
            >
              <title>{siReact.title}</title>
              <path d={siReact.path} />
            </svg>
            <p className="mt-6 font-mono text-[11px] font-bold tracking-[0.22em] text-paper/60">
              SENJATA UTAMA
            </p>
            <h3 className="font-display mt-2 text-2xl font-extrabold tracking-tight uppercase md:text-3xl">
              React
            </h3>
            <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-paper/75 md:text-base">
              Komponen rapi, state jelas, struktur folder yang mudah dirawat. Semua kasus di
              berkas dibangun di atas ini.
            </p>
          </article>
        </Reveal>

        {skills.map((s, i) => (
          <Reveal key={s.title} delay={(i % 3) * 0.06}>
            <article className="card-dossier group h-full border border-ink/20 bg-paper-card p-6 transition-transform duration-300 hover:-translate-y-1">
              <s.icon size={26} weight="duotone" className="text-stamp" />
              <h3 className="font-display mt-4 text-lg font-extrabold tracking-tight text-ink uppercase">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
            </article>
          </Reveal>
        ))}

        <Reveal className="sm:col-span-2" delay={0.06}>
          <article className="card-dossier h-full bg-stamp p-6 text-white md:p-7">
            <h3 className="font-display text-lg font-extrabold tracking-tight uppercase">
              Berkas lain
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {moreRepos.map((r) => (
                <li key={r.name}>
                  <a
                    href={r.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={r.desc}
                    className="block border border-white/50 px-4 py-3 font-mono text-sm font-bold break-all hover:bg-white/10"
                  >
                    {r.name}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
