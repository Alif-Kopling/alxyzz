import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { ArrowSquareOut, GithubLogo } from "@phosphor-icons/react";
import { caseFiles } from "../data/wanted";
import { Reveal } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

// Satu-satunya pin di page: tumpukan dossier kasus. Alasan: berkas dibuka satu-satu.
export function CaseStack() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section id="berkas" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 pt-16 md:px-6 md:pt-24">
        <Reveal>
          <h2 className="font-display max-w-[16ch] text-3xl font-extrabold tracking-tighter text-ink uppercase md:text-4xl">
            Berkas Kasus
          </h2>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-ink-soft">
            Tiga kasus selesai, bukti terlampir. Klik demo untuk olah TKP langsung.
          </p>
        </Reveal>
      </div>

      <div ref={ref} className="relative">
        {caseFiles.map((c) => (
          <div
            key={c.caseNo}
            className="stack-card sticky top-0 flex min-h-[100dvh] items-center justify-center px-4 py-24"
          >
            <article className="paper-raised card-dossier paper-lines grid w-full max-w-5xl overflow-hidden bg-paper-card md:grid-cols-2">
              <img
                src={c.preview}
                alt={c.alt}
                loading="lazy"
                className="h-44 w-full border-b border-ink/20 object-cover object-top sm:h-56 md:h-full md:min-h-[380px] md:border-r md:border-b-0"
              />
              <div className="flex min-w-0 flex-col p-5 md:p-8">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-ink-soft">
                    CASE {c.caseNo}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold tracking-[0.2em] ${
                      c.status === "DEPLOYED" ? "text-ink" : "text-stamp"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <h3 className="mt-3 font-mono text-xl font-bold tracking-tight break-all text-ink md:text-2xl">
                  {c.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft md:text-base">
                  {c.desc}
                </p>
                <p className="mt-3 font-mono text-xs tracking-[0.14em] text-ink-soft uppercase">
                  {c.language}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {c.demoUrl && (
                    <a
                      href={c.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-wanted inline-flex items-center gap-1.5 bg-ink px-4 py-2 text-xs font-semibold text-paper"
                    >
                      <ArrowSquareOut size={14} weight="bold" />
                      Buka Demo
                    </a>
                  )}
                  <a
                    href={c.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-wanted inline-flex items-center gap-1.5 border border-ink/30 px-4 py-2 text-xs font-semibold text-ink hover:bg-ink/5"
                  >
                    <GithubLogo size={14} weight="bold" />
                    Repo
                  </a>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
