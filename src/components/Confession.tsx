import { Reveal } from "./Reveal";

// Satu section quote full-width: snippet max 3 baris + atribusi lengkap.
export function Confession() {
  return (
    <section aria-label="Pengakuan" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <figure className="mx-auto max-w-3xl border-y-2 border-ink py-10 text-center md:py-14">
          <blockquote className="font-display text-2xl leading-snug font-extrabold tracking-tight text-ink md:text-3xl">
            “Berikan aku seporsi nasgor maka akan kutunjukkan cara membuat website.”
          </blockquote>
          <figcaption className="mt-5 font-mono text-xs tracking-[0.18em] text-ink-soft uppercase">
            Pengakuan resmi · Alxyzz, Frontend Developer
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
