import { Reveal } from "./Reveal";

export function Quote() {
  return (
    <section aria-label="Prinsip kerja" className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
      <Reveal>
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote className="font-display text-2xl leading-snug font-medium tracking-tight text-zinc-950 md:text-3xl dark:text-zinc-50">
            “Berikan aku seporsi nasgor maka akan kutunjukkan cara membuat
            website.”
          </blockquote>
          <figcaption className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
            Alxyzz - Frontend Developer di pt.mikir kids
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
