import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { ArrowSquareOut, GithubLogo } from "@phosphor-icons/react";
import { projects } from "../lib/github";

gsap.registerPlugin(ScrollTrigger);

export function WorkStickyStack() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const mm = gsap.matchMedia();
    // Desktop: pin + scale/opacity scrub
    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          ScrollTrigger.create({
            trigger: card,
            start: "top top",
            endTrigger: cards[cards.length - 1],
            end: "top top",
            pin: true,
            pinSpacing: false,
          });
          gsap.to(card, {
            scale: 0.92,
            opacity: 0.55,
            ease: "none",
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });
        });
      }, ref);
      return () => ctx.revert();
    });
    // Mobile: tetap interaktif — pin sticky native + scale halus, lebih ringan
    mm.add("(max-width: 767px)", () => {
      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          ScrollTrigger.create({
            trigger: card,
            start: "top top+=56",
            endTrigger: cards[cards.length - 1],
            end: "top top+=56",
            pin: true,
            pinSpacing: false,
          });
          gsap.to(card, {
            scale: 0.96,
            opacity: 0.85,
            ease: "none",
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top bottom",
              end: "top top+=56",
              scrub: true,
            },
          });
        });
      }, ref);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [reduce]);

  return (
    <section id="projects" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 md:px-6 md:pt-28">
      <h2 className="font-display max-w-[20ch] text-3xl font-semibold tracking-tighter text-zinc-950 md:text-4xl dark:text-zinc-50">
        Repo pilihan dari GitHub
      </h2>
      <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        Tiga repo asli milik Alif-Kopling. Semua link menuju GitHub dan demo
        live bila tersedia.
      </p>

      <div ref={ref} className="relative mt-8 md:mt-10">
        {projects.map((w) => (
          <div
            key={w.name}
            className="stack-card sticky top-14 flex min-h-[72dvh] items-center justify-center py-4 md:top-0 md:min-h-[100dvh] md:py-6"
          >
            <article className="card-soft grid w-full gap-5 border border-zinc-200 bg-white p-5 md:grid-cols-[0.9fr_1.1fr] md:gap-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <div>
                <p className="inline-block rounded-full border border-zinc-300 px-3 py-1 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                  {w.language}
                </p>
                <h3 className="font-display mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl dark:text-zinc-50">
                  {w.name}
                </h3>
                <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {w.desc}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href={w.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2440ff] underline-offset-4 hover:underline dark:text-[#8ea2ff]"
                  >
                    <GithubLogo size={16} weight="bold" />
                    Repo
                  </a>
                  {w.demoUrl && (
                    <a
                      href={w.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2440ff] underline-offset-4 hover:underline dark:text-[#8ea2ff]"
                    >
                      <ArrowSquareOut size={16} weight="bold" />
                      Demo
                    </a>
                  )}
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
                  >
                    Hubungi Saya
                  </a>
                </div>
              </div>
              <div>
                <img
                  src={w.preview}
                  alt={w.alt}
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="card-soft aspect-[1885/966] w-full object-cover"
                />
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
