import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { ArrowDown, Asterisk } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Jembatan sinematik Project -> Skills.
 * - Pakai CSS sticky (bukan GSAP pin) biar nggak rebutan pin sama
 *   WorkStickyStack & CapabilitiesPan.
 * - Semua gerakan di-scrub mengikuti scroll: sheet mengembang,
 *   raksasa "SKILLS" outline -> fill, marquee jalan, progress penuh.
 */
export function ProjectSkillsBridge() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // 0.0 - 0.35: sheet kecil mengembang nutupin layar (efek kartu ngebuka)
      tl.fromTo(
        ".bridge-sheet",
        { scale: 0.92, y: 90, borderRadius: 28 },
        { scale: 1, y: 0, borderRadius: 0, duration: 0.35 },
        0,
      );
      // label kecil fade duluan
      tl.fromTo(".bridge-kicker", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.18 }, 0.02);
      tl.to(".bridge-kicker", { opacity: 0, y: -30, duration: 0.15 }, 0.32);

      // 0.25 - 0.75: kata SKILLS raksasa masuk: outline -> fill, scale up, geser dikit
      tl.fromTo(
        ".bridge-giant",
        { scale: 0.82, y: 120, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4 },
        0.22,
      );
      tl.fromTo(
        ".bridge-giant-fill",
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35 },
        0.4,
      );
      tl.to(".bridge-giant", { scale: 1.08, y: -60, duration: 0.3 }, 0.62);

      // marquee jalan terus + fade in
      tl.fromTo(".bridge-marquee", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.45);
      tl.to(".bridge-marquee", { opacity: 0, y: -40, duration: 0.15 }, 0.75);

      // 0.7 - 1: hint scroll + progress penuh, sheet siap disalip section Skills
      tl.fromTo(".bridge-hint", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.15 }, 0.6);
      tl.to(".bridge-hint", { opacity: 0, y: -24, duration: 0.12 }, 0.85);
      tl.fromTo(
        ".bridge-progress",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9 },
        0.05,
      );
      // background morph halus: terang -> tint skill
      tl.fromTo(
        ".bridge-bg",
        { opacity: 0 },
        { opacity: 1, duration: 0.9 },
        0,
      );
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  // Reduced motion: versi statis pendek, tanpa scroll-jacking tinggi
  if (reduce) {
    return (
      <section aria-label="Transisi ke skills" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          Lanjut ke — Skills
        </p>
      </section>
    );
  }

  const stack = ["React", "TypeScript", "Tailwind", "Vite", "Motion", "REST API"];

  return (
    <section
      id="skills-bridge"
      ref={root}
      aria-hidden="true"
      className="relative h-[160vh] md:h-[190vh]"
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
        {/* sheet yang mengembang — kasih kesan Project "kebuka" jadi Skills */}
        <div className="bridge-sheet absolute inset-0 border border-zinc-200 bg-[#fafafa] dark:border-zinc-800 dark:bg-[#09090b]">
          <div className="bridge-bg absolute inset-0 bg-zinc-100/80 opacity-0 dark:bg-zinc-900/50" />
          {/* garis grid halus */}
          <div
            className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 75%)",
            }}
          />
          {/* glow aksen */}
          <div className="absolute left-1/2 top-[38%] h-[42vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2440ff]/[0.10] blur-[90px] dark:bg-[#8ea2ff]/[0.12]" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center px-4 text-center">
          <p className="bridge-kicker inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600 backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-300">
            <Asterisk size={14} weight="bold" className="text-[#2440ff] dark:text-[#8ea2ff]" />
            Project kelar — masuk Skills
          </p>

          {/* Raksasa SKILLS: outline di belakang, fill di depan di-wipe pakai clip */}
          <div className="bridge-giant relative mt-6 select-none leading-[0.85]">
            <span
              aria-hidden="true"
              className="font-display block text-[24vw] font-semibold tracking-tighter text-transparent md:text-[17vw]"
            >
              SKILLS
            </span>
            <span
              aria-hidden="true"
              className="bridge-giant-fill font-display absolute inset-0 block text-[24vw] font-semibold tracking-tighter text-zinc-950 md:text-[17vw] dark:text-zinc-50"
              style={{ clipPath: "inset(100% 0% 0% 0%)" }}
            >
              SKILLS
            </span>
            {/* dark-mode stroke fix: timpa stroke terang via css var di bawah */}
            <span className="hidden" />
          </div>

          <div className="bridge-marquee mt-6 w-full overflow-hidden">
            <div className="bridge-marquee-inner flex w-max items-center gap-6 whitespace-nowrap">
              {[...stack, ...stack].map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="inline-flex items-center gap-6 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400"
                >
                  {s}
                  <Asterisk size={14} className="text-[#2440ff] dark:text-[#8ea2ff]" />
                </span>
              ))}
            </div>
          </div>

          <div className="bridge-hint mt-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <span className="grid size-9 place-items-center rounded-full border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
              <ArrowDown size={16} weight="bold" className="animate-bounce" />
            </span>
            Terus scroll — skill-ku geser ke kiri
          </div>
        </div>

        {/* progress bar bawah */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-zinc-200/70 dark:bg-zinc-800/70">
          <div className="bridge-progress h-full w-full origin-left bg-[#2440ff] dark:bg-[#8ea2ff]" />
        </div>
      </div>
    </section>
  );
}
