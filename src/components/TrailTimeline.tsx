import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { trail } from "../data/wanted";
import { Reveal } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

// Timeline vertikal: garis merah keisi ngikut scroll (scrub, tanpa pin).
export function TrailTimeline() {
  const list = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !list.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".trail-fill",
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
      gsap.utils.toArray<HTMLElement>(".trail-item").forEach((item) => {
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
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, list);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section id="jejak" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <h2 className="font-display max-w-[16ch] text-3xl font-extrabold tracking-tighter text-ink uppercase md:text-4xl">
          Jejak Pelarian
        </h2>
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Dari Kalijati sampai meja kerja. Empat titik, tanpa jeda kabur.
        </p>
      </Reveal>

      <div ref={list} className="relative mt-10 md:mt-14">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-[7px] w-[2px] -translate-x-1/2 bg-ink/15"
        >
          <div className="trail-fill h-full w-full origin-top bg-stamp" />
        </div>

        <div className="grid gap-6 md:gap-8">
          {trail.map((s, i) => (
            <article key={s.stage} className="trail-item relative pl-10">
              <span
                aria-hidden="true"
                className={`absolute top-6 left-[7px] size-4 -translate-x-1/2 rounded-full border-2 ${
                  i === trail.length - 1
                    ? "border-stamp bg-stamp"
                    : "border-ink bg-paper"
                }`}
              />
              <div className="card-dossier inline-block w-full max-w-2xl border border-ink/20 bg-paper-card p-6 md:p-7">
                <p className="font-mono text-xs font-bold tracking-[0.22em] text-stamp uppercase">
                  {s.stage}
                </p>
                <h3 className="font-display mt-2 text-xl font-extrabold tracking-tight text-ink md:text-2xl">
                  {s.place}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
