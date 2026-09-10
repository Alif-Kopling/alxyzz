import { Reveal } from "./Reveal";

const steps = [
  {
    verb: "Pahami",
    desc: "Baca kebutuhan, cek repo, dan sepakati scope tertulis.",
  },
  {
    verb: "Bangun",
    desc: "Komponen React, tipe TypeScript, dan styling Tailwind yang rapi.",
  },
  {
    verb: "Rilis",
    desc: "Build Vite, cek aksesibilitas, lalu deploy ke Vercel.",
  },
];

export function Process() {
  return (
    <section id="workflow" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 md:px-6 md:pb-28">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Workflow
        </p>
        <h2 className="font-display mt-3 max-w-[20ch] text-3xl font-semibold tracking-tighter text-zinc-950 md:text-4xl dark:text-zinc-50">
          Cara kerja yang sederhana
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.verb} delay={i * 0.06}>
            <div className="card-soft border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="font-display text-5xl font-semibold tracking-tighter text-[#2440ff] dark:text-[#8ea2ff]">
                {i + 1}
              </p>
              <h3 className="font-display mt-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                {s.verb}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {s.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
