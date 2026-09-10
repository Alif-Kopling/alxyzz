import { motion, useReducedMotion } from "motion/react";
import {
  EnvelopeSimple,
  GithubLogo,
  Globe,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useNow } from "../hooks/useNow";
import { Dock } from "./Dock";
import { PlayerCard } from "./PlayerCard";
import { profile, projects } from "../lib/github";

// Hero scene: glassmorphism portfolio hero with live widgets and working links.
function buildCalendar(now: Date) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(first).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  return {
    cells,
    month: now.toLocaleDateString("en-US", { month: "long" }),
    today: now.getDate(),
  };
}

const rail = [
  { label: "Cari project", href: "#projects", icon: MagnifyingGlass },
  { label: `GitHub ${profile.username}`, href: profile.htmlUrl, icon: GithubLogo, external: true },
  { label: "Buka demo live", href: projects[0].demoUrl ?? projects[0].repoUrl, icon: Globe, external: true },
  { label: "Contact", href: "#contact", icon: EnvelopeSimple },
];

export function Hero({ onContact }: { onContact: () => void }) {
  const reduce = useReducedMotion();
  const now = useNow();
  const cal = buildCalendar(now);
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <section id="atas" className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden md:-mt-7 md:scroll-mt-7">
      <img
        src="/bg.png"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[#1a1025]/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_55%_at_70%_18%,rgb(255_138_61/0.22),transparent_42%),radial-gradient(ellipse_70%_50%_at_30%_10%,rgb(74_111_165/0.18),transparent_40%)]"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-4 md:px-6 md:pb-8 md:pt-24 hero-safe">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <ul
            aria-label="Shortcut"
            className="liquid-rail hidden w-fit flex-row items-center gap-2 p-2 sm:gap-1.5 sm:p-1.5 md:flex lg:flex-col"
          >
            {rail.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  aria-label={r.label}
                  title={r.label}
                  className="group flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white p-2.5 text-zinc-950 transition-all duration-200 hover:scale-110 hover:bg-[#8ea2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 sm:p-2"
                >
                  <r.icon size={17} weight="bold" />
                </a>
              </li>
            ))}
          </ul>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="liquid-panel min-w-0 flex-1 p-3 pb-6 sm:p-4 sm:pb-8 md:p-6"
          >
            <div className="min-w-0">
              <div className="grid items-stretch gap-3 md:grid-cols-[230px_1fr] md:gap-4 xl:grid-cols-[240px_1fr_320px]">
                <div className="xl:col-start-1 xl:row-start-1">
                  <div className="flex items-end gap-2 sm:gap-3">
                    <p className="font-mono text-[2rem] font-medium leading-none tracking-tight text-zinc-950 tabular-nums sm:text-5xl md:text-6xl dark:text-white">
                      {time}
                    </p>
                    <span className="mb-1 h-2 w-2 animate-pulse rounded-full bg-[#2440ff] shadow-[0_0_18px_rgb(36_64_255/0.8)] dark:bg-[#8ea2ff] sm:mb-2" />
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {dateLabel}
                  </p>
                  <div className="mt-3 hidden gap-1 font-mono text-xs text-zinc-600 md:grid dark:text-zinc-400">
                    <p>Total {profile.publicRepos} repos</p>
                    <p>
                      {profile.followers} followers, {profile.following} following
                    </p>
                    <p>
                      {profile.company} - {profile.location}
                    </p>
                  </div>
                </div>
                <div className="min-w-0 xl:col-start-3 xl:row-start-1">
                  <h1 className="font-display text-[1.5rem] leading-[1.1] font-semibold tracking-tighter text-zinc-950 sm:text-3xl md:text-4xl dark:text-white">
                    Hii there, I'm <span className="text-[#2440ff] dark:text-[#8ea2ff]">Alxyzz</span>
                  </h1>
                  <p className="mt-2 max-w-[48ch] text-[13px] leading-relaxed text-zinc-700 sm:text-base dark:text-zinc-300">
                    Tagline saya adalah "Berikan aku seporsi nasgor, maka aku akan membuatkan mu website luar biasa
                  </p>
                  <div className="mt-3 hidden flex-wrap items-center gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={onContact}
                      className="btn-primary hidden rounded-full bg-[#2440ff] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgb(36_64_255/0.28)] transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2440ff] sm:px-6 sm:py-2.5 dark:bg-[#8ea2ff] dark:text-[#09090b]"
                    >
                      Hubungi Saya
                    </button>
                    <a
                      href="#projects"
                      className="btn-secondary hidden rounded-full border border-zinc-700/30 bg-white/20 px-5 py-3 text-sm font-semibold text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/40 sm:px-6 sm:py-2.5 dark:border-white/20 dark:text-zinc-100 dark:hover:bg-white/10"
                    >
                      Lihat Project
                    </a>
                  </div>
                </div>

                <div className="hidden h-full flex-col justify-center rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm md:flex xl:col-start-1 xl:row-start-2 dark:border-white/10 dark:bg-zinc-950/90 dark:text-zinc-100">
                  <p className="text-center font-display text-lg font-semibold">{cal.month}</p>
                  <div aria-hidden="true" className="mx-auto my-2 h-px w-16 bg-zinc-200 dark:bg-zinc-700/80" />
                  <div className="grid grid-cols-7 gap-y-1.5 text-center font-mono text-[11px]">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span key={`${d}-${i}`} className="text-amber-600 dark:text-amber-300">
                        {d}
                      </span>
                    ))}
                    {cal.cells.map((day, i) =>
                      day === null ? (
                        <span key={`e-${i}`} />
                      ) : (
                        <span
                          key={day}
                          className={
                            day === cal.today
                              ? "mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#2440ff] font-bold text-white dark:bg-white dark:text-zinc-950"
                              : "text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                          }
                        >
                          {day}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <figure
                  aria-label="Foto portrait Alxyzz"
                  className="group relative min-h-[340px] overflow-hidden rounded-2xl sm:min-h-[380px] md:min-h-[440px] xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:mt-14 xl:min-h-[520px]"
                >
                  <img
                    src="/my-photo.png"
                    alt="Foto portrait Alxyzz"
                    loading="eager"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                  <figcaption className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-zinc-950/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                    Alxyzz - Frontend Developer
                  </figcaption>
                </figure>

                <div className="min-w-0 md:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-2">
                  <div className="hidden grid-cols-2 gap-3 md:grid">
                    <figure className="group overflow-hidden rounded-2xl">
                      <img
                        src="/photo-hero-1-mini.gif"
                        alt="Animasi mini hero"
                        width={400}
                        height={400}
                        loading="eager"
                        className="aspect-square w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105"
                      />
                    </figure>
                    <figure className="group overflow-hidden rounded-2xl">
                      <img
                        src="/furina-photo-mini-2-hero.jpg"
                        alt="Foto mini hero Furina"
                        width={400}
                        height={400}
                        loading="eager"
                        className="aspect-square w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105"
                      />
                    </figure>
                  </div>

                  <PlayerCard />

                  <a
                    href={`${profile.htmlUrl}?tab=repositories`}
                    className="mt-3 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/50 px-4 py-3 backdrop-blur-xl transition-transform hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2440ff] dark:border-white/10 dark:bg-zinc-900/60"
                  >
                    <span className="rounded-full bg-zinc-950 p-2 text-white dark:bg-zinc-100 dark:text-zinc-950">
                      <GithubLogo size={18} weight="bold" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {profile.publicRepos} total repos
                      </span>
                      <span className="block text-xs text-zinc-600 dark:text-zinc-400">
                        Lihat semua di GitHub
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <Dock />
      </div>
    </section>
  );
}
