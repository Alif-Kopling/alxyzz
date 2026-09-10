import { lazy, Suspense, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import {
  Atom,
  BracketsCurly,
  PaintBrush,
  Lightning,
  Sparkle,
  PlugsConnected,
} from "@phosphor-icons/react";
import { moreRepos } from "../lib/github";
import { setAttention } from "../lib/attention";

const CharBackdrop = lazy(() =>
  import("./CharBackdrop").then((m) => ({ default: m.CharBackdrop })),
);

gsap.registerPlugin(ScrollTrigger);

const items = [
  { icon: Atom, title: "React", desc: "Komponen rapi, state jelas, struktur folder yang mudah dirawat." },
  { icon: BracketsCurly, title: "TypeScript", desc: "Tipe aman untuk props, API, dan form sejak awal." },
  { icon: PaintBrush, title: "Tailwind", desc: "Styling cepat dengan sistem spacing yang konsisten." },
  { icon: Lightning, title: "Vite", desc: "Dev cepat dan build ringan untuk deploy ke Vercel." },
  { icon: Sparkle, title: "Motion", desc: "Animasi entry dan reveal yang halus dan aman." },
  { icon: PlugsConnected, title: "API", desc: "Fetch data GitHub dan REST API dengan loading dan error state." },
];

export function CapabilitiesPan() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const progressRef = useRef(0);

  // Furina nengok ke kartu yang di-hover (dibaca CharModel tiap frame)
  const pointAttention = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const dx = ((r.left + r.width / 2) / window.innerWidth) * 2 - 1;
    setAttention(true, dx);
  };
  const clearAttention = () => setAttention(false);

  // Entry kartu: naik stagger sekali begitu section mau masuk.
  // Header sengaja STATIS (tidak dianimasikan) sesuai permintaan.
  useEffect(() => {
    if (reduce || !wrap.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".skill-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    // Sama kaya desktop: scroll vertikal nge-pin terus geser ke kiri sampai habis — jalan di mobile juga
    const ctx = gsap.context(() => {
      const distance = () => Math.max(track.current!.scrollWidth - window.innerWidth, 0);
      if (distance() <= 0) return;
      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      // Header STATIS: tidak ada parallax, tetap stay di layar selama pin.
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  // Ukur ulang pin setelah font + load kelar: lebar track yang diukur terlalu
  // awal (font swap) bisa sisa 1px → pin-spacer melebar → scrollbar samping.
  useEffect(() => {
    if (reduce) return;
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => undefined);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, [reduce]);

  return (
    <section
      id="skills"
      ref={wrap}
      className="relative z-20 -mt-[5vh] overflow-hidden rounded-t-[1.75rem] border-y border-zinc-200 bg-zinc-100/60 shadow-[0_-24px_80px_rgb(0_0_0/0.18)] md:rounded-t-[2.5rem] dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-[0_-24px_80px_rgb(0_0_0/0.55)]"
    >
      {/* progress horizontal: penuh saat track habis digeser */}
      <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-transparent">
        <div
          ref={bar}
          className="h-full w-full origin-left bg-[#2440ff] dark:bg-[#8ea2ff]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <Suspense fallback={null}>
        <CharBackdrop progressRef={progressRef} />
      </Suspense>
      <div className="relative z-10 w-full px-4 pt-12 md:px-6 md:pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          <span className="mr-2 inline-block rounded-full bg-[#2440ff] px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-[#8ea2ff] dark:text-zinc-950">
            02
          </span>
          Skills — lanjut dari project
        </p>
        <h2 className="font-display mt-3 max-w-[22ch] text-3xl font-semibold tracking-tighter text-zinc-950 md:text-4xl dark:text-zinc-50">
          Stack frontend untuk web modern
        </h2>
      </div>

      <div
        ref={track}
        data-skill-track
        className="relative z-10 flex h-[100dvh] items-center gap-4 px-4 will-change-transform md:gap-5 md:px-6"
      >
        {items.map((item) => (
          <article
            key={item.title}
            onMouseEnter={(e) => pointAttention(e.currentTarget)}
            onMouseMove={(e) => pointAttention(e.currentTarget)}
            onMouseLeave={clearAttention}
            className="skill-card card-soft group w-[82vw] shrink-0 border border-white/40 bg-white/55 p-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2 sm:w-[46vw] md:p-7 lg:w-[30vw] dark:border-white/15 dark:bg-zinc-950/55"
          >
            <item.icon
              size={26}
              weight="duotone"
              className="text-[#2440ff] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 dark:text-[#8ea2ff]"
            />
            <h3 className="font-display mt-4 text-lg font-semibold tracking-tight text-zinc-950 md:mt-5 md:text-xl dark:text-zinc-50">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 md:text-base dark:text-zinc-400">
              {item.desc}
            </p>
          </article>
        ))}

        <article
          onMouseEnter={(e) => pointAttention(e.currentTarget)}
          onMouseMove={(e) => pointAttention(e.currentTarget)}
          onMouseLeave={clearAttention}
          className="skill-card card-soft w-[82vw] shrink-0 border border-white/40 bg-white/55 p-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2 sm:w-[46vw] md:p-7 lg:w-[30vw] dark:border-white/15 dark:bg-zinc-950/55"
        >
          <h3 className="font-display text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Repo lain
          </h3>
          <ul className="mt-4 grid gap-3">
            {moreRepos.map((r) => (
              <li key={r.name}>
                <a
                  href={r.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-white/40 bg-white/40 px-4 py-3 text-sm font-semibold text-zinc-800 backdrop-blur-xl hover:border-zinc-900 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-zinc-300"
                >
                  {r.name}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
