import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import {
  Backpack,
  BookOpen,
  Briefcase,
  Code,
} from "@phosphor-icons/react";
import { Reveal } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

// Timeline story: garis vertikal kegambar ngikut scroll (scrub),
// tiap titik nyala satu-satu pas masuk viewport.
const items = [
  {
    stage: "SD",
    school: "SDN 1 Kalijati",
    desc: "Awal mula sekolah di Kalijati.",
    icon: Backpack,
  },
  {
    stage: "SMP",
    school: "SMPN 1 Kalijati",
    desc: "Lanjut ke SMP, masih di Kalijati.",
    icon: BookOpen,
  },
  {
    stage: "SMK",
    school: "SMKN 2 Subang",
    desc: "Pindah ke Subang untuk SMK — di sini mulai kenal dunia teknologi.",
    icon: Code,
  },
  {
    stage: "PKL",
    school: "PT Gothru Media Indonesia",
    desc: "Turun langsung ke dunia kerja lewat praktik kerja lapangan.",
    icon: Briefcase,
  },
];

export function Story() {
  const list = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !list.current) return;
    const ctx = gsap.context(() => {
      // garis ke-fill ngikut scroll
      gsap.fromTo(
        ".story-line-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list.current,
            start: "top 72%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        },
      );
      // tiap titik: masuk naik + nyala (dot ke-fill, kartu highlight)
      gsap.utils.toArray<HTMLElement>(".story-item").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
        ScrollTrigger.create({
          trigger: item,
          start: "top 68%",
          end: "bottom 45%",
          onToggle: (self) => item.classList.toggle("is-active", self.isActive),
        });
      });
    }, list);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section id="story" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 md:px-6 md:pb-28">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Story Saya
        </p>
        <h2 className="font-display mt-3 max-w-[20ch] text-3xl font-semibold tracking-tighter text-zinc-950 md:text-4xl dark:text-zinc-50">
          Timeline perjalanan saya
        </h2>
      </Reveal>

      <div ref={list} className="relative mt-10 md:mt-14">
        {/* rel garis: kiri di HP, tengah di desktop */}
        <div aria-hidden="true" className="absolute inset-y-0 left-[19px] w-px -translate-x-1/2 bg-zinc-200 md:left-1/2 dark:bg-zinc-800">
          <div className="story-line-fill h-full w-full origin-top bg-[#2440ff] dark:bg-[#8ea2ff]" />
        </div>

        <div className="grid gap-8 md:gap-12">
          {items.map((s, i) => {
            const left = i % 2 === 1;
            return (
              <article
                key={s.stage}
                className="story-item relative pl-14 md:grid md:grid-cols-2 md:gap-14 md:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-[19px] top-8 size-4 -translate-x-1/2 rounded-full border-2 border-[#2440ff] bg-white transition-all duration-300 md:left-1/2 dark:border-[#8ea2ff] dark:bg-zinc-950 [.is-active_&]:bg-[#2440ff] [.is-active_&]:shadow-[0_0_18px_rgb(36_64_255/0.7)] dark:[.is-active_&]:bg-[#8ea2ff] dark:[.is-active_&]:shadow-[0_0_18px_rgb(142_162_255/0.7)]"
                />
                <div
                  className={
                    left
                      ? "md:col-start-1 md:row-start-1 md:text-right"
                      : "md:col-start-2"
                  }
                >
                  <div className="card-soft inline-block w-full border border-zinc-200 bg-white p-6 text-left transition-colors duration-300 md:p-7 [.is-active_&]:border-[#2440ff]/60 dark:border-zinc-800 dark:bg-zinc-950 dark:[.is-active_&]:border-[#8ea2ff]/60">
                    <div className={`flex items-center gap-3 ${left ? "md:flex-row-reverse" : ""}`}>
                      <span className="rounded-full bg-[#2440ff]/10 p-2.5 text-[#2440ff] dark:bg-[#8ea2ff]/10 dark:text-[#8ea2ff]">
                        <s.icon size={22} weight="duotone" />
                      </span>
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        {s.stage}
                      </p>
                    </div>
                    <h3 className="font-display mt-4 text-xl font-semibold tracking-tight text-zinc-950 md:text-2xl dark:text-zinc-50">
                      {s.school}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Reveal className="mt-12 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/30 bg-white/20 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2440ff] dark:border-white/20 dark:text-zinc-100 dark:hover:bg-white/10"
        >
          Ceritain project kamu →
        </a>
      </Reveal>
    </section>
  );
}
